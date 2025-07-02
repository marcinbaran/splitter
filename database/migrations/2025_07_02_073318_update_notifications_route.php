<?php

use App\Models\Notification;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            DB::table('notifications')
                ->where('route', 'orders.show')
                ->update(['route' => 'settlements.show']);

            DB::table('notifications')
                ->where('route_params', 'orders.show')
                ->update(['route_params' => 'settlements.show']);
        });

        Notification::where('route_params', 'like', '%orderId%')
            ->each(function ($notification) {
                $params = $notification->route_params;

                if (isset($params['orderId'])) {
                    $params['settlement'] = $params['orderId'];
                    unset($params['orderId']);

                    $notification->update(['route_params' => $params]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
