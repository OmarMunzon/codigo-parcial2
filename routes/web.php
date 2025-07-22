<?php

use App\Http\Controllers\ImageClassificationController;
use App\Http\Controllers\PizarraController;
use App\Http\Controllers\ReunionController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('prototipos.usuario.login');
})->middleware('guest');

Route::get('/register', [UsuarioController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [UsuarioController::class, 'register']);
Route::get('/login', [ UsuarioController::class, 'showLoginForm'])->name('login');
Route::post('/login', [UsuarioController::class, 'login']);
Route::post('/logout', [UsuarioController::class, 'logout'])->name('logout');

Route::get('/reunion',[ReunionController::class,'index'])->name('reunion');

Route::get('/pizarra',[ReunionController::class,'create'])->name('reunion.create');
Route::post('/pizarra',[ReunionController::class,'join'])->name('reunion.join');
Route::get('/finalizar',[ReunionController::class,'finalizar'])->name('reunion.finalizar');

Route::get('/pizarra/{link}',[PizarraController::class,'index'])->name('pizarra');
Route::post('/pizarra-guardar',[PizarraController::class,'guardar']);

//websocket
Route::post('/broadcast-component-dropped', [PizarraController::class, 'broadcastButtonDropped']);
Route::post('/broadcast-component-moved', [PizarraController::class, 'broadcastButtonMoved']);
Route::post('/broadcast-finalizar', [ReunionController::class, 'broadcastFinalizar']);
Route::post('/element-name',[PizarraController::class,'selectElement']);
Route::post('/clear-canvas',[PizarraController::class,'clearCanvas']);
Route::post('/cambiar-color',[PizarraController::class,'cambiarColor']);
Route::post('/resize-elemento',[PizarraController::class,'resizeElemento']);
Route::post('/detectar', [PizarraController::class, 'detectarObjeto']);
Route::post('/enviar-nota', [PizarraController::class, 'enviarNota']);

