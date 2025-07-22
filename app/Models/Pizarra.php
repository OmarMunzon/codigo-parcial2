<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Pizarra extends Model
{
    use HasFactory,Notifiable;

    protected $table = "pizarra";
    protected $fillable = [
        "namefile",
        "fecha",        
        "id_reunion",
    ];

    protected $primaryKey = 'id';
    public $timestamps = false;

    public function reunion()
    {
         return $this->belongsTo(Reunion::class, 'id_reunion', 'id');
    }
}
