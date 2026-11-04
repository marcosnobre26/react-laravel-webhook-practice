<?php

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_returns_ok_when_database_is_reachable(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'database' => 'ok',
            ]);
    }

    public function test_returns_503_when_database_is_down(): void
    {
        Log::spy();

        config(['database.connections.mysql.port' => 1]);
        DB::purge('mysql');

        $this->getJson('/api/health')
            ->assertStatus(503)
            ->assertExactJson([
                'status' => 'degraded',
                'database' => 'down',
            ]);

        Log::shouldHaveReceived('error')->once();
    }
}