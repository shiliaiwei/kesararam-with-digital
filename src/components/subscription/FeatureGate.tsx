"use client";

import { useEffect, useState } from "react";
import { checkSubscriptionAccess } from "@/app/actions/subscriptions";

interface FeatureGateProps {
    feature: "createClass" | "addStudent" | "analytics" | "customContent";
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on subscription access
 */
export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState<string>();

    useEffect(() => {
        checkSubscriptionAccess(feature)
            .then((result) => {
                setHasAccess(result.allowed);
                setReason("reason" in result ? result.reason : ("error" in result ? result.error : undefined));
            })
            .finally(() => setLoading(false));
    }, [feature]);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-10 rounded" />;
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">{reason || "Access denied"}</p>
            </div>
        );
    }

    return <>{children}</>;
}
