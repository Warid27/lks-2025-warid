<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ValidationController;
use App\Http\Controllers\InstallmentController;


Route::prefix('v1')->group(function () {
    Route::post("/auth/login",[AuthController::class,"login"]);
    Route::middleware("auth:sanctum")->group(function () {
        Route::post("/auth/logout",[AuthController::class,"logout"]);

        Route::post("/validation",[ValidationController::class,"store"]);
        Route::get("/validation",[ValidationController::class,"index"]);

        Route::get("/installment_cars",[InstallmentController::class,"index"]);

    });
});
