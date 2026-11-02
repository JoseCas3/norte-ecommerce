<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController
{
    public function index(Request $r)
    {
        $data = $r->validate(['search' => 'nullable|string|max:100', 'category' => 'nullable|string|max:50']);

        return ['data' => Product::query()->when($data['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', '%'.$v.'%'))->when($data['category'] ?? null, fn ($q, $v) => $q->where('category', $v))->orderBy('id')->limit(60)->get()];
    }

    public function show(Product $product)
    {
        return $product;
    }
}
