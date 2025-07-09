<?php

namespace App\Models;

use App\Enums\PlaceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Place extends Model {
    protected $fillable = [
        'name',
        'type',
        'logo_url',
        'menu_url',
    ];

    public function orders() : HasMany {
        return $this->hasMany(Order::class);
    }

    public function slackAccessory() : array {
        return [
            'type' => 'image',
            'image_url' => $this->logo_url ?? asset('images/logo.png'),
            'alt_text' => $this->name,
        ];
    }

    protected function casts() : array {
        return [
            'type' => PlaceType::class,
        ];
    }
}
