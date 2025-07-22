<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable 
{
    use HasFactory,Notifiable;

    protected $table = "usuario";

    protected $fillable = [
        "name",
        "email",
        "password",
    ];

    protected $primaryKey = 'id';
    public $timestamps = false;

    public function reunion()
    {
        return $this->hasMany(Reunion::class);
    }
}
