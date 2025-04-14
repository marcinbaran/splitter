<?php

namespace App\Http\Controllers;

use App\Models\Order;
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

        return redirect()->back()->with('success', 'Order created successfully');
    }
}
