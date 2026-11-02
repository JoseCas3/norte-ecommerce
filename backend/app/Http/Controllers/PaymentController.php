<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentController
{
    public function checkout(Request $r, Order $order)
    {
        abort_unless($order->user_id === $r->user()->id, 404);
        abort_unless($order->status === 'pending', 409, 'La orden ya no está pendiente.');
        abort_unless(config('services.stripe.secret'), 503, 'Configura STRIPE_SECRET en Laravel para habilitar pagos.');
        try {
            $stripe = new StripeClient(config('services.stripe.secret'));
            // One Stripe session per order: retries reuse a deterministic idempotency key.
            if ($order->stripe_session_id) {
                $session = $stripe->checkout->sessions->retrieve($order->stripe_session_id);
                if ($session->payment_status === 'paid') {
                    app(PaymentService::class)->confirm($session);

                    return response()->json(['message' => 'El pago ya está confirmado. Actualiza tu historial.'], 409);
                }if ($session->status === 'expired') {
                    app(PaymentService::class)->expire($session);

                    return response()->json(['message' => 'El pago expiró. Crea una nueva orden.'], 409);
                }

return ['url' => $session->url];
            }
            $base = rtrim(config('services.frontend_url'), '/');
            $session = $stripe->checkout->sessions->create(['mode' => 'payment', 'payment_method_types' => ['card'], 'customer_email' => $r->user()->email, 'client_reference_id' => (string) $order->id, 'metadata' => ['order_id' => (string) $order->id], 'success_url' => $base.'/confirmacion?order='.$order->id, 'cancel_url' => $base.'/historial', 'line_items' => array_map(fn ($i) => ['price_data' => ['currency' => 'usd', 'unit_amount' => $i['unit_price'], 'product_data' => ['name' => $i['name']]], 'quantity' => $i['quantity']], $order->items)], ['idempotency_key' => 'norte-order-'.$order->id]);
            $order->update(['stripe_session_id' => $session->id]);

            return ['url' => $session->url];
        } catch (ApiErrorException $e) {
            report($e);

            return response()->json(['message' => 'Stripe no pudo iniciar el pago. Revisa la configuración o vuelve a intentarlo.'], 502);
        }
    }

    public function webhook(Request $r)
    {
        $secret = config('services.stripe.webhook_secret');
        abort_unless($secret, 503, 'Webhook no configurado.');
        try {
            $event = Webhook::constructEvent($r->getContent(), $r->header('Stripe-Signature', ''), $secret);
        } catch (\UnexpectedValueException|SignatureVerificationException $e) {
            return response()->json(['message' => 'Firma de webhook inválida.'], 400);
        }
        $payments = app(PaymentService::class);
        if (in_array($event->type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'])) {
            $payments->confirm($event->data->object);
        }
        if ($event->type === 'checkout.session.expired') {
            $payments->expire($event->data->object);
        }

        return ['received' => true];
    }
}
