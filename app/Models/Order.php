<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Observers\OrderObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([OrderObserver::class])]
class Order extends Model {
    protected $fillable = [
        'place_id',
        'user_id',
        'settlement_id',
        'uuid',
        'menu_url',
        'date',
        'status',
    ];

    public function place() : BelongsTo {
        return $this->belongsTo(Place::class);
    }

    public function user() : BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function items() : HasMany {
        return $this->hasMany(OrderItem::class);
    }

    public function settlement() : BelongsTo {
        return $this->belongsTo(Settlement::class);
    }

    public function getUrlAttribute() : string {
        return route('orders.show', ['uuid' => $this->uuid]);
    }

    protected function casts() : array {
        return [
            'place_id' => 'integer',
            'user_id' => 'integer',
            'settlement_id' => 'integer',
            'status' => OrderStatus::class,
        ];
    }
}
