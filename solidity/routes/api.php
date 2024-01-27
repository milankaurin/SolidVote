<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// API rute za korisnike
Route::post('/register', [AuthController::class, 'register']);
// Logovanje korisnika
Route::post('/login', [AuthController::class, 'login']);

// Odjavljivanje korisnika
Route::post('/logout', [AuthController::class, 'logout']);

// Dohvatanje svih transakcija
Route::get('/transactions', [TransactionController::class, 'index']);

// Kreiranje nove transakcije
Route::post('/transactions', [TransactionController::class, 'store']);

// Dohvatanje pojedinačne transakcije
Route::get('/transactions/{id}', [TransactionController::class, 'show']);

// Ažuriranje transakcije
Route::put('/transactions/{id}', [TransactionController::class, 'update']);

// Brisanje transakcije
Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);


// Dohvatanje svih ugovora
Route::get('/contracts', [ContractController::class, 'index']);

// Kreiranje novog ugovora
Route::post('/contracts', [ContractController::class, 'store']);

// Dohvatanje pojedinačnog ugovora
Route::get('/contracts/{id}', [ContractController::class, 'show']);

// Ažuriranje ugovora
Route::put('/contracts/{id}', [ContractController::class, 'update']);

// Brisanje ugovora
Route::delete('/contracts/{id}', [ContractController::class, 'destroy']);


// API rute koje zahtevaju autentifikaciju
Route::middleware('auth:sanctum')->group(function () {
   
    
    
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
