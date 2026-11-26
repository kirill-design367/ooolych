<?php
declare(strict_types=1);
require __DIR__.'/../app/leads.php';
session_open();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$c=catalog();
if($_SERVER['REQUEST_METHOD']==='GET'){
    echo json_encode(['catalog'=>$c,'csrf'=>token(),'key'=>$_SESSION['formkey']??=bin2hex(random_bytes(24))],JSON_THROW_ON_ERROR);
    exit;
}
check_csrf();
try {
    $basket=json_decode(field('basket',20000),true,32,JSON_THROW_ON_ERROR);
    if(!is_array($basket)) throw new DomainException('Проверьте список материалов.');
    $cart=[];
    foreach($basket as $id=>$amount){
        if(!isset($c['items'][$id])) throw new DomainException('Одна из позиций снята с публикации. Обновите список.');
        $cart[$id]=qty((string)$amount);
    }
    $_SESSION['cart']=$cart;
    echo json_encode(['id'=>send_request($c)],JSON_THROW_ON_ERROR);
} catch(DomainException|JsonException $e){
    http_response_code(422);
    echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);
}
