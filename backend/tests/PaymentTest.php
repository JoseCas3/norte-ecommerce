<?php

namespace Tests;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentTest extends TestCase
{
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();

        return $app;
    }

    protected function setUp(): void
    {
        putenv('DB_DATABASE=:memory:');
        parent::setUp();
        Artisan::call('migrate', ['--force' => true]);
    }

    private function order(): Order
    {
        $u = User::create(['name' => 'QA', 'email' => 'qa@example.com', 'password' => 'password123']);
        $p = Product::create(['name' => 'Taza', 'description' => 'Cerámica', 'category' => 'Bienestar', 'price' => 1800, 'stock' => 9, 'color' => '#fff', 'icon' => 'T']);

        return Order::create(['user_id' => $u->id, 'status' => 'pending', 'total' => 1800, 'items' => [['product_id' => $p->id, 'name' => 'Taza', 'quantity' => 1, 'unit_price' => 1800]], 'idempotency_key' => 'qa-key', 'request_hash' => str_repeat('a', 64), 'stripe_session_id' => 'cs_test_fixture']);
    }

    private function fixtureSession(): object
    {
        return (object) ['id' => 'cs_test_fixture', 'payment_status' => 'paid', 'currency' => 'usd', 'amount_total' => 1800, 'metadata' => (object) ['order_id' => '1']];
    }

    public function test_confirmation_is_idempotent(): void
    {
        $o = $this->order();
        $s = $this->fixtureSession();
        $p = new PaymentService;
        $p->confirm($s);
        $p->confirm($s);
        $this->assertSame('paid', $o->fresh()->status);
        $this->assertSame(9, Product::first()->stock);
    }

    public function test_unpaid_session_cannot_confirm_order(): void
    {
        $o = $this->order();
        $s = $this->fixtureSession();
        $s->payment_status = 'unpaid';
        (new PaymentService)->confirm($s);
        $this->assertSame('pending', $o->fresh()->status);
    }

    public function test_expiry_restores_stock_exactly_once(): void
    {
        $o = $this->order();
        $p = new PaymentService;
        $p->expire($this->fixtureSession());
        $p->expire($this->fixtureSession());
        $this->assertSame('cancelled', $o->fresh()->status);
        $this->assertSame(10, Product::first()->stock);
    }

    public function test_wrong_amount_cannot_confirm_order(): void
    {
        $this->order();
        $s = $this->fixtureSession();
        $s->amount_total = 1;
        $this->expectException(HttpException::class);
        (new PaymentService)->confirm($s);
    }
}
