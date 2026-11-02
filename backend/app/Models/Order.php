<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

    protected $hidden = ['idempotency_key', 'request_hash', 'user_id', 'stripe_session_id'];

    protected function casts(): array
    {
        return ['items' => 'array', 'total' => 'integer'];
    }
}
