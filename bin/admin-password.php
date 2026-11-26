<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli')exit(1);
require __DIR__.'/../app/core.php';
fwrite(STDERR,"Новый пароль редактора (не менее 12 символов): ");
$hide=function_exists('posix_isatty')&&posix_isatty(STDIN)&&function_exists('system');
if($hide)system('stty -echo');
try{$password=rtrim((string)fgets(STDIN),"\r\n");}finally{if($hide)system('stty echo');fwrite(STDERR,"\n");}
if(strlen($password)<12){fwrite(STDERR,"Слишком короткий пароль.\n");exit(1);}
$tmp=tempnam(private_dir(),'hash');file_put_contents($tmp,password_hash($password,PASSWORD_DEFAULT));chmod($tmp,0600);rename($tmp,private_dir().'/admin.hash');echo "Пароль сохранён.\n";
