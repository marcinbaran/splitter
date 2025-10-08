<?php

namespace App\Enums;

enum PlaceType : string {
    case Restaurant = 'restaurant';
    case Shop = 'shop';

    public function label() : string {
        return match ($this) {
            self::Restaurant => 'Restauracja',
            self::Shop => 'Sklep',
        };
    }
}
