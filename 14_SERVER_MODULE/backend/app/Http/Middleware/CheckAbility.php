<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAbility
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $requiredAbility): Response
    {

        $token = $request->user()->currentAccessToken();

        if(!in_array($requiredAbility, $token->abilities ?? [])){
            return response()->json([
                'status' => 'forbidden',
                'message' => 'You are not have permission',
            ], 403);
        }

        return $next($request);
    }
}
