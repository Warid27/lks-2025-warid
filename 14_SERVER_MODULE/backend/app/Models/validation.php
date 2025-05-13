<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Validation extends Model
{
    use HasFactory;

    protected $fillable = [
        'society_id',
        'validator_id',
        'job_category_id',
        'status',
        'work_experience',
        'job_position',
        'reason_accepted',
        'validator_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

