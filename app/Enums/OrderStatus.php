<?php

namespace App\Enums;

enum OrderStatus : int {
    case Cancelled = -1;
    case Open = 0;
    case Locked = 1;
    case Finished = 2;
    case Delivered = 3;
    case Settlement = 4;
}
