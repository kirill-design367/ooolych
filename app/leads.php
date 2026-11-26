<?php
declare(strict_types=1);
require_once __DIR__.'/core.php';
function rate_key(string $scope): string {return hash('sha256',$scope.($_SERVER['REMOTE_ADDR']??''));}
function consume_limit(string $scope,int $seconds,int $limit): bool {
    $now=time();$pdo=db();
    $sql='INSERT INTO attempts(key,started,n) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET
        n=CASE WHEN started<=? THEN 1 ELSE n+1 END, started=CASE WHEN started<=? THEN excluded.started ELSE started END';
    $key=rate_key($scope);$pdo->beginTransaction();
    try{
        $pdo->prepare($sql)->execute([$key,$now,$now-$seconds,$now-$seconds]);
        $st=$pdo->prepare('SELECT n FROM attempts WHERE key=?');$st->execute([$key]);$n=$st->fetchColumn();$st->closeCursor();$pdo->commit();
    }catch(Throwable $e){$pdo->rollBack();throw $e;}
    $pdo->prepare('DELETE FROM attempts WHERE started<?')->execute([$now-86400]);return (int)$n<=$limit;
}
function specification(): ?string {
    $f=$_FILES['file']??null;if(!$f||$f['error']===UPLOAD_ERR_NO_FILE)return null;
    if($f['error']!==UPLOAD_ERR_OK||$f['size']>8*1024*1024||$f['size']<1)throw new DomainException('Приложите файл размером до 8 МБ.');
    $ext=strtolower(pathinfo($f['name'],PATHINFO_EXTENSION));$head=file_get_contents($f['tmp_name'],false,null,0,8);
    $valid=($ext==='pdf'&&str_starts_with($head,'%PDF-'))||($ext==='xls'&&$head==="\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1");
    if($ext==='xlsx'&&$head!==false&&str_starts_with($head,'PK')){
        $zip=new ZipArchive();if($zip->open($f['tmp_name'])===true){$valid=$zip->locateName('xl/workbook.xml')!==false&&$zip->locateName('[Content_Types].xml')!==false;$zip->close();}
    }
    if(!$valid)throw new DomainException('Поддерживаются документы PDF, XLS и XLSX. Проверьте формат файла.');
    return $ext;
}
function send_request(array $c): string {
    $key=field('key',64);
    if($key!==''&&isset($_SESSION['sent'][$key]))return $_SESSION['sent'][$key];
    if(!isset($_SESSION['formkey'])||!hash_equals($_SESSION['formkey'],$key))throw new DomainException('Обновите форму и отправьте её ещё раз.');
    $name=required('name','Имя',120);$contact=required('contact','Телефон или email',180);
    if(!filter_var($contact,FILTER_VALIDATE_EMAIL)&&(!preg_match('/^[+()\s\d-]+$/u',$contact)||!preg_match('/^\d{7,15}$/',preg_replace('/\D/','',$contact))))throw new DomainException('Укажите телефон с кодом города или email.');
    $company=field('company',200);$note=field('note',3500);$items=lines($c);$ext=specification();
    if(!$items&&!$ext&&$note==='')throw new DomainException('Добавьте позиции, прикрепите спецификацию или опишите, что требуется.');
    if(field('consent')!=='yes')throw new DomainException('Подтвердите согласие на обработку данных заявки.');
    if(!consume_limit('lead',900,12))throw new DomainException('Слишком много заявок. Попробуйте позже или свяжитесь с нами по телефону.');
    $id=strtoupper(bin2hex(random_bytes(5)));$dir=private_dir().'/specs';$attachment=null;
    if($ext){
        if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))throw new RuntimeException('Ошибка записи');
        $attachment=$id.'.'.$ext;if(!move_uploaded_file($_FILES['file']['tmp_name'],$dir.'/'.$attachment))throw new RuntimeException('Ошибка записи');
    }
    $details=compact('name','contact','company','note','items');$details['consent']='Обработка заявки, редакция 1';
    try {db()->prepare('INSERT INTO leads(id,token,created,details,attachment) VALUES(?,?,?,?,?)')->execute([$id,$key,gmdate('c'),json_encode($details,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$attachment]);}
    catch(Throwable $e){if($attachment)unlink($dir.'/'.$attachment);throw $e;}
    $_SESSION['sent'][$key]=$id;$_SESSION['sent']=array_slice($_SESSION['sent'],-8,null,true);unset($_SESSION['formkey'],$_SESSION['cart']);
    if(getenv('LUCH_MAIL_ENABLED')==='1'&&function_exists('mail')){
        $accepted=@mail(EMAIL,'=?UTF-8?B?'.base64_encode('Луч — заявка '.$id).'?=',"Новая заявка № ".$id.". Откройте раздел «Заявки» в панели управления.", "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8");
        if($accepted)db()->prepare('UPDATE leads SET notified=1 WHERE id=?')->execute([$id]);
    }
    return $id;
}
