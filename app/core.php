<?php
declare(strict_types=1);
require_once __DIR__.'/seed.php';
const COMPANY = 'ООО «Луч»';
const PHONE = '+7 (920) 175-14-46';
const TEL = '+79201751446';
const EMAIL = '1751416@internet.ru';
const ADDRESS = '142106, Московская область, г. Подольск, тер. СНТ № 4 ПЭМЗ Красная Горка, д. 4, стр. 1, ком. 4';
function private_dir(): string {
    $path=getenv('LUCH_DATA_DIR') ?: dirname(__DIR__).'/var';
    if (!is_dir($path) && !mkdir($path,0700,true) && !is_dir($path)) throw new RuntimeException('Хранилище недоступно');
    return $path;
}
function db(): PDO {
    static $pdo; if ($pdo) return $pdo;
    $pdo=new PDO('sqlite:'.private_dir().'/luch.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA busy_timeout=5000');
    $pdo->exec("CREATE TABLE IF NOT EXISTS catalog (id INTEGER PRIMARY KEY, draft TEXT NOT NULL, live TEXT NOT NULL, rev INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL, created TEXT NOT NULL, details TEXT NOT NULL, attachment TEXT, notified INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, started INTEGER NOT NULL, n INTEGER NOT NULL)");
    if (!$pdo->query('SELECT 1 FROM catalog WHERE id=1')->fetchColumn()) {
        $seed=json_encode(initial_catalog(),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        $pdo->prepare('INSERT OR IGNORE INTO catalog(id,draft,live) VALUES(1,?,?)')->execute([$seed,$seed]);
    }
    return $pdo;
}
function catalog(bool $draft=false): array {
    return json_decode((string)db()->query($draft?'SELECT draft FROM catalog WHERE id=1':'SELECT live FROM catalog WHERE id=1')->fetchColumn(),true,512,JSON_THROW_ON_ERROR);
}
function session_open(): void {
    if(session_status()===PHP_SESSION_ACTIVE) return;
    session_name('luchsid');
    ini_set('session.use_strict_mode','1');
    session_set_cookie_params(['path'=>'/','secure'=>isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
    session_start();
}
function h(mixed $s): string {return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function field(string $key,int $max=200): string {
    $value=$_POST[$key]??''; if(!is_string($value)||mb_strlen($value)>$max) throw new DomainException('Проверьте длину введённых данных.');
    return trim($value);
}
function required(string $key,string $label,int $max=200): string {
    $s=field($key,$max); if($s==='') throw new DomainException('Заполните поле «'.$label.'».'); return $s;
}
function token(): string {session_open();return $_SESSION['csrf']??=bin2hex(random_bytes(24));}
function csrf(): string {return '<input type="hidden" name="csrf" value="'.h(token()).'">';}
function check_csrf(): void {
    if (!is_string($_POST['csrf']??null)||!hash_equals(token(),$_POST['csrf'])) {http_response_code(403);exit('Сессия формы истекла. Обновите страницу.');}
}
function go(string $path): never { header('Location: '.$path,true,303); exit; }
function image_url(string $name): string {
    if(in_array($name,['sheets.webp','insulation.webp','electrical.webp','cable.webp'],true)) return '/assets/'.$name;
    if(preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/D',$name)) return '/media.php?f='.$name;
    return '';
}
function cart(): array {session_open();return $_SESSION['cart']??[];}
function lines(array $c): array {
    $lines=[];foreach(cart() as $id=>$qty) if(isset($c['items'][$id])) {
        $p=$c['items'][$id];$lines[$id]=['name'=>$p['name'],'unit'=>$p['unit'],'qty'=>$qty,'price'=>$p['price']];
    }
    return $lines;
}
function qty(mixed $raw): string {
    if(!is_scalar($raw)||!preg_match('/^\d{1,7}(?:[.,]\d{1,3})?$/D',(string)$raw)) throw new DomainException('Введите количество больше нуля, до трёх знаков после запятой.');
    $n=str_replace(',','.',(string)$raw);if((float)$n<=0) throw new DomainException('Количество должно быть больше нуля.');
    return (string)(float)$n;
}
function message(string $s): void {session_open();$_SESSION['flash']=$s;}
function flash(): void {session_open();if(isset($_SESSION['flash'])){echo '<p class="notice" role="status">'.h($_SESSION['flash']).'</p>';unset($_SESSION['flash']);}}
function asset_file(string $dir): string {
    $f=$_FILES['image']??null;
    if(!$f||($f['error']??UPLOAD_ERR_NO_FILE)===UPLOAD_ERR_NO_FILE)return '';
    if($f['error']!==UPLOAD_ERR_OK||$f['size']>6*1024*1024)throw new DomainException('Изображение должно быть до 6 МБ.');
    $info=@getimagesize($f['tmp_name']);$ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$info['mime']??'']??null;
    if(!$ext||$info[0]*$info[1]>32000000)throw new DomainException('Загрузите изображение JPEG, PNG или WebP.');
    $name=bin2hex(random_bytes(16)).'.'.$ext;
    if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))throw new RuntimeException('Ошибка записи');
    if(!move_uploaded_file($f['tmp_name'],$dir.'/'.$name))throw new RuntimeException('Ошибка записи');
    return $name;
}
