<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->string('password');
            $t->rememberToken();
            $t->timestamps();
        });
        Schema::create('personal_access_tokens', function (Blueprint $t) {
            $t->id();
            $t->morphs('tokenable');
            $t->text('name');
            $t->string('token', 64)->unique();
            $t->text('abilities')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable()->index();
            $t->timestamps();
        });
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->text('description');
            $t->string('category');
            $t->unsignedInteger('price');
            $t->unsignedInteger('stock');
            $t->string('color');
            $t->string('icon');
            $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('status')->default('pending');
            $t->unsignedInteger('total');
            $t->json('items');
            $t->string('idempotency_key', 80);
            $t->string('request_hash', 64);
            $t->string('stripe_session_id')->nullable()->unique();
            $t->timestamps();
            $t->unique(['user_id', 'idempotency_key']);
        });
    }

    public function down(): void
    {
        foreach (['orders', 'products', 'personal_access_tokens', 'users'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
