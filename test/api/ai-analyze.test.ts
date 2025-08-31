import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/analyze/route';
import type { ProductKPI } from '@/components/DataAnalysis';

// Mock the AI SDK
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model')
}));

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toDataStreamResponse: vi.fn(() => new Response('mocked response'))
  }))
}));

describe('/api/analyze', () => {
  it('should handle valid product KPI data', async () => {
    const mockKPIs: ProductKPI[] = [
      {
        productId: 1,
        productName: 'Test Product',
        productCode: 'P001',
        totalRevenue: 15000,
        totalCost: 10000,
        totalUnitsSold: 100,
        totalUnitsProcured: 120,
        averageSellingPrice: 150,
        averageProcurementPrice: 83.33,
        endingInventory: 20,
        netAmount: 5000,
        sellThroughRate: 83.33,
      }
    ];

    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productKPIs: mockKPIs }),
    });

    const response = await POST(request);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
  });

  it('should return 400 for empty product data', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productKPIs: [] }),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe('No product data provided');
  });

  it('should return 400 for missing product data', async () => {
    const request = new Request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });
});
