<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use \App\Http\Middleware\CheckAbility;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Append Sanctum's stateful middleware for API authentication
        $middleware->append(EnsureFrontendRequestsAreStateful::class);

        // Exempt API routes from CSRF token validation
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        $middleware->alias([
            'ability' => CheckAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle ValidationException for API routes
        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return new JsonResponse([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Handle AccessDeniedHttpException for authentication/authorization issues
        $exceptions->render(function (AccessDeniedHttpException $e, $request) {
            if ($request->is('api/*')) {
                $header = $request->header('Authorization');
                $message = is_null($header) ? 'Missing token' : 'Invalid token';
                return new JsonResponse([
                    'message' => $message,
                ], 401);
            }
        });

        // Handle RouteNotFoundException for invalid routes
        $exceptions->render(function (RouteNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                $header = $request->header('Authorization');
                $message = is_null($header) ? 'Missing token' : 'Unauthorized user';
                return new JsonResponse([
                    'message' => $message,
                ], 401);
            }
        });

        // Handle other HttpExceptions
        $exceptions->render(function (HttpException $e, $request) {
            if ($request->is('api/*')) {
                return new JsonResponse([
                    'message' => $e->getMessage() ?: 'An error occurred',
                ], $e->getStatusCode());
            }
        });

        // Fallback for unhandled exceptions
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                \Illuminate\Support\Facades\Log::error('Unhandled exception: ' . $e->getMessage(), [
                    'exception' => $e,
                ]);
                return new JsonResponse([
                    'message' => 'An unexpected error occurred',
                ], 500);
            }
        });
    })->create();
