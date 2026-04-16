<?php

namespace App\Services;

use App\Helpers\ActivityLogHelper;
use App\Models\CRAProgress;

class CraLogger
{
    public static function resolveAction($user, $barangay_id, $cra_id)
    {
        if ($user?->role === 'cdrrmo_admin') {
            return 'UPDATE';
        }

        $exists = CRAProgress::where('barangay_id', $barangay_id)
            ->where('cra_id', $cra_id)
            ->exists();

        return $exists ? 'UPDATE' : 'CREATE';
    }

    /**
     * Main CRA Logger
     */
    public static function log($user, $cra, $barangay_id, $changes = [])
    {
        $action = self::resolveAction($user, $barangay_id, $cra->id);

        $username = $user?->username ?? 'Unknown User';
        $role = strtoupper($user?->role ?? 'UNKNOWN');

        // 🔹 Base description
        $description = "{$username} ({$role}) ";

        if ($action === 'UPDATE') {
            $description .= "updated CRA";
        } else {
            $description .= "created CRA";
        }

        $description .= " for year {$cra->year} (CRA ID: {$cra->id}, Barangay ID: {$barangay_id})";

        // 🔹 Add field changes (optional but powerful)
        if (!empty($changes)) {
            $formattedChanges = [];

            foreach ($changes as $field => $values) {
                $old = $values['old'] ?? 'null';
                $new = $values['new'] ?? 'null';

                $formattedChanges[] = "{$field}: '{$old}' → '{$new}'";
            }

            $description .= ". Changes: " . implode(', ', $formattedChanges);
        }

        ActivityLogHelper::log(
            'CRA',
            $action,
            $description,
            $barangay_id
        );
    }
}
