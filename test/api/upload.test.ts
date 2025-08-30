import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import { sql } from '@vercel/postgres';

const testFilePath = 'test/data/ProductData.xlsx';

process.env.POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';

async function createRequestWithFile(filePath: string): Promise<NextRequest> {
  const buffer = readFileSync(filePath);
  const formData = new FormData();
  const file = new File([buffer], 'ProductData.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  formData.append('file', file);
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/upload', () => {
  afterAll(async () => {
    await sql.end();
  });

  it('processes valid Excel file and returns summary', async () => {
    const request = await createRequestWithFile(testFilePath);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      summary: { productsProcessed: 20, recordsCreated: 60 },
    });
  });

  it('returns 400 when no file is uploaded', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'No file uploaded' });
  });
});
