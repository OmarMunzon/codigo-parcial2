<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Reunion extends Model
{
    use HasFactory,Notifiable;
    
    protected $table = "reunion";
    protected $fillable = [
        "fecha",
        "rol_acceso",
        "link",
        "estado",
        "id_usuario",
    ];

    protected $primaryKey = 'id';
    public $timestamps = false;

    public function usuario()
    {
        return $this->hasOne(Usuario::class);
    }

    public function pizarra()
    {
        //return $this->hasMany(Pizarra::class);
        return $this->hasMany(Pizarra::class, 'id_reunion', 'id');
    }
}
