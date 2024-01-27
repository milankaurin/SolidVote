<?php

namespace App\Http\Controllers;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        // Dohvatanje svih transakcija
        return Transaction::all();
    }

    public function store(Request $request)
    {
        // Validacija i kreiranje nove transakcije
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'sender' => 'required',
            'receiver' => 'required',
            'transaction_hash' => 'required|unique:transactions',
            'contract_id' => 'required|exists:contracts,id'
        ]);

        $transaction = Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function show($id)
    {
        // Prikazivanje određene transakcije
        return Transaction::findOrFail($id);
    }

   

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
         // Pronalazak i ažuriranje transakcije
    $transaction = Transaction::findOrFail($id);

    $validated = $request->validate([
        'amount' => 'required|numeric',
        'sender' => 'required',
        'receiver' => 'required',
        'transaction_hash' => 'required|unique:transactions,transaction_hash,' . $id, // Osigurati jedinstvenost, osim za trenutni red
        'contract_id' => 'required|exists:contracts,id'
    ]);

    $transaction->update($validated);
    return response()->json($transaction, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Pronalazak i brisanje transakcije
    $transaction = Transaction::findOrFail($id);
    $transaction->delete();

    return response()->json(null, 204); // 204 No Content - uspešno izvršeno bez vraćanja sadržaja
    }
}
