import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import type { ProductKPI } from '@/components/DataAnalysis';

export async function POST(req: NextRequest) {
  try {
    const { productKPIs }: { productKPIs: ProductKPI[] } = await req.json();

    if (!productKPIs || productKPIs.length === 0) {
      return new Response('No product data provided', { status: 400 });
    }

    // Generate optimized prompt based on number of products
    const prompt = generateAnalysisPrompt(productKPIs);

    const result = await streamText({
      model: openai('gpt-5-nano'),
      system: getSystemPrompt(),
      prompt,
      temperature: 0.3, // Lower temperature for more focused analysis
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response('Analysis failed', { status: 500 });
  }
}

function getSystemPrompt(): string {
  return `You are an expert retail business analyst. Provide extremely concise, data-driven insights in a professional, direct tone. 

RULES:
- Never use conversational fluff or introductory phrases
- Get straight to the point
- Maximum 2 sentences for analysis
- Maximum 3 bullet points for recommendations
- Each recommendation must be ONE sentence only
- Use specific numbers from the data
- Focus on actionable insights only`;
}

function generateAnalysisPrompt(productKPIs: ProductKPI[]): string {
  if (productKPIs.length === 1) {
    const kpi = productKPIs[0];
    const profitMargin = kpi.totalRevenue > 0 ? ((kpi.netAmount / kpi.totalRevenue) * 100).toFixed(1) : '0';
    
    return `Analyze performance for ${kpi.productName}:

Revenue: $${kpi.totalRevenue.toLocaleString()}
Units Sold: ${kpi.totalUnitsSold.toLocaleString()}
Net Amount: $${kpi.netAmount.toLocaleString()}
Profit Margin: ${profitMargin}%
Sell-Through Rate: ${kpi.sellThroughRate.toFixed(1)}%
Ending Inventory: ${kpi.endingInventory.toLocaleString()} units

Provide analysis and actionable recommendations.`;
  } else {
    // Multi-product comparison
    const sortedByRevenue = [...productKPIs].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const sortedByProfit = [...productKPIs].sort((a, b) => b.netAmount - a.netAmount);

    const topPerformer = sortedByRevenue[0];
    const worstPerformer = sortedByProfit[productKPIs.length - 1];

    return `Compare these ${productKPIs.length} products:

${productKPIs.map(kpi => {
  const margin = kpi.totalRevenue > 0 ? ((kpi.netAmount / kpi.totalRevenue) * 100).toFixed(1) : '0';
  return `${kpi.productName}: Revenue $${kpi.totalRevenue.toLocaleString()}, Net $${kpi.netAmount.toLocaleString()}, Margin ${margin}%`;
}).join('\n')}

Top revenue: ${topPerformer.productName}
Worst profit: ${worstPerformer.productName}

Identify key insights and portfolio optimization recommendations.`;
  }
}
