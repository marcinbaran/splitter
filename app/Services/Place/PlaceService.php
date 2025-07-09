<?php

namespace App\Services\Place;

use App\Enums\PlaceType;
use App\Models\Place;

class PlaceService {
    public function create(
        string $name,
        PlaceType $type,
        string|null $logoUrl = null,
        string|null $menuUrl = null
    ) : Place|null {
        try {
            $place = Place::with([])->create([
                'name' => $name,
                'type' => $type,
                'logo_url' => $logoUrl,
                'menu_url' => $menuUrl,
            ]);
        }
        catch (\Exception $exception) {
            return null;
        }

        return $place;
    }

    public function update(
        Place & $place,
        string $name,
        PlaceType $type,
        string|null $logoUrl = null,
        string|null $menuUrl = null
    ) : bool|null {
        try {
            $update = $place->update([
                'name' => $name,
                'type' => $type,
                'logo_url' => $logoUrl,
                'menu_url' => $menuUrl,
            ]);
        }
        catch (\Exception $exception) {
            return null;
        }

        return $update;
    }
}
