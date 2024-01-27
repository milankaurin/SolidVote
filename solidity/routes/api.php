<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
Route::post('/register', 'AuthController@register');
Route::post('/login', 'AuthController@login');
Route::post('/logout', 'AuthController@logout');

// API rute koje zahtevaju autentifikaciju
Route::middleware('auth:sanctum')->group(function () {
    // Rute za Contract model
    Route::apiResource('/contracts', 'ContractController');

    // Rute za Transaction model
    Route::apiResource('/transactions', 'TransactionController');
    
    
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
