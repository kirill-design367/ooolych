<?php
declare(strict_types=1);
require_once __DIR__.'/leads.php';
const ADMIN_LOGIN = 'luch-admin';
function admin_hash(): string {
    $p=private_dir().'/admin.hash';return getenv('LUCH_ADMIN_HASH')?: (is_file($p)?trim((string)file_get_contents($p)):'');
}
function logged_in(): bool {return isset($_SESSION['editor']) && $_SESSION['editor']>time()-3600;}
function revision(): array {return db()->query('SELECT draft,live,rev FROM catalog WHERE id=1')->fetch();}
function persist_draft(array $d,int $rev,bool $publish): void {
    $json=json_encode($d,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
    $st=db()->prepare($publish?'UPDATE catalog SET live=draft, rev=rev+1 WHERE id=1 AND rev=?':'UPDATE catalog SET draft=?, rev=rev+1 WHERE id=1 AND rev=?');
    $st->execute($publish?[$rev]:[$json,$rev]);
    if($st->rowCount()!==1)throw new DomainException('Каталог изменён в другой вкладке. Откройте запись заново.');
}
function catalog_change(array $state,string $action): void {
    $rev=field('rev');if((string)$state['rev']!==$rev)throw new DomainException('Версия каталога изменилась. Откройте запись заново.');
    $d=json_decode($state['draft'],true,512,JSON_THROW_ON_ERROR);
    if($action==='publish'){persist_draft($d,(int)$rev,true);message('Каталог опубликован.');go('/admin/');}
    $kind=field('kind');if(!in_array($kind,['categories','groups','items'],true))throw new DomainException('Неизвестный раздел.');
    $id=field('id',64);$new=$id==='';if(!$new&&!isset($d[$kind][$id]))throw new DomainException('Запись уже удалена.');
    if($action==='delete'){
        if($new)throw new DomainException('Запись не найдена.');
        if($kind==='categories'&&(in_array($id,array_column($d['items'],'category'),true)||in_array($id,array_column($d['groups'],'category'),true)))throw new DomainException('Сначала перенесите или удалите вложенные записи.');
        if($kind==='groups'&&in_array($id,array_column($d['items'],'group'),true))throw new DomainException('Сначала перенесите товары из этой подкатегории.');
        unset($d[$kind][$id]);persist_draft($d,(int)$rev,false);message('Удалено из черновика.');go('/admin/?tab='.$kind);
    }
    if($action!=='save')throw new DomainException('Неизвестное действие.');
    $name=required('name','Название',150);$row=['name'=>$name];$image='';
    if($kind!=='categories'){
        $row['category']=field('category');if(!isset($d['categories'][$row['category']]))throw new DomainException('Выберите категорию.');
        if($kind==='groups'&&!$new&&$d['groups'][$id]['category']!==$row['category']&&in_array($id,array_column($d['items'],'group'),true))throw new DomainException('Сначала перенесите товары из этой подкатегории.');
    }
    if($kind!=='groups'){
        $row['description']=field('description',2500);$row['image']=isset($_POST['clear_image'])?'':($d[$kind][$id]['image']??'');
    }
    if($kind==='items'){
        $row['group']=field('group');if($row['group']!==''&&($d['groups'][$row['group']]['category']??null)!==$row['category'])throw new DomainException('Выберите подкатегорию из нужной категории.');
        $row['unit']=required('unit','Единица заказа',20);$row['specs']=field('specs',3500);$price=str_replace(',','.',field('price',24));
        if($price!==''&&!preg_match('/^\d{1,10}(\.\d{1,2})?$/D',$price))throw new DomainException('Проверьте цену.');$row['price']=$price;
    }
    foreach($d[$kind] as $other=>$r)if($other!==$id&&mb_strtolower($r['name'])===mb_strtolower($name)&&($r['category']??'')===($row['category']??''))throw new DomainException('Запись с таким названием уже есть.');
    if($kind!=='groups'){$image=asset_file(private_dir().'/images');if($image!=='')$row['image']=$image;}
    if($new)$id=bin2hex(random_bytes(6));$d[$kind][$id]=$row;
    try{persist_draft($d,(int)$rev,false);}catch(Throwable $e){if($image!=='')unlink(private_dir().'/images/'.$image);throw $e;}
    message('Изменения сохранены в черновик.');go('/admin/?tab='.$kind);
}
function admin_select(string $name,string $label,array $choices,string $value,bool $blank=false): void { ?>
<label><?=h($label)?><select name="<?=h($name)?>" <?=$blank?'':'required'?>><option value=""><?=$blank?'Без подкатегории':'Выберите…'?></option><?php foreach($choices as $id=>$r):?><option value="<?=h($id)?>" <?=$value===$id?'selected':''?> data-parent="<?=h($r['category']??'')?>"><?=h($r['name'])?></option><?php endforeach;?></select></label><?php }
