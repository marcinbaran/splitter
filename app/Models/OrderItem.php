<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model {
    protected $fillable = [
        'order_id',
        'user_id',
        'name',
        'amount',
    ];

    public function order(): BelongsTo {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    protected function casts() : array {
        return [
            'amount' => 'float',
        ];
    }
}
