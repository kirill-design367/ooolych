<?php
declare(strict_types=1);
require __DIR__.'/../app/core.php';
$f=$_GET['f']??''; if(!is_string($f)||!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/D',$f,$m)||!is_file($p=private_dir().'/images/'.$f)){http_response_code(404);exit;}
header('X-Content-Type-Options: nosniff');header('Cache-Control: public, max-age=31536000, immutable');
header('Content-Type: image/'.($m[1]==='jpg'?'jpeg':$m[1]));readfile($p);
