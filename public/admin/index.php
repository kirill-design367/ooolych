<?php
declare(strict_types=1);
require __DIR__.'/../../app/view.php';require __DIR__.'/../../app/admin.php';
session_open();header('Cache-Control: no-store');header('X-Robots-Tag: noindex, nofollow');$error='';
if($_SERVER['REQUEST_METHOD']==='POST'){
    check_csrf();try{
        $action=field('action');
        if($action==='login'){
            if(!consume_limit('admin',600,12))throw new DomainException('Слишком много попыток. Попробуйте через 10 минут.');
            $hash=admin_hash();
            $passwordMatches=$hash!=='' && password_verify(field('password',1024),$hash);
            if(!$passwordMatches || field('username',80)!==ADMIN_LOGIN)throw new DomainException('Войти не удалось.');
            session_regenerate_id(true);$_SESSION['editor']=time();$_SESSION['csrf']=bin2hex(random_bytes(24));go('/admin/');
        }
        if(!logged_in())throw new DomainException('Войдите в панель.');
        if($action==='logout'){unset($_SESSION['editor'],$_SESSION['csrf']);session_regenerate_id(true);go('/admin/');}
        catalog_change(revision(),$action);
    }catch(DomainException $e){$error=$e->getMessage();}
}
if(logged_in())$_SESSION['editor']=time();
if(isset($_GET['file'])){
    if(!logged_in()){http_response_code(403);exit;}
    $s=db()->prepare('SELECT attachment FROM leads WHERE id=?');$s->execute([is_string($_GET['file'])?$_GET['file']:'']);$file=$s->fetchColumn();
    if(!$file||!is_file($p=private_dir().'/specs/'.$file)){http_response_code(404);exit;}
    header('X-Content-Type-Options: nosniff');header('Content-Type: application/octet-stream');header('Content-Disposition: attachment; filename="spec-'.$file.'"');readfile($p);exit;
}
$tabs=['items'=>'Товары','categories'=>'Категории','groups'=>'Подкатегории','preview'=>'Предпросмотр','leads'=>'Заявки'];
$tab=is_string($_GET['tab']??null)&&isset($tabs[$_GET['tab']])?$_GET['tab']:'items';
page_top('Управление каталогом');?><section class="wrap inner"><div class="section-head"><h1>Панель управления</h1><?php if(logged_in()):?><form method="post"><?=csrf()?><button class="button outline" name="action" value="logout">Выйти</button></form><?php endif;?></div><?php flash();if($error):?><p role="alert" class="error"><?=h($error)?></p><?php endif;if(!logged_in()):?>
<form class="panel stack login" method="post"><?=csrf()?><h2>Вход редактора</h2><label>Логин<input name="username" required autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="80"></label><label>Пароль<input type="password" name="password" required autocomplete="current-password" maxlength="1024"></label><button class="button dark" name="action" value="login">Войти</button></form>
<?php else:$state=revision();$d=json_decode($state['draft'],true);$dirty=$state['draft']!==$state['live'];?><div class="adminbar"><strong><?=$dirty?'Есть неопубликованные изменения':'Каталог опубликован'?></strong><form method="post"><?=csrf()?><input type="hidden" name="rev" value="<?=h($state['rev'])?>"><button class="button yellow" name="action" value="publish" <?=$dirty?'':'disabled'?>>Опубликовать каталог</button></form></div><div class="chips"><?php foreach($tabs as $key=>$label):?><a class="<?=$key===$tab?'sel':''?>" href="/admin/?tab=<?=$key?>"><?=$label?></a><?php endforeach;?></div>
<?php if($tab==='preview'):?><h2>Предпросмотр черновика</h2>
<?php foreach($d['categories'] as $cid=>$category):?><section class="preview-group"><h3><?=h($category['name'])?></h3><p><?=h($category['description'])?></p><div class="products"><?php foreach($d['items'] as $id=>$p)if($p['category']===$cid):?><article class="product">
<?php if($src=image_url($p['image'])):?><div class="thumb"><img src="<?=h($src)?>" alt="" loading="lazy"></div><?php endif;?>
<small><?=h($d['groups'][$p['group']]['name']??'')?></small><h3><?=h($p['name'])?></h3><p><?=h($p['description'])?></p><?php if($p['specs']!==''):?><p><?=nl2br(h($p['specs']))?></p><?php endif;?><div class="product-bottom"><span><?=$p['price']!==''?h($p['price'].' ₽ / '.$p['unit']):'Цена по запросу'?></span><a class="text-link" href="?tab=items&amp;edit=<?=h($id)?>">Изменить</a></div></article><?php endif;?></div></section><?php endforeach;?>
<?php elseif($tab==='leads'):$page=max(1,(int)($_GET['page']??1));$s=db()->prepare('SELECT * FROM leads ORDER BY created DESC,id DESC LIMIT 26 OFFSET ?');$s->bindValue(1,($page-1)*25,PDO::PARAM_INT);$s->execute();$leads=$s->fetchAll();$more=count($leads)>25;if(!$leads):?><p>Заявок пока нет.</p><?php endif;foreach(array_slice($leads,0,25) as $lead):$data=json_decode($lead['details'],true);?><details class="panel entry"><summary>№ <?=h($lead['id'])?> · <?=h($data['name'])?> · <?=h((new DateTimeImmutable($lead['created']))->setTimezone(new DateTimeZone('Europe/Moscow'))->format('d.m.Y H:i'))?> МСК</summary><p><?=h($data['company'])?> · <?=h($data['contact'])?></p><?php foreach($data['items'] as $line):?><p><?=h($line['name'])?> — <?=h($line['qty'].' '.$line['unit'])?></p><?php endforeach;?><p><?=nl2br(h($data['note']))?></p><?php if($lead['attachment']):?><a class="text-link" href="?file=<?=h($lead['id'])?>">Скачать спецификацию</a><?php endif;?></details><?php endforeach;if($more):?><a href="?tab=leads&amp;page=<?=$page+1?>">Следующая страница</a><?php endif;if($page>1):?> <a href="?tab=leads&amp;page=<?=$page-1?>">Предыдущая страница</a><?php endif;?>
<?php elseif(isset($_GET['edit'])):$edit=is_string($_GET['edit'])?$_GET['edit']:'';$r=$d[$tab][$edit]??[];if($edit==='new'||$r):?>
<form class="panel stack edit-form" method="post" enctype="multipart/form-data"><?=csrf()?><input type="hidden" name="rev" value="<?=h($state['rev'])?>"><input type="hidden" name="kind" value="<?=h($tab)?>"><input type="hidden" name="id" value="<?=h($edit==='new'?'':$edit)?>"><h2><?=$edit==='new'?'Новая запись':'Редактирование'?></h2>
<label>Название<input required maxlength="150" name="name" value="<?=h($r['name']??'')?>"></label>
<?php if($tab!=='categories'){admin_select('category','Категория',$d['categories'],$r['category']??'');}if($tab==='items'){admin_select('group','Подкатегория',$d['groups'],$r['group']??'',true);?>
<label>Единица заказа<input name="unit" required maxlength="20" value="<?=h($r['unit']??'шт.')?>"></label><label>Цена, ₽ за единицу<input name="price" inputmode="decimal" value="<?=h($r['price']??'')?>" placeholder="Пусто — по запросу"></label><label>Характеристики<textarea name="specs" rows="4" placeholder="Толщина: 12 мм"><?=h($r['specs']??'')?></textarea><small>Каждая характеристика на отдельной строке.</small></label><?php }if($tab!=='groups'):?>
<label>Описание<textarea name="description" rows="3"><?=h($r['description']??'')?></textarea></label><label>Фотография<input type="file" name="image" accept="image/jpeg,image/png,image/webp"><small>JPEG, PNG или WebP, до 6 МБ.</small></label><?php if($url=image_url($r['image']??'')):?><img class="admin-image" alt="Текущее фото" src="<?=h($url)?>"><label class="check"><input type="checkbox" name="clear_image" value="1">Убрать фотографию</label><?php endif;endif;?>
<div class="actions"><button name="action" value="save" class="button dark">Сохранить черновик</button><a class="button outline" href="?tab=<?=$tab?>">К списку</a></div></form>
<?php if($edit!=='new'):?><details class="remove"><summary>Удалить запись</summary><form method="post"><?=csrf()?><input type="hidden" name="rev" value="<?=h($state['rev'])?>"><input type="hidden" name="kind" value="<?=h($tab)?>"><input type="hidden" name="id" value="<?=h($edit)?>"><button class="button outline" name="action" value="delete">Подтвердить удаление из черновика</button></form></details><?php endif;else:?><p>Запись не найдена.</p><?php endif;else:?>
<div class="section-head"><h2><?=h($tabs[$tab])?></h2><a class="button dark" href="?tab=<?=$tab?>&amp;edit=new"><?=icon('plus')?>Добавить</a></div><div class="admin-list"><?php foreach($d[$tab] as $id=>$r):?><a href="?tab=<?=$tab?>&amp;edit=<?=h($id)?>"><strong><?=h($r['name'])?></strong><span><?=h($d['categories'][$r['category']??'']['name']??'')?> · Изменить</span></a><?php endforeach;?></div><?php endif;endif;?></section><?php page_end();?>
