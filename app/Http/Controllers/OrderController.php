<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::with('user')->orderBy('created_at', 'DESC')->get();

        return Inertia::render('orders/index', ['orders' => $orders]);
    }

    public function create(): Response
    {
        $users = User::all();

        return Inertia::render('orders/create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $order = Order::create([
            'uuid' => Str::uuid(),
            'restaurant_name' => $request->restaurant_name,
            'user_id' => auth()->user()->id,
            'discount' => $request->discount ?? 0,
            'voucher' => $request->voucher ?? 0,
            'delivery' => $request->delivery ?? 0,
            'transaction' => $request->transaction ?? 0,
        ]);

        foreach ($request->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'user_id' => $item["user_id"],
                'amount' => $item["amount"],
                'discounted_amount' => $item["discounted_amount"],
                'final_amount' => floor($item["final_amount"] * 100) / 100,
                'created_by' => auth()->user()->id,
                'status' => auth()->user()->id == $item["user_id"] ? 'paid' : 'unpaid',
            ]);

            if (auth()->user()->id != $item["user_id"]) {
                Notification::create([
                    'title' => 'Nowe zamówienie do zapłaty',
                    'message' => auth()->user()->name . ' utworzył nowe zamówienie w restauracji '. $order->restaurant_name .' w której zamawiałeś',
                    'user_id' => $item["user_id"],
                    'route' => 'orders.show',
                    'route_params' => ['orderId' => $order->id],
                    'read' => false,
                ]);
            }
        }

        return redirect()->route('orders.show', ['orderId' => $order->id])->with('success', 'Order created successfully');
    }

    public function show(int $orderId): Response
    {
        $order = Order::with('user')->findOrFail($orderId);
        $items = OrderItem::with(['user', 'createdBy'])->where('order_id', $orderId)->get();

        return Inertia::render('orders/show', ['order' => $order, 'items' => $items]);
    }

    public function destroyItem($id): RedirectResponse
    {
        $item = OrderItem::findOrFail($id);
        $orderId = $item->order_id;
        $item->delete();

        $items = OrderItem::with(['user', 'createdBy'])
            ->where('order_id', $orderId)
            ->get();

        return redirect()->back()->with([
            'success' => 'Item deleted successfully',
            'items' => $items
        ]);
    }

    public function markAsPaid(int $id): RedirectResponse
    {
        $orderItem = OrderItem::findOrFail($id);

        if ($orderItem->user_id !== auth()->user()->id) {
            return redirect()->back()->with('error', 'Nie masz uprawnień do tego działania');
        }

        $orderItem->paid_at = Carbon::now();
        $orderItem->status = 'paid';
        $orderItem->save();

        $order = Order::findOrFail($orderItem->order_id);

        Notification::create([
            'title' => 'Opłacone zamówienie',
            'message' => auth()->user()->name . ' opłacił zamówienie w restauracji '. $order->restaurant_name . ' na kwotę: ' . $orderItem->final_amount . ' zł.',
            'user_id' => $order->user_id,
            'route' => 'orders.show',
            'route_params' => ['orderId' => $order->id],
            'read' => false,
        ]);

        return redirect()->back()->with('success', 'Item marked as paid successfully');
    }

    public function bulkMarkAsPaid(Request $request)
    {
        $orderIds = $request->input('order_ids');

        $orderItems = OrderItem::whereIn('id', $orderIds)
            ->where('status', 'unpaid')
            ->get();

        $sumFinalAmount = $orderItems->sum('final_amount');
        $createdBy = $orderItems->first()?->created_by;

        OrderItem::whereIn('id', $orderIds)
            ->where('status', 'unpaid')
            ->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

        Notification::create([
            'title' => 'Opłacone zamówienie',
            'message' => auth()->user()->name . ' opłacił wszystkie zamówienia na kwotę: ' . $sumFinalAmount . ' zł.',
            'user_id' => $createdBy,
            'read' => false,
        ]);

        return back();
    }

    public function myOrders(): Response
    {
        $userId = auth()->id();

        $creators = OrderItem::where('user_id', $userId)
            ->with(['createdBy'])
            ->select('created_by')
            ->distinct()
            ->get()
            ->pluck('created_by');

        $groupedOrders = [];

        foreach ($creators as $creatorId) {
            $orders = OrderItem::where('user_id', $userId)
                ->where('created_by', $creatorId)
                ->with(['order', 'user', 'createdBy'])
                ->orderBy('status', 'DESC')
                ->orderBy('created_at', 'DESC')
                ->limit(10)
                ->get();

            if ($orders->isNotEmpty()) {
                $groupedOrders[] = [
                    'created_by' => [
                        'id' => $orders->first()->createdBy->id,
                        'name' => $orders->first()->createdBy->name,
                    ],
                    'orders' => $orders,
                ];
            }
        }

        return Inertia::render('orders/myOrders', [
            'groupedOrders' => $groupedOrders,
        ]);
    }

}
