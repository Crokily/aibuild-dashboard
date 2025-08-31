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
  return `You are an expert retail inventory and sales analyst. Provide concise, actionable insights focused on retail business operations.

STRICT FORMATTING:
- Start with 1-2 sentences of analysis as a paragraph
- Follow with exactly 3 bullet points using • symbol
- Use **bold** for key metrics and product names only
- Each recommendation must be ONE sentence only
- No extra headers, labels, or conversational language

OUTPUT STRUCTURE:
Analysis paragraph with key insights.

• First recommendation
• Second recommendation  
• Third recommendation

RETAIL FOCUS:
- Analyze inventory turnover, profit margins, and sales velocity
- Focus on pricing strategies, promotional opportunities, and inventory management
- Recommend actions for improving sell-through rates, reducing dead stock, and maximizing revenue per unit`;
}

function generateAnalysisPrompt(productKPIs: ProductKPI[]): string {
  if (productKPIs.length === 1) {
    const kpi = productKPIs[0];
    const profitMargin = kpi.totalRevenue > 0 ? ((kpi.netAmount / kpi.totalRevenue) * 100).toFixed(1) : '0';
    
    return `Analyze retail performance for **${kpi.productName}**:

• Revenue: **$${kpi.totalRevenue.toLocaleString()}**
• Units Sold: **${kpi.totalUnitsSold.toLocaleString()}**
• Net Profit: **$${kpi.netAmount.toLocaleString()}**
• Profit Margin: **${profitMargin}%**
• Sell-Through Rate: **${kpi.sellThroughRate.toFixed(1)}%**
• Current Stock: **${kpi.endingInventory.toLocaleString()} units**

Analyze inventory performance and profitability. Provide 3 specific retail management recommendations.`;
  } else {
    // Multi-product comparison
    const sortedByRevenue = [...productKPIs].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const sortedByProfit = [...productKPIs].sort((a, b) => b.netAmount - a.netAmount);

    const topPerformer = sortedByRevenue[0];
    const worstPerformer = sortedByProfit[productKPIs.length - 1];

    return `Compare these ${productKPIs.length} retail products:

${productKPIs.map(kpi => {
  const margin = kpi.totalRevenue > 0 ? ((kpi.netAmount / kpi.totalRevenue) * 100).toFixed(1) : '0';
  return `**${kpi.productName}**: Revenue $${kpi.totalRevenue.toLocaleString()}, Profit $${kpi.netAmount.toLocaleString()}, Margin ${margin}%, Sell-Through ${kpi.sellThroughRate.toFixed(1)}%`;
}).join('\n')}

**Top Performer**: ${topPerformer.productName} (revenue)
**Lowest Profit**: ${worstPerformer.productName}

Analyze portfolio performance and provide 3 specific retail optimization actions.`;
  }
}
