<?php

namespace App\Http\Controllers;

use App\Models\Society;
use App\Models\Regional;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(Request $request, $type)
    {
        try {
            // Define validation rules
            $rules = $type === 'user' ? [
                'username' => 'required|string',
                'password' => 'required|string',
            ] : [
                'id_card_number' => 'required|string|size:8',
                'password' => 'required|string',
            ];

            // Validate request
            $validated = $request->validate($rules);

            // Determine model and credentials
            $isUser = $type === 'user';
            $model = $isUser ? User::class : Society::class;
            $identifier = $isUser ? 'username' : 'id_card_number';
            $credential = $validated[$identifier];

            // Find record
            $record = $model::where($identifier, $credential)->first();

            // Verify credentials
            $isValidPassword = $isUser
                ? $record && Hash::check($validated['password'], $record->password)
                : $record && $validated['password'] === $record->password;

            if (!$isValidPassword) {
                Log::warning("Failed login attempt for $identifier: $credential");
                throw ValidationException::withMessages([
                    $identifier => ["Invalid $identifier or password"],
                ]);
            }

            // Determine token abilities based on validator roles
            $abilities = [$type]; // Default ability: 'user' or 'society'
            if (method_exists($record, 'validator')) {
                $validatorRoles = $record->validator()->pluck('role')->unique()->toArray();
                $abilities = array_merge($abilities, $validatorRoles);
            }

            // Generate token with abilities
            $tokenType = $isUser ? 'user' : 'society';
            $token = $record->createToken("{$tokenType}_token", $abilities)->plainTextToken;
            $record->update(['login_tokens' => $token]);
            Log::info("RECORD: {$record}");
            // Prepare response data
            $data = $isUser ? [
                'id' => $record->id,
                'username' => $record->username,
                'name' => $record->validator->name ?? null,
                'role' => $record->validator->role ?? null,
                'login_tokens' => $token,
            ] : [
                'id' => $record->id,
                'id_card_number' => $record->id_card_number,
                'name' => $record->name,
                'born_date' => $record->born_date,
                'gender' => $record->gender,
                'address' => $record->address,
                'regional' => ($regional = Regional::find($record->regional_id))
                    ? ['id' => $regional->id, 'province' => $regional->province, 'district' => $regional->district]
                    : null,
                'login_tokens' => $token,
            ];

            return response()->json([
                'message' => 'Login successful',
                'data' => $data,
            ], 200);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error("$type login error: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logout successful',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            throw $e; // Handled by global exception handler
        }
    }
}
