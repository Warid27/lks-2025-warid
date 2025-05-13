<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class installment_apply_society extends Model
{
    use HasFactory;

    protected $fillable = [
        "installment_id",
        "available_month_id",
        "date",
        "society_id",
        "notes"
    ];

    public $timestamps = false;

}
