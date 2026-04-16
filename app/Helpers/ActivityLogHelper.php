<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogHelper
{
    public static function log(
        $module,
        $action,
        $description = null,
        $barangayId = null,
        $extra = []
    ) {
        $user = Auth::user();

        if (!$user) {
            return; // prevent guest logging
        }

        ActivityLog::create([
            'user_id'      => $user->id,
            'barangay_id'  => isset($barangayId)
                ? $barangayId
                : $user->barangay_id,
            'role'         => $user->role,
            'module'       => strtoupper($module),
            'action_type'  => strtoupper($action),
            'description'  => self::formatDescription($description, $extra),
            'created_at'   => now('Asia/Manila'),
            'updated_at'   => now('Asia/Manila'),
        ]);
    }

    /**
     * Format description with structured details
     */
    private static function formatDescription($description, $extra = [])
    {
        if (empty($extra)) {
            return $description;
        }

        $details = [];

        foreach ($extra as $key => $value) {
            $details[] = is_array($value)
                ? "{$key}: " . json_encode($value, JSON_UNESCAPED_UNICODE)
                : "{$key}: {$value}";
        }

        return trim($description) . ' | ' . implode(' | ', $details);
    }
}
