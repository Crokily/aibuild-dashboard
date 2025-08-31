"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  // Using theme-aware colors that work with both light and dark modes
  const styles = {
    error: {
      iconColor: "text-destructive",
      titleColor: "text-destructive",
      messageColor: "text-muted-foreground",
      buttonVariant: "destructive" as const
    },
    warning: {
      iconColor: "text-primary",
      titleColor: "text-primary", 
      messageColor: "text-muted-foreground",
      buttonVariant: "default" as const
    },
    info: {
      iconColor: "text-primary",
      titleColor: "text-foreground",
      messageColor: "text-muted-foreground", 
      buttonVariant: "default" as const
    }
  };

  const style = styles[variant];

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
          <svg className={`h-8 w-8 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        );
      case "info":
        return (
          <svg className={`h-8 w-8 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        );
      case "warning":
        return (
          <svg className={`h-8 w-8 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        );
      default:
        return (
          <svg className={`h-8 w-8 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-border shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
            {/* Icon with subtle background */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl"></div>
              <div className="relative bg-accent/10 p-4 rounded-full border border-border/50">
                {getIcon()}
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-3 max-w-md">
              <h3 className={`text-xl font-semibold ${style.titleColor} tracking-tight`}>
                {title}
              </h3>
              <p className={`${style.messageColor} leading-relaxed`}>
                {message}
              </p>
            </div>
            
            {/* Action Button */}
            <Button 
              onClick={handleAction}
              variant={style.buttonVariant}
              size="lg"
              className="mt-6 min-w-[120px] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {actionLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
