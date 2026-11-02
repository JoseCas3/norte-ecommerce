<?php

use Illuminate\Support\Facades\Route;

Route::get('/openapi.json', fn () => response()->file(base_path('openapi.json')));
Route::get('/docs', fn () => response()->file(public_path('docs.html')));
