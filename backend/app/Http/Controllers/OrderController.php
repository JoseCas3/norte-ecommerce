<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController
{
    public function index(Request $r)
    {
        return ['data' => Order::where('user_id', $r->user()->id)->latest()->get()];
    }

    public function show(Request $r, Order $order)
    {
        abort_unless($order->user_id === $r->user()->id, 404);

        return $order;
    }

    public function store(Request $r)
    {
        $data = $r->validate(['items' => 'required|array|min:1|max:50', 'items.*.product_id' => 'required|integer|distinct|exists:products,id', 'items.*.quantity' => 'required|integer|min:1|max:20']);
        $key = $r->header('Idempotency-Key', '');
        abort_unless(preg_match('/^[a-zA-Z0-9-]{20,80}$/', $key), 422, 'Idempotency-Key inválida.');
        $items = collect($data['items'])->sortBy('product_id')->values()->all();
        $hash = hash('sha256', json_encode($items));

        return DB::transaction(function () use ($r, $items, $key, $hash) {
            // Serialize order creation per user, including idempotent retries.
            DB::table('users')->where('id', $r->user()->id)->update(['updated_at' => now()]);
            $old = Order::where('user_id', $r->user()->id)->where('idempotency_key', $key)->first();
            if ($old) {
                abort_unless(hash_equals($old->request_hash, $hash), 409, 'Esta clave ya corresponde a otro carrito.');

                return response()->json($old);
            }
            $lines = [];
            $total = 0;
            foreach ($items as $item) {
                $p = Product::whereKey($item['product_id'])->lockForUpdate()->firstOrFail();
                if ($p->stock < $item['quantity']) {
                    throw ValidationException::withMessages(['items' => ['Stock insuficiente para '.$p->name.'.']]);
                }
                // Conditional update prevents overselling even with SQLite, where row locks differ.
                $updated = Product::whereKey($p->id)->where('stock', '>=', $item['quantity'])->decrement('stock', $item['quantity']);
                abort_unless($updated, 409, 'El stock cambió. Vuelve a intentarlo.');
                $lines[] = ['product_id' => $p->id, 'name' => $p->name, 'quantity' => $item['quantity'], 'unit_price' => $p->price];
                $total += $p->price * $item['quantity'];
            }
            $order = Order::create(['user_id' => $r->user()->id, 'status' => 'pending', 'total' => $total, 'items' => $lines, 'idempotency_key' => $key, 'request_hash' => $hash]);

            return response()->json($order,201);
        }, 3);
    }
}
