"use client";

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, X, Sparkles } from 'lucide-react';
import type { ProductKPI } from './DataAnalysis';

interface AIAnalysisProps {
  productKPIs: ProductKPI[];
}

export function AIAnalysis({ productKPIs }: AIAnalysisProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset AI content when productKPIs change
  useEffect(() => {
    setMessages([]);
    setIsLoading(false);
  }, [productKPIs]);

  // Manual trigger function for click
  const triggerAnalysis = useCallback(async () => {
    if (productKPIs.length === 0 || isLoading) {
      return;
    }
    
    setIsLoading(true);
    setMessages([]);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productKPIs }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      let content = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        content += chunk;
        
        // Update messages with streaming content
        setMessages([{ role: 'assistant', content }]);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setMessages([{ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while analyzing your data. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [productKPIs, isLoading]);

  const handleStop = () => {
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    triggerAnalysis();
  };

  // Get the AI response
  const aiResponse = messages.find((m) => m.role === 'assistant')?.content;
  const hasAnalysis = aiResponse && aiResponse.trim().length > 0;

  // Format the AI response for better display
  const formatResponse = (text: string) => {
    // Split by bullet points and format
    const lines = text.split('\n').filter(line => line.trim());
    const analysisLines: string[] = [];
    const recommendations: string[] = [];
    
    let inRecommendations = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        recommendations.push(trimmed.replace(/^[•\-*]\s*/, ''));
        inRecommendations = true;
      } else if (!inRecommendations && trimmed) {
        analysisLines.push(trimmed);
      }
    }
    
    return { analysis: analysisLines.join(' '), recommendations };
  };

  // Process markdown bold formatting
  const processMarkdown = (text: string) => {
    // Convert **text** to <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const formatted = aiResponse ? formatResponse(aiResponse) : null;

  if (productKPIs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          AI-Powered Insights
        </h3>
        
        {hasAnalysis && !isLoading && (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleRegenerate}
              className="cursor-pointer bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          </div>
        )}
      </div>

      <Card 
        className={`border-border shadow-lg transition-all duration-200 ${
          !isLoading && !hasAnalysis
            ? 'cursor-pointer hover:bg-accent/50 hover:border-primary/30 hover:shadow-xl' 
            : ''
        }`}
        onClick={!isLoading && !hasAnalysis ? triggerAnalysis : undefined}
      >
        <CardContent className="">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                <span className="text-sm font-medium">Analyzing data...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStop();
                  }}
                  className="ml-auto h-6 w-6 p-0 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Animated skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 bg-muted/30 rounded animate-pulse w-4/5" />
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-4/5" />
                </div>
              </div>
            </div>
          ) : formatted ? (
            <div className="space-y-4">
              {/* Analysis */}
              {formatted.analysis && (
                <p 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: processMarkdown(formatted.analysis) }}
                />
              )}
              
              {/* Recommendations */}
              {formatted.recommendations.length > 0 && (
                <div>
                  <ul className="space-y-1">
                    {formatted.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1.5 block h-1 w-1 rounded-full bg-current flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: processMarkdown(rec) }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary/60" />
              <p className="text-sm font-medium mb-1">Click to Generate AI Insights</p>
              <p className="text-xs">Get intelligent analysis and recommendations for your data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}