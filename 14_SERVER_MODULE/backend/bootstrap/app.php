<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(EnsureFrontendRequestsAreStateful::class);
        $middleware->validateCsrfTokens(except: [
            'api/*'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*')) {
                $header = $request->header("Authorization");
                if (is_null($header)) {

                    return response()->json([
                        'message' => "missing token"
                    ], 401);
                }
                return response()->json([
                    'message' => "invalid token"
                ], 401);
            };
        });
        $exceptions->renderable(function (RouteNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                $header = $request->header("Authorization");
                if (is_null($header)) {

                    return response()->json([
                        'message' => "missing token"
                    ], 401);
                }
                return response()->json([
                    'message' => "Unauthorized user"
                ], 401);
            };
        });
    })->create();
