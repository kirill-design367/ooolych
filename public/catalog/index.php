<?php
require __DIR__.'/../../app/view.php';$d=catalog();
$c=is_string($_GET['c']??null)?$_GET['c']:'';$g=is_string($_GET['g']??null)?$_GET['g']:'';$q=trim(mb_substr(is_string($_GET['q']??null)?$_GET['q']:'',0,160));
if(($c!==''&&!isset($d['categories'][$c]))||($g!==''&&(!isset($d['groups'][$g])||($c!==''&&$d['groups'][$g]['category']!==$c))))missing('Раздел не найден');
if($g!=='')$c=$d['groups'][$g]['category'];
$title=$g!==''?$d['groups'][$g]['name']:($c!==''?$d['categories'][$c]['name']:'Каталог продукции');
$items=array_filter($d['items'],function($p)use($d,$c,$g,$q){
    $haystack=mb_strtolower($p['name'].' '.$p['specs'].' '.($d['groups'][$p['group']]['name']??'').' '.($d['categories'][$p['category']]['name']??''));
    return (!$c||$p['category']===$c)&&(!$g||$p['group']===$g)&&($q===''||str_contains($haystack,mb_strtolower($q)));
});
page_top($title,'/catalog/');?><section class="wrap inner"><?php crumbs($c?['/catalog/'=>'Каталог',$title]:['Каталог']);?><h1><?=h($title)?></h1><div class="catalog-layout"><aside class="filters"><h2>Разделы</h2><a class="<?=!$c?'sel':''?>" href="/catalog/">Весь каталог</a><?php foreach($d['categories'] as $id=>$cat):?><a class="<?=$id===$c?'sel':''?>" href="<?=h(catlink($id))?>"><?=h($cat['name'])?></a><?php endforeach;?></aside><div>
<form class="search" method="get"><?=icon('search')?><?php if($c):?><input type="hidden" name="c" value="<?=h($c)?>"><?php endif;if($g):?><input type="hidden" name="g" value="<?=h($g)?>"><?php endif;?><input aria-label="Поиск по каталогу" type="search" name="q" placeholder="Поиск по названию или характеристике" value="<?=h($q)?>"><button>Найти</button></form>
<?php if($c):?><div class="chips"><a class="<?=!$g?'sel':''?>" href="<?=h(catlink($c))?>">Все виды</a><?php foreach($d['groups'] as $id=>$grp)if($grp['category']===$c):?><a class="<?=$id===$g?'sel':''?>" href="<?=h(catlink($c).'&g='.rawurlencode($id))?>"><?=h($grp['name'])?></a><?php endif;?></div><?php endif;?>
<p class="result-count">Позиций: <?=count($items)?></p><div class="products"><?php foreach($items as $id=>$p):?><article class="product"><?php if($src=image_url($p['image'])):?><a class="thumb" href="<?=h(itemlink($id))?>" tabindex="-1" aria-hidden="true"><img src="<?=h($src)?>" alt="" loading="lazy"></a><?php endif;?><div class="small"><?=h($d['categories'][$p['category']]['name'])?></div><h2><a href="<?=h(itemlink($id))?>"><?=h($p['name'])?></a></h2><p><?=h($p['description'])?></p><div class="product-bottom"><span><?= $p['price']!==''?h($p['price']).' ₽ / '.h($p['unit']):'Цена по запросу'?></span><a class="text-link" href="<?=h(itemlink($id))?>">Подробнее</a></div></article><?php endforeach;?></div>
<?php if(!$items):?><p class="notice">По этому запросу пока нет позиций. Уточните название или пришлите спецификацию.</p><a class="button dark" href="/request/">Запросить подбор</a><?php endif;?></div></div></section><?php page_end();?>
