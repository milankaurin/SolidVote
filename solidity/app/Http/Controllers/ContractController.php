<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index()
    {
        return Contract::all();
    }

    public function store(Request $request)
    {
        // Validacija i kreiranje novog ugovora
        // Validacija i kreiranje novog ugovora
        $validated = $request->validate([
            'name' => 'required|max:255',
            'address' => 'required|unique:contracts',
            // Ostale validacije
        ]);
        $contract = Contract::create($validated);
        return response()->json($contract, 201);
    }

    public function show($id)
    {
        return Contract::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
         // Ažuriranje ugovora
         $contract = Contract::findOrFail($id);
         $contract->update($request->all());
         return response()->json($contract, 200);
    }

    public function destroy($id)
    {
        // Brisanje ugovora
        $contract = Contract::findOrFail($id);
        $contract->delete();
        return response()->json(null, 204);
    }
}

