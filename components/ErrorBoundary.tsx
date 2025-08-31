"use client";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
}

export function ErrorState({ 
  title, 
  message, 
  actionLabel = "Retry", 
  actionHref,
  onRetry,
  variant = "error" 
}: ErrorStateProps) {
  const colors = {
    error: {
      border: "border-red-200",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      messageColor: "text-red-700",
      buttonBg: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      messageColor: "text-yellow-700",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      messageColor: "text-blue-700",
      buttonBg: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const style = colors[variant];

  const handleAction = () => {
    if (onRetry) {
      onRetry();
    } else if (actionHref) {
      window.location.href = actionHref;
    } else {
      window.location.reload();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "error":
        return (
          <svg className={`h-6 w-6 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        );
      case "info":
        return (
          <svg className={`h-6 w-6 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-4.5A1.125 1.125 0 0 1 10.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H6A1.125 1.125 0 0 1 4.875 1.5H3a.75.75 0 0 0-.75.75v11.25c0 .414.336.75.75.75h3.875c.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h4.5A3.375 3.375 0 0 0 16.5 14.25Z" />
          </svg>
        );
      default:
        return (
          <svg className={`h-6 w-6 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`rounded-lg border ${style.border} ${style.bg} p-6 text-center`}>
          <div className={`mx-auto mb-4 h-12 w-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
            {getIcon()}
          </div>
          <h3 className={`text-lg font-semibold ${style.titleColor} mb-2`}>{title}</h3>
          <p className={`${style.messageColor} mb-4`}>{message}</p>
          <Button 
            onClick={handleAction}
            className={`inline-flex items-center px-4 py-2 text-white rounded-md transition-colors ${style.buttonBg}`}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
