<?php

namespace App\Http\Controllers;

use App\Mail\SettlementCreatedMail;
use App\Models\Notification;
use App\Models\Settlement;
use App\Models\SettlementItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettlementController extends Controller
{
    public function index(): Response
    {
        $settlements = Settlement::with('user')->orderBy('date', 'DESC')->get();

        return Inertia::render('settlements/index', ['settlements' => $settlements]);
    }

    public function create(): Response
    {
        $users = User::all();

        return Inertia::render('settlements/create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $settlement = Settlement::create([
            'uuid' => substr(Str::uuid()->toString(), 0, 8),
            'restaurant_name' => $request->restaurant_name,
            'date' => $request->date ?? null,
            'user_id' => auth()->user()->id,
            'discount' => $request->discount ?? 0,
            'voucher' => $request->voucher ?? 0,
            'delivery' => $request->delivery ?? 0,
            'transaction' => $request->transaction ?? 0,
        ]);

        foreach ($request->items as $item) {
            $settlementItem = SettlementItem::create([
                'settlement_id' => $settlement->id,
                'user_id' => $item['user_id'],
                'amount' => $item['amount'],
                'discounted_amount' => $item['discounted_amount'],
                'final_amount' => floor($item['final_amount'] * 100) / 100,
                'created_by' => auth()->user()->id,
                'status' => auth()->user()->id == $item['user_id'] ? 'paid' : 'unpaid',
            ]);

            if (auth()->user()->id != $item['user_id']) {
                Notification::create([
                    'title' => 'Nowe zamówienie do zapłaty',
                    'message' => auth()->user()->name . ' utworzył nowe zamówienie w restauracji '. $settlement->restaurant_name .' w której zamawiałeś',
                    'user_id' => $item['user_id'],
                    'route' => 'settlements.show',
                    'route_params' => ['settlement' => $settlement->id],
                    'read' => false,
                ]);

                $user = User::where('id', $item['user_id'])->first();

                Mail::to($user->email)->send(new SettlementCreatedMail($settlement, $settlementItem));
            }
        }

        return redirect()->route('settlements.show', ['settlement' => $settlement->id])->with('success', 'Settlement created successfully');
    }

    public function show(Settlement $settlement): Response
    {
        $settlement->load('user');

        $items = SettlementItem::with(['user', 'createdBy'])->where('settlement_id', $settlement->id)->get();

        return Inertia::render('settlements/show', ['settlement' => $settlement, 'items' => $items]);
    }

    public function destroyItem($id): RedirectResponse
    {
        $item = SettlementItem::findOrFail($id);
        $settlementId = $item->settlement_id;
        $item->delete();

        $items = SettlementItem::with(['user', 'createdBy'])
            ->where('settlement_id', $settlementId)
            ->get();

        return redirect()->back()->with([
            'success' => 'Item deleted successfully',
            'items' => $items
        ]);
    }

    public function markAsPaid(int $id): RedirectResponse
    {
        $settlementItem = SettlementItem::findOrFail($id);

        if ($settlementItem->user_id !== auth()->user()->id) {
            return redirect()->back()->with('error', 'Nie masz uprawnień do tego działania');
        }

        $settlementItem->paid_at = Carbon::now();
        $settlementItem->status = 'paid';
        $settlementItem->save();

        $settlement = Settlement::findOrFail($settlementItem->settlement_id);

        Notification::create([
            'title' => 'Opłacone zamówienie',
            'message' => auth()->user()->name . ' opłacił zamówienie w restauracji '. $settlement->restaurant_name . ' na kwotę: ' . $settlementItem->final_amount . ' zł.',
            'user_id' => $settlement->user_id,
            'route' => 'settlements.show',
            'route_params' => ['settlement' => $settlement->id],
            'read' => false,
        ]);

        return redirect()->back()->with('success', 'Item marked as paid successfully');
    }

    public function bulkMarkAsPaid(Request $request)
    {
        $settlementIds = $request->input('settlement_ids');

        $settlementItems = SettlementItem::whereIn('id', $settlementIds)
            ->where('status', 'unpaid')
            ->get();

        $sumFinalAmount = $settlementItems->sum('final_amount');
        $createdBy = $settlementItems->first()?->created_by;

        SettlementItem::whereIn('id', $settlementIds)
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
}
