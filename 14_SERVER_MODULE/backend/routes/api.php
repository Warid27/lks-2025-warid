<?php

use App\Http\Controllers\InstallmentApplicationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ValidationController;
use App\Http\Controllers\InstallmentController;


Route::prefix('v1')->group(function () {
    Route::post('/auth/login/{type}', [AuthController::class, 'login'])
        ->where('type', 'user|society');
    Route::middleware("auth:sanctum")->group(function () {
        Route::post("/auth/logout", [AuthController::class, "logout"]);

        Route::middleware(['ability:society'])->group(function () {
            Route::post("/applications", [InstallmentApplicationController::class, "store"]);
            Route::post("/validation", [ValidationController::class, "store"]);
            Route::get("/installment_cars", [InstallmentController::class, "index"]);
            Route::get("/installment_cars/{id}", [InstallmentController::class, "show"]);
        });
        Route::middleware(['ability:validator'])->group(function () {

            Route::put("/validation/{id}", [ValidationController::class, "update"]);
            Route::get("/validation", [ValidationController::class, "index"]);
        });


    });
});
