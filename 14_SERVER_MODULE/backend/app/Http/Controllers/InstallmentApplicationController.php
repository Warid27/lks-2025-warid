<?php

namespace App\Http\Controllers;

use App\Models\installment_apply_society;
use App\Models\AvailableMonth;
use App\Models\Installment;
use App\Models\Validation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as Log;

class InstallmentApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'installment_id' => "required",
            'months' => "required",
            'notes' => "required|string",
        ]);

        $societyUser = auth()->user();

        $validationUser = Validation::where("society_id", $societyUser->id)->first();

        if (!$validationUser || $validationUser->status != "accepted") {
            return response()->json([
                "message" => "Your data validator must be accepted by validator before"
            ], 401);
        }
        $installment = Installment::where("id", $validated["installment_id"])->first();
        if (!$installment) {
            return response()->json([
                "message" => "No available installment found for the provided installment ID."
            ], 404);
        }
        // Check if the user has already applied for the same installment
        $existingApplication = installment_apply_society::where('society_id', $societyUser->id)
            ->where('installment_id', $validated["installment_id"])
            ->exists();

        if ($existingApplication) {
            return response()->json([
                "message" => "Application for an installment can only be made once"
            ], 401);
        }

        // Corrected where condition
        $availableMonths = AvailableMonth::where('month', $validated["months"])
            ->where('installment_id', $validated["installment_id"])
            ->first(); // Use first() to get a single result

        if (!$availableMonths) {
            return response()->json([
                "message" => "No available months found for the provided month and installment ID."
            ], 404); // Handle the case where no available months are found
        }

        installment_apply_society::create([
            "notes" => $validated["notes"],
            "available_month_id" => $availableMonths->id,
            "date" => now(),
            "society_id" => $societyUser->id,
            "installment_id" => $validated["installment_id"],
        ]);

        return response()->json([
            "message" => "Applying for Instalment successful"
        ], 200);
    }


    /**
     * Display the specified resource.
     */
    public function show(installment_apply_society $installment_apply_society)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(installment_apply_society $installment_apply_society)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, installment_apply_society $installment_apply_society)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(installment_apply_society $installment_apply_society)
    {
        //
    }
}
