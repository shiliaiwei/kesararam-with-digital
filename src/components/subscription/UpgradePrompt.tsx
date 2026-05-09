"use client";

import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/app/actions/subscriptions";

interface UpgradePromptProps {
    feature: string;
    requiredPlan: "teacher_pro" | "school";
    children?: React.ReactNode;
}

export function UpgradePrompt({ feature, requiredPlan, children }: UpgradePromptProps) {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<string>("free");

    useEffect(() => {
        getCurrentSubscription()
            .then(({ subscription }) => {
                if (subscription) {
                    setCurrentPlan(subscription.plan);

                    // Check if user has required plan
                    const planPriority: Record<string, number> = {
                        free: 0,
                        teacher_pro: 1,
                        school: 2,
                    };

                    const userPriority = planPriority[subscription.plan] || 0;
                    const requiredPriority = planPriority[requiredPlan] || 0;

                    setHasAccess(userPriority >= requiredPriority);
                }
            })
            .finally(() => setLoading(false));
    }, [requiredPlan]);

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-32 rounded" />;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    const planNames: Record<string, string> = {
        teacher_pro: "Teacher Pro",
        school: "School",
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="mb-4">
                <svg
                    className="w-16 h-16 mx-auto text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature} Requires Upgrade
            </h3>

            <p className="text-gray-600 mb-4">
                Upgrade to <span className="font-semibold">{planNames[requiredPlan]}</span> to unlock this feature
            </p>

            <div className="flex gap-3 justify-center">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Upgrade Now
                </button>
                <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Learn More
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
                Current plan: <span className="font-medium">{currentPlan}</span>
            </p>
        </div>
    );
}
