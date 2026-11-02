<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController
{
    public function register(Request $r)
    {
        $data = $r->validate(['name' => 'required|string|min:2|max:100', 'email' => 'required|email|max:255|unique:users', 'password' => 'required|string|min:8|max:128|confirmed']);
        $user = User::create($data);

        return response()->json($this->session($user), 201);
    }

    public function login(Request $r)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Credenciales incorrectas.']]);
        }

return $this->session($user);
    }

    private function session(User $user)
    {
        return ['user' => $user, 'token' => $user->createToken('nextjs', ['*'], now()->addHours(8))->plainTextToken];
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
