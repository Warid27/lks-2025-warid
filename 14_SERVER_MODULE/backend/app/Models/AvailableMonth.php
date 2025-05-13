<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailableMonth extends Model
{
    use HasFactory;

    protected $table = "available_months";

    protected $fillable = [
        "month",
        "installment_id",
        "description",
        "nominal",
    ];

    public function installment()
    {
        return $this->belongsTo(Installment::class);
    }

}
