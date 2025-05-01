<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\society;
use Illuminate\Support\Facades\Log as Log;
use App\Models\Regional;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'id_card_number' => "required|string|max:8|min:8",
            'password' => "required|string",
        ]);

        $society = society::where("id_card_number", $validated["id_card_number"])->first();

        if (!$society || $society->password != $validated["password"]) {
            return response()->json([
                "message" => "ID Card Number or Password incorrect"
            ], 400);
        }
        $token = $society->createToken("society_token", ['society'])->plainTextToken;

        $regional = Regional::where('id', $society->regional_id)->first();

        $society->update(['login_tokens' => $token]);

        $society->refresh();

        $response = [
            "id" => $society->id,
            "id_card_number" => $society->id_card_number,
            "name" => $society->name,
            "born_date" => $society->born_date,
            "gender" => $society->gender,
            "address" => $society->address,
            "regional" => $regional,
            "login_tokens" => $society->login_tokens,
        ];
        return response()->json($response, 200);
    }

    public function logout(){

        auth()->user()->currentAccessToken()->delete();

        return response()->json([
            'Logout Success'
        ], 200);
    }

}
