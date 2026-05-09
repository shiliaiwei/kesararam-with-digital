"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastNotificationProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const TOAST_STYLES = {
  success: {
    bg: "bg-green-400",
    border: "border-green-600",
    icon: CheckCircle,
  },
  error: {
    bg: "bg-red-400",
    border: "border-red-600",
    icon: XCircle,
  },
  warning: {
    bg: "bg-yellow-400",
    border: "border-yellow-600",
    icon: AlertCircle,
  },
  info: {
    bg: "bg-blue-400",
    border: "border-blue-600",
    icon: Info,
  },
};

export function ToastNotification({
  message,
  type = "info",
  duration = 4000,
  onClose,
}: ToastNotificationProps) {
  const style = TOAST_STYLES[type];
  const Icon = style.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`${style.bg} border-2 ${style.border} border-black p-4 min-w-[300px] max-w-md animate-slide-in`}
      style={{ boxShadow: "4px 4px 0 #000" }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1 font-bold text-sm">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-black/10 p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
