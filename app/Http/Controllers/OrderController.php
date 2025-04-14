<?php

namespace App\Http\Controllers;

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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_name' => 'required|string|max:255',
        ]);

        $order = Order::create([
            'uuid' => Str::uuid(),
            'restaurant_name' => $validated['restaurant_name'],
            'user_id' => auth()->user()->id,
        ]);

        return redirect()->route('orders.show', ['orderId' => $order->id])->with('success', 'Order created successfully');
    }

    public function show(int $orderId): Response
    {
        $order = Order::with('user')->findOrFail($orderId);
        $users = User::all();
        $items = OrderItem::with(['user', 'createdBy'])->where('order_id', $orderId)->get();

        return Inertia::render('orders/show', ['order' => $order, 'users' => $users, 'items' => $items]);
    }

    public function storeItem(Request $request, $orderId): RedirectResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
        ]);

        OrderItem::create([
            'order_id' => $orderId,
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'created_by' => auth()->user()->id
        ]);

        $items = OrderItem::with(['user', 'createdBy'])
            ->where('order_id', $orderId)
            ->get();

        return redirect()->back()->with([
            'success' => 'Item created successfully',
            'items' => $items
        ]);
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

        return redirect()->back()->with('success', 'Item marked as paid successfully');
    }

    public function myOrders(): Response
    {
        $orderItem = OrderItem::where('user_id', auth()->user()->id)
            ->with(['order', 'user', 'createdBy'])
            ->orderBy('created_at', 'DESC')
            ->get();

        return Inertia::render('orders/myOrders', ['orders' => $orderItem]);
    }
}
