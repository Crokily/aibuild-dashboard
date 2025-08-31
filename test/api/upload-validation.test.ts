import { describe, it, expect } from 'vitest';

// Mock Excel data for testing validation
interface ExcelRow {
  ID: string;
  'Product Name': string;
  'Opening Inventory': number;
  [key: string]: string | number | undefined;
}

// Copy the validation function for testing (in a real app, you'd export it)
function validateExcelFormat(jsonData: ExcelRow[]): { isValid: boolean; error?: string } {
  // Check if data exists
  if (!jsonData || jsonData.length === 0) {
    return { isValid: false, error: 'Excel file contains no data rows' };
  }

  // Get the first row to check column structure
  const firstRow = jsonData[0];
  const columns = Object.keys(firstRow);

  // Check for required base columns
  const requiredColumns = ['ID', 'Product Name', 'Opening Inventory'];
  const missingColumns = requiredColumns.filter(col => !columns.includes(col));
  
  if (missingColumns.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns: ${missingColumns.join(', ')}. Expected columns: ID, Product Name, Opening Inventory, and daily columns like "Procurement Qty (Day 1)", "Sales Qty (Day 1)", etc.` 
    };
  }

  // Check for at least one set of day columns
  const dayColumnPatterns = [
    /^Procurement Qty \(Day \d+\)$/i,
    /^Procurement Price \(Day \d+\)$/i,
    /^Sales Qty \(Day \d+\)$/i,
    /^Sales Price \(Day \d+\)$/i
  ];

  const hasDayColumns = dayColumnPatterns.some(pattern => 
    columns.some(col => pattern.test(col))
  );

  if (!hasDayColumns) {
    return { 
      isValid: false, 
      error: 'No daily data columns found. Expected columns like "Procurement Qty (Day 1)", "Procurement Price (Day 1)", "Sales Qty (Day 1)", "Sales Price (Day 1)", etc.' 
    };
  }

  // Validate data in each row
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const rowNum = i + 1;

    // Check if ID and Product Name are present and valid
    if (!row.ID || row.ID.toString().trim() === '') {
      return { 
        isValid: false, 
        error: `Row ${rowNum}: Missing or empty Product ID` 
      };
    }

    if (!row['Product Name'] || row['Product Name'].toString().trim() === '') {
      return { 
        isValid: false, 
        error: `Row ${rowNum}: Missing or empty Product Name` 
      };
    }

    // Check if Opening Inventory is a valid number
    const openingInventory = parseFloat(row['Opening Inventory']?.toString() || '');
    if (isNaN(openingInventory) || openingInventory < 0) {
      return { 
        isValid: false, 
        error: `Row ${rowNum}: Opening Inventory must be a valid non-negative number` 
      };
    }

    // Validate day columns have numeric values
    for (const [columnName, value] of Object.entries(row)) {
      if (dayColumnPatterns.some(pattern => pattern.test(columnName))) {
        const numericValue = parseFloat(value?.toString() || '');
        if (isNaN(numericValue) || numericValue < 0) {
          return { 
            isValid: false, 
            error: `Row ${rowNum}, Column "${columnName}": Value must be a valid non-negative number` 
          };
        }
      }
    }
  }

  return { isValid: true };
}

describe('Excel Upload Validation', () => {
  it('should accept valid Excel data', () => {
    const validData: ExcelRow[] = [
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
  });

  it('should reject empty data', () => {
    const result = validateExcelFormat([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Excel file contains no data rows');
  });

  it('should reject data missing required columns', () => {
    const invalidData: ExcelRow[] = [
      {
        'ID': 'P001',
        // Missing 'Product Name' and 'Opening Inventory'
        'Procurement Qty (Day 1)': 50,
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      } as ExcelRow
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Missing required columns');
  });

  it('should reject data without day columns', () => {
    const invalidData: ExcelRow[] = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': 100
        // No day columns
      }
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('No daily data columns found');
  });

  it('should reject data with empty Product ID', () => {
    const invalidData: ExcelRow[] = [
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
    expect(result.error).toContain('Row 1: Missing or empty Product ID');
  });

  it('should reject data with invalid Opening Inventory', () => {
    const invalidData: ExcelRow[] = [
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
    expect(result.error).toContain('Opening Inventory must be a valid non-negative number');
  });

  it('should reject data with invalid day column values', () => {
    const invalidData: ExcelRow[] = [
      {
        'ID': 'P001',
        'Product Name': 'Test Product',
        'Opening Inventory': 100,
        'Procurement Qty (Day 1)': 'invalid', // Non-numeric value
        'Procurement Price (Day 1)': 10.5,
        'Sales Qty (Day 1)': 30,
        'Sales Price (Day 1)': 15.0
      } as ExcelRow
    ];

    const result = validateExcelFormat(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Value must be a valid non-negative number');
  });
});
