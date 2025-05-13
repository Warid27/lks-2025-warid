<?php

namespace App\Http\Controllers;

use App\Models\Validation;
use App\Models\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as Log;
use App\Models\JobCategory;

class ValidationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Validation::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info("EXECUTED");
        $validated = $request->validate([
            'job' => "string|required",
            'job_description' => "string|required",
            'income' => "required",
            'reason_accepted' => "string|required",
        ]);

        $societyId = auth()->user()->id;
        $jobCategoryId = JobCategory::where("id", $validated['job'])->first();

        if (!$jobCategoryId) {
            return response()->json([
                "message" => "Job Category Not Found"
            ], 400);
        }
        $reqBody = [
            "society_id" => $societyId,
            "job_category_id" => $validated['job'],
            "job_position" => $validated["job_description"],
            "income" => $validated["income"],
            "reason_accepted" => $validated["reason_accepted"],
            "validator_id" => null,
            "status" => 'pending'
        ];

        Validation::create($reqBody);

        return response()->json([
            "message" => "Request data Validation sent"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Validation $validation)
    {
        //
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'validator_notes' => 'required|string',
            'work_experience' => 'required|string',
            'status' => 'required|in:accepted,rejected',
        ]);

        $user = auth()->user();
        $validation = Validation::find($id);
        $validator_notes = $user->validator->name . ": " . $validated["validator_notes"];

        Log::info("USER: {$user}");
        Log::info("VALIDATION: {$validation}");

        $validation->update([
            "validator_notes" => $validator_notes,
            "status"=> $validated["status"],
            "validator_id" => $user->validator->id,
            "work_experience" => $validated["work_experience"],
        ]);

        return response()->json([
            "message" => "Validation data updated"
        ], 200);
    }

    public function destroy(Validation $validation)
    {
        $validation->delete();

        return response()->json([
            "message" => "Validation data deleted"
        ], 200);
    }
}
