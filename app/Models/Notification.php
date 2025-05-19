<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'route_params' => 'array',
        'read' => 'boolean',
    ];

    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function unreadNotifications()
    {
        return $this->notifications()->unread();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
