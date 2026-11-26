<?php
require __DIR__.'/../../../app/core.php';
$id = is_string($_GET['id'] ?? null) ? $_GET['id'] : '';
$item = catalog()['items'][$id] ?? null;
if (!$item) {
    http_response_code(404);
    echo '<meta charset="utf-8"><a href="/catalog/">Позиция снята. Перейти в каталог</a>';
    exit;
}
header('Location: /catalog/?'.http_build_query(['c'=>$item['category'],'q'=>$item['name']]), true, 302);
