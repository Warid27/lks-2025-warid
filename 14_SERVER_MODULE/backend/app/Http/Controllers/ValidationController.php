<?php

namespace App\Http\Controllers;

use App\Models\validation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as Log;
use Illuminate\Validation\ValidationException;
use App\Models\JobCategory;

class ValidationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return validation::all();
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
        Log::info("EXECUTED");
        $validated = $request->validate([
            'job' => "string|required",
            'job_description' => "string|required",
            'income' => "required",
            'reason_accepted' => "string|required",
        ]);

        $societyId = auth()->user()->id;
        $jobCategoryId = JobCategory::where("id", $validated['job'])->first();

       if(!$jobCategoryId){
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
        ];
        Log::info("REQBODY");
        validation::create($reqBody);

        return response()->json([
            "message" => "Request data validation sent"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(validation $validation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(validation $validation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, validation $validation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(validation $validation)
    {
        //
    }
}
