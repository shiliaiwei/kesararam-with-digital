"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/toast-container";

interface QuestionFormModalProps {
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function QuestionFormModal({ initialData, onClose, onSuccess }: QuestionFormModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement form submission
            showToast("Question form coming soon!", "info");
            onSuccess();
        } catch (error) {
            showToast("Failed to save question", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                style={{ boxShadow: "12px 12px 0 #000" }}
            >
                {/* Header */}
                <div className="bg-green-400 border-b-4 border-black p-6 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-2xl font-black">
                        {initialData ? "Edit Question" : "Create New Question"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="text-center py-12">
                        <p className="text-xl font-black text-zinc-500 mb-4">
                            Question Form Coming Soon!
                        </p>
                        <p className="text-sm text-zinc-400">
                            This will include topic selection, question type picker, and dynamic answer forms.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t-2 border-black">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-black bg-white font-black hover:shadow-[2px_2px_0_#000] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 border-2 border-black bg-green-400 font-black hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : initialData ? "Update Question" : "Create Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
