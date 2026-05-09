"use client";

import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/app/actions/subscriptions";

interface SubscriptionInfo {
    plan: string;
    planName: string;
    status: string;
    endsAt: Date | null;
}

export function SubscriptionBadge() {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentSubscription()
            .then(({ subscription }) => {
                setSubscription(subscription);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-6 w-24 rounded" />;
    }

    if (!subscription) return null;

    const getBadgeColor = () => {
        switch (subscription.plan) {
            case "school":
                return "bg-purple-100 text-purple-800 border-purple-300";
            case "teacher_pro":
                return "bg-blue-100 text-blue-800 border-blue-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeColor()}`}>
            {subscription.planName}
        </div>
    );
}
