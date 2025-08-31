"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "inline" | "fullscreen";
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  variant = "card" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const LoadingContent = () => (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  );

  switch (variant) {
    case "fullscreen":
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center">
          <LoadingContent />
        </div>
      );
    
    case "inline":
      return <LoadingContent />;
    
    case "card":
    default:
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoadingContent />
          </CardContent>
        </Card>
      );
  }
}

// Skeleton loading component for more specific use cases
export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

// Chart skeleton specifically for dashboard
export function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <SkeletonLoader className="h-4 w-48" />
          <SkeletonLoader className="h-64 w-full" />
          <div className="flex space-x-4">
            <SkeletonLoader className="h-3 w-16" />
            <SkeletonLoader className="h-3 w-16" />
            <SkeletonLoader className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
