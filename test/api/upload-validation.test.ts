import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Copy the Zod schemas from the upload route for testing
const excelRowSchema = z.object({
  'ID': z.string()
    .min(1, 'Product ID cannot be empty')
    .max(50, 'Product ID must be less than 50 characters'),
  'Product Name': z.string()
    .min(1, 'Product Name cannot be empty')
    .max(100, 'Product Name must be less than 100 characters'),
  'Opening Inventory': z.number()
    .min(0, 'Opening Inventory must be non-negative')
    .int('Opening Inventory must be a whole number'),
}).catchall(
  z.union([
    z.string().optional(),
    z.number().min(0, 'Day column values must be non-negative').optional()
  ])
);

const excelDataSchema = z.array(excelRowSchema)
  .min(1, 'Excel file must contain at least one data row')
  .refine((rows) => {
    // Skip validation if array is empty (will be caught by min(1) above)
    if (rows.length === 0) {
      return true;
    }
    
    const firstRow = rows[0];
    const dayColumns = Object.keys(firstRow).filter(key => 
      /^(Procurement|Sales) (Qty|Price) \(Day \d+\)$/i.test(key)
    );
    
    if (dayColumns.length === 0) {
      return false;
    }
    
    const dayNumbers = new Set<number>();
    dayColumns.forEach(col => {
      const match = col.match(/Day (\d+)/i);
      if (match) {
        dayNumbers.add(parseInt(match[1]));
      }
    });
    
    for (const day of dayNumbers) {
      const requiredCols = [
        `Procurement Qty (Day ${day})`,
        `Procurement Price (Day ${day})`,
        `Sales Qty (Day ${day})`,
        `Sales Price (Day ${day})`
      ];
      
      const hasAllCols = requiredCols.every(col => 
        Object.keys(firstRow).some(key => key.toLowerCase() === col.toLowerCase())
      );
      
      if (!hasAllCols) {
        return false;
      }
    }
    
    return true;
  }, 'Excel file must contain valid day columns (Procurement Qty/Price, Sales Qty/Price for each day)');

// Helper function to validate data using Zod
function validateExcelFormat(jsonData: any[]): { isValid: boolean; error?: string; details?: string[] } {
  const result = excelDataSchema.safeParse(jsonData);
  
  if (result.success) {
    return { isValid: true };
  } else {
    const details = result.error.issues.map((err: z.ZodIssue) => {
      const path = err.path.join('.');
      
      if (err.path.length >= 2 && typeof err.path[0] === 'number') {
        const rowIndex = err.path[0] as number;
        const fieldName = err.path[1] as string;
        const rowNumber = rowIndex + 1;
        
        const fieldLabels: Record<string, string> = {
          'ID': 'Product ID',
          'Product Name': 'Product Name',
          'Opening Inventory': 'Opening Inventory'
        };
        
        const friendlyFieldName = fieldLabels[fieldName] || fieldName;
        return `Row ${rowNumber}, ${friendlyFieldName}: ${err.message}`;
      }
      
      if (err.path.length === 0) {
        return err.message;
      }
      
      return `${path}: ${err.message}`;
    });
    
    return { 
      isValid: false, 
      error: 'Data validation failed', 
      details 
    };
  }
}

describe('Excel Upload Validation with Zod', () => {
  it('should accept valid Excel data', () => {
    const validData = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': 100,
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      }
    ];

    const result = validateExcelFormat(validData);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.details).toBeUndefined();
  });

  it('should reject empty data', () => {
    const result = validateExcelFormat([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details).toContain('Excel file must contain at least one data row');
  });

  it('should reject data missing required columns', () => {
    const invalidData = [
      {
        'ID': 'P001',
        // Missing 'Product Name' and 'Opening Inventory'
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details?.some(detail => detail.includes('Product Name'))).toBe(true);
  });

  it('should reject data without day columns', () => {
    const invalidData = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': 100
        // No day columns
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details?.some(detail => detail.includes('valid day columns'))).toBe(true);
  });

  it('should reject data with empty Product ID', () => {
    const invalidData = [
      {
        'ID': '',
        'Product Name': 'Test Product',
        'Opening Inventory': 100,
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details?.some(detail => detail.includes('Product ID cannot be empty'))).toBe(true);
  });

  it('should reject data with invalid Opening Inventory', () => {
    const invalidData = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': -10, // Negative number
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details?.some(detail => detail.includes('Opening Inventory must be non-negative'))).toBe(true);
  });

  it('should provide detailed error messages with row numbers', () => {
    const invalidData = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': 100,
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      },
      {
        'ID': '', // Empty ID in second row
        'Product Name': 'Another Product',
        'Opening Inventory': 50,
        'Procurement Qty (Day 1)': 25,
        'Procurement Price (Day 1)': 8.0,
        'Sales Qty (Day 1)': 15,
        'Sales Price (Day 1)': 12.0
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Data validation failed');
    expect(result.details?.some(detail => detail.includes('Row 2'))).toBe(true);
  });
});
