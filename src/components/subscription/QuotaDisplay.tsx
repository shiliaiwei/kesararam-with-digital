"use client";

import { useEffect, useState } from "react";
import { getUserQuotaInfo } from "@/app/actions/subscriptions";

interface Quota {
    plan: string;
    planName: string;
    classes: {
        current: number;
        max: number;
        remaining: number | string;
    };
    students: {
        current: number;
        max: number;
        remaining: number | string;
    };
    features: {
        analytics: boolean;
        customContent: boolean;
    };
}

export function QuotaDisplay() {
    const [quota, setQuota] = useState<Quota | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserQuotaInfo()
            .then(({ quota }) => {
                if (quota) setQuota(quota);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-32 rounded" />;
    }

    if (!quota) return null;

    const getProgressColor = (current: number, max: number) => {
        if (max === -1) return "bg-green-500";
        const percentage = (current / max) * 100;
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const formatRemaining = (remaining: number | string) => {
        return remaining === "unlimited" ? "∞" : remaining;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Quota</h3>
                <span className="text-sm text-gray-500">{quota.planName}</span>
            </div>

            {/* Classes */}
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Classes</span>
                    <span className="text-gray-600">
                        {quota.classes.current} / {quota.classes.max === -1 ? "∞" : quota.classes.max}
                    </span>
                </div>
                {quota.classes.max !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getProgressColor(
                                quota.classes.current,
                                quota.classes.max
                            )}`}
                            style={{
                                width: `${Math.min((quota.classes.current / quota.classes.max) * 100, 100)}%`,
                            }}
                        />
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {formatRemaining(quota.classes.remaining)} remaining
                </p>
            </div>

            {/* Students */}
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Students</span>
                    <span className="text-gray-600">
                        {quota.students.current} / {quota.students.max === -1 ? "∞" : quota.students.max}
                    </span>
                </div>
                {quota.students.max !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getProgressColor(
                                quota.students.current,
                                quota.students.max
                            )}`}
                            style={{
                                width: `${Math.min((quota.students.current / quota.students.max) * 100, 100)}%`,
                            }}
                        />
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {formatRemaining(quota.students.remaining)} remaining
                </p>
            </div>

            {/* Features */}
            <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Features</p>
                <div className="flex gap-2 flex-wrap">
                    {quota.features.analytics && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Analytics
                        </span>
                    )}
                    {quota.features.customContent && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Custom Content
                        </span>
                    )}
                    {!quota.features.analytics && !quota.features.customContent && (
                        <span className="text-xs text-gray-500">No premium features</span>
                    )}
                </div>
            </div>
        </div>
    );
}
