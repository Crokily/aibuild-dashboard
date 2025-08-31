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
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated loading icon with theme colors */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
        <div className="relative bg-accent/10 p-3 rounded-full border border-border/50">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        </div>
      </div>
      <span className="text-muted-foreground font-medium tracking-wide">{message}</span>
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
        <Card className="border-border shadow-lg">
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
    <div className={`animate-pulse bg-muted/50 rounded-lg border border-border/30 ${className}`} />
  );
}

// Chart skeleton specifically for dashboard
export function ChartSkeleton() {
  return (
    <Card className="border-border shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="space-y-2">
            <SkeletonLoader className="h-6 w-48" />
            <SkeletonLoader className="h-4 w-32" />
          </div>
          
          {/* Chart area skeleton */}
          <div className="relative">
            <SkeletonLoader className="h-64 w-full" />
            {/* Subtle overlay pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-pulse"></div>
          </div>
          
          {/* Legend skeleton */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <SkeletonLoader className="h-3 w-3 rounded-full" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <SkeletonLoader className="h-3 w-3 rounded-full" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <SkeletonLoader className="h-3 w-3 rounded-full" />
              <SkeletonLoader className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
