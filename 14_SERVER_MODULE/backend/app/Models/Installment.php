<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Installment extends Model
{
    use HasFactory;

    protected $fillable = ['brand_id', 'cars', 'description', 'price'];

    public function brands(){
        return $this->hasMany(Brand::class);
    }
}
