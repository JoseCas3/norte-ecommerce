<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function confirm(object $session): void
    {
        if (($session->payment_status ?? '') !== 'paid') {
            return;
        }
        DB::transaction(function () use ($session) {
            $o = Order::where('stripe_session_id', $session->id)->lockForUpdate()->first();
            if (! $o || $o->status === 'paid') {
                return;
            }
            abort_unless($o->status === 'pending' && $session->currency === 'usd' && (int) $session->amount_total === $o->total && (string) ($session->metadata->order_id ?? '') === (string) $o->id, 409, 'La sesión no coincide con la orden.');
            $o->update(['status' => 'paid']);
        });
    }

    public function expire(object $session): void
    {
        DB::transaction(function () use ($session) {
            $o = Order::where('stripe_session_id', $session->id)->lockForUpdate()->first();
            if (! $o || $o->status !== 'pending') {
                return;
            }
            // Claim the transition atomically before restoring stock; repeated events are harmless.
            if (! Order::whereKey($o->id)->where('status', 'pending')->update(['status' => 'cancelled', 'updated_at' => now()])) {
                return;
            }
            foreach ($o->items as $item) {
                DB::table('products')->where('id', $item['product_id'])->increment('stock', $item['quantity']);
            }
        });
    }
}
