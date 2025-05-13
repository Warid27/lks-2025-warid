<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as Log;

class InstallmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cars = Installment::with(['brands', 'available_month'])->get();

        $data = $cars->map(function ($car) {
            return [
                'id' => $car->id,
                'car' => $car->cars,
                'brand' => $car->brands->brand ?? null,
                'price' => $car->price,
                'description' => $car->description,
                'available_month' => $car->available_month->map(function ($month) {
                    return [
                        'month' => $month->month,
                        'description' => $month->description,
                        'nominal' => $month->nominal,
                    ];
                }),
            ];
        });
        return response()->json(['cars' => $data]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {

        $car = Installment::with(['brands', 'available_month'])->where('id', $id)->first();

        if (!$car) {
            return response()->json(['message' => 'Car not found'], 404);
        }
        $data = [
            'id' => $car->id,
            'car' => $car->cars,
            'brand' => $car->brands->brand ?? null,
            'price' => $car->price,
            'description' => $car->description,
            'available_month' => $car->available_month->map(function ($month) {
                return [
                    'month' => $month->month,
                    'description' => $month->description,
                    'nominal' => $month->nominal,
                ];
            }),
        ];
        return response()->json(['car' => $data]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Installment $installment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Installment $installment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Installment $installment)
    {
        //
    }
}
