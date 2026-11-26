<?php
declare(strict_types=1);
function storefront_page(string $directory): void {
    if (is_file($directory.'/index.html')) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($directory.'/index.html');
        return;
    }
    http_response_code(503);
    echo 'Для запуска витрины выполните npm ci и npm run build:php в каталоге web.';
}
