<?php
require __DIR__.'/../../app/view.php';require __DIR__.'/../../app/leads.php';session_open();$c=catalog();$error='';
if($_SERVER['REQUEST_METHOD']==='POST'){
    check_csrf();try{
        $action=field('action');$id=field('id');
        if($action==='add'){
            if(!isset($c['items'][$id]))throw new DomainException('Эта позиция уже снята с публикации.');
            $n=qty(field('qty'));$sum=round((float)($_SESSION['cart'][$id]??0)+(float)$n,3);
            if($sum>9999999)throw new DomainException('Проверьте количество.');
            $_SESSION['cart'][$id]=(string)$sum;
            if(($_SERVER['HTTP_ACCEPT']??'')==='application/json'){header('Content-Type: application/json');echo json_encode(['count'=>count(lines($c))]);exit;}
            message('Позиция добавлена в заявку.');go(itemlink($id));
        }
        if(($action==='update'||$action==='send')&&isset($_POST['qty'])){
            $next=cart();foreach(($_POST['qty']??[]) as $k=>$v) if(isset($next[$k]))$next[$k]=qty($v);
            $_SESSION['cart']=$next;if($action==='update'){message('Количество сохранено.');go('/request/');}
        }
        if($action==='remove'){unset($_SESSION['cart'][$id]);go('/request/');}
        if($action==='send'){$ref=send_request($c);go('/request/?sent='.$ref);}
    }catch(DomainException $e){$error=$e->getMessage();if(($_SERVER['HTTP_ACCEPT']??'')==='application/json'){http_response_code(422);header('Content-Type: application/json');echo json_encode(['error'=>$error]);exit;}}
}
$sent=$_GET['sent']??'';page_top('Заявка на расчёт');?><section class="wrap inner"><?php crumbs(['Заявка']);if(is_string($sent)&&in_array($sent,$_SESSION['sent']??[],true)):?><div class="confirmation"><div class="kicker"><i></i>Заявка № <?=h($sent)?></div><h1>Заявка принята</h1><p class="lead">Менеджер свяжется с вами по указанным контактам.</p><a class="button dark" href="/catalog/">Вернуться в каталог</a></div><?php else:?>
<h1>Заявка на расчёт</h1><?php flash();if($error):?><p class="error" role="alert"><?=h($error)?></p><?php endif;$rows=lines($c);?><div class="request-layout"><div class="panel"><h2>Список позиций</h2><?php if(!$rows):?><p>Выберите товары в каталоге или прикрепите готовую спецификацию к заявке.</p><a class="text-link" href="/catalog/">Выбрать товары</a><?php else:?>

<?php foreach($rows as $id=>$row):?><div class="cart-row"><a href="<?=h(itemlink($id))?>"><?=h($row['name'])?></a><label><input form="spec" aria-label="Количество — <?=h($row['name'])?>" name="qty[<?=h($id)?>]" type="number" min=".001" step="any" value="<?=h($row['qty'])?>" required> <?=h($row['unit'])?></label><form method="post"><?=csrf()?><input type="hidden" name="action" value="remove"><input type="hidden" name="id" value="<?=h($id)?>"><button class="link-btn" aria-label="Удалить <?=h($row['name'])?>">Удалить</button></form></div><?php endforeach;?><button form="spec" formnovalidate name="action" value="update" class="button outline">Сохранить количество</button><?php endif;?></div>
<form id="spec" class="panel stack" method="post" enctype="multipart/form-data"><?=csrf()?><input type="hidden" name="key" value="<?=h($_SESSION['formkey']??=bin2hex(random_bytes(24)))?>"><h2>Данные для расчёта</h2>
<?php foreach(['name'=>['Ваше имя','name',120],'contact'=>['Телефон или email','off',180],'company'=>['Компания (необязательно)','organization',200]] as $key=>[$label,$ac,$max]):?><label><?=h($label)?><input name="<?=$key?>" maxlength="<?=$max?>" autocomplete="<?=$ac?>" value="<?=h(is_string($_POST[$key]??null)?$_POST[$key]:'')?>" <?=$key!=='company'?'required':''?>></label><?php endforeach;?>
<label>Что требуется<textarea name="note" rows="3" maxlength="3500" placeholder="Материалы, объём, пожелания к поставке"><?=h(is_string($_POST['note']??null)?$_POST['note']:'')?></textarea></label>
<label>Спецификация<input type="file" name="file" accept=".pdf,.xls,.xlsx"><small>PDF или Excel, до 8 МБ</small></label><label class="check"><input type="checkbox" name="consent" value="yes" required><span>Согласен на <a href="/privacy/" target="_blank" rel="noopener">обработку данных заявки</a></span></label><button class="button yellow" name="action" value="send">Отправить заявку</button></form></div><?php endif;?></section><?php page_end();?>
