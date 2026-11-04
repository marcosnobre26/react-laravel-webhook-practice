<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class HealthController extends Controller
{
    /**
     * Readiness check: confirms the API can reach its database.
     */
    public function __invoke(): JsonResponse
    {
        try {
            DB::select('SELECT 1');
        } catch (Throwable $e) {
            Log::error('Health check failed: database unreachable.', [
                'exception' => $e,
            ]);

            return response()->json([
                'status' => 'degraded',
                'database' => 'down',
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'database' => 'ok',
        ]);
    }
}