<?php
declare(strict_types=1);
require_once __DIR__.'/core.php';
function icon(string $key): string {
    $paths=['list'=>'<path d="M8 6h12M8 12h12M8 18h12"/><path d="M3 6h.1M3 12h.1M3 18h.1"/>',
        'file'=>'<path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/>',
        'search'=>'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
        'menu'=>'<path d="M3 6h18M3 12h18M3 18h18"/>',
        'plus'=>'<path d="M12 5v14M5 12h14"/>','pin'=>'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'];
    return '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'.($paths[$key]??'').'</svg>';
}
function page_top(string $title,string $active='',string $desc='Стройматериалы и электрика оптом. Каталог ООО «Луч» и заявки на расчёт.'): void {
    session_open();header('Content-Type: text/html; charset=utf-8');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: same-origin'); ?>
<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?=h($title)?> · ЛУЧ</title><meta name="description" content="<?=h($desc)?>"><meta name="theme-color" content="#202222"><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/site.css"><script defer src="/assets/site.js"></script></head><body><a class="skip" href="#main">К содержанию</a>
<header class="head"><div class="wrap head-inner"><a class="wordmark" href="/" aria-label="Луч — главная"><img src="/assets/logo.svg" width="166" height="54" alt="Луч"></a>
<nav id="nav" aria-label="Основное меню"><?php foreach(['/catalog/'=>'Каталог','/about/'=>'О компании','/contacts/'=>'Контакты'] as $url=>$label): ?><a <?= $active===$url?'aria-current="page"':''?> href="<?=$url?>"><?=$label?></a><?php endforeach;?></nav>
<a class="head-tel" href="tel:<?=TEL?>"><?=PHONE?></a><a class="cart-link" href="/request/"><?=icon('list')?> Заявка <span id="cart-count"><?=count(lines(catalog()))?></span></a>
<button class="menu-btn" type="button" aria-label="Открыть меню" aria-controls="nav" aria-expanded="false"><?=icon('menu')?></button></div></header>
<main id="main"><?php }
function page_end(): void { ?>
</main><footer><div class="wrap foot"><div><a class="wordmark" href="/"><img src="/assets/logo.svg" alt="Луч" width="166" height="54"></a><p>ООО «Луч» · Подольск</p></div><div><a href="/catalog/">Каталог продукции</a><a href="/about/">О компании</a><a href="/contacts/">Контакты и реквизиты</a></div><div><a href="tel:<?=TEL?>"><?=PHONE?></a><a href="mailto:<?=EMAIL?>"><?=EMAIL?></a><a class="minor" href="/privacy/">Обработка данных заявки</a></div></div></footer><div class="toast" role="status" aria-live="polite"></div></body></html><?php }
function crumbs(array $links): void {echo '<nav class="crumb" aria-label="Хлебные крошки"><a href="/">Главная</a>';foreach($links as $u=>$t){echo '<span aria-hidden="true">/</span>';echo is_int($u)?'<span>'.h($t).'</span>':'<a href="'.h($u).'">'.h($t).'</a>';}echo '</nav>';}
function catlink(string $id): string{return '/catalog/?c='.rawurlencode($id);}
function itemlink(string $id): string{return '/catalog/item/?id='.rawurlencode($id);}
function section_card(string $id,array $c): void { ?>
<a class="catcard" href="<?=h(catlink($id))?>"><?php if($src=image_url($c['image'])):?><img src="<?=h($src)?>" loading="lazy" width="600" height="400" alt=""><?php endif;?><div><h3><?=h($c['name'])?></h3><p><?=h($c['description'])?></p></div></a><?php }
function record_details(): void { ?>
<dl class="details"><?php foreach(['Наименование'=>COMPANY,'ИНН'=>'5074081719','КПП'=>'507401001','ОГРН'=>'1235000061548','Юридический адрес'=>ADDRESS] as $k=>$v):?><div><dt><?=h($k)?></dt><dd><?=h($v)?></dd></div><?php endforeach;?></dl><?php }
function missing(string $title): never {http_response_code(404);page_top($title);echo '<div class="wrap inner"><h1>'.h($title).'</h1><a class="button dark" href="/catalog/">Перейти в каталог</a></div>';page_end();exit;}
