<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SettlementItem extends Model
{
    use SoftDeletes;

    protected $guarded = [
        'id'
    ];

    public function settlement()
    {
        return $this->belongsTo(Settlement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
