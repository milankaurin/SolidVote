<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Registracija korisnika
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function login(Request $request)
    {
        // Logovanje korisnika
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = $request->user();
        // Generišite token i vratite ga, ako koristite Sanctum ili slično

        return response()->json(['message' => 'Success']);
    }

    public function logout(Request $request)
    {
        // Odjavljivanje korisnika
        Auth::logout();
        return response()->json(['message' => 'Successfully logged out']);
    }
}
