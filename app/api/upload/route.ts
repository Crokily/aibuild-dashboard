import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { products, dailyRecords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Interface for Excel row with dynamic day columns
interface ExcelRow {
  ID: string;
  'Product Name': string;
  'Opening Inventory': number;
  [key: string]: string | number | undefined; // For dynamic day columns
}

// Interface for processed daily record data
interface DailyRecordData {
  productId: number;
  recordDate: string; // YYYY-MM-DD format
  openingInventory: number;
  procurementQty: number;
  procurementPrice: string;
  salesQty: number;
  salesPrice: string;
  closingInventory: number;
}

// Interface for day-specific data
interface DayData {
  openingInventory: number;
  procurementQty: number;
  procurementPrice: number;
  salesQty: number;
  salesPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Enhanced file validation
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only Excel files (.xlsx, .xls) are supported' },
        { status: 400 }
      );
    }

    // 2. Parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Check if workbook has worksheets
    if (workbook.SheetNames.length === 0) {
      return NextResponse.json(
        { error: 'Excel file contains no worksheets' },
        { status: 400 }
      );
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet) as ExcelRow[];

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file contains no data' },
        { status: 400 }
      );
    }

    // 3. Validate Excel format and structure
    const validationResult = validateExcelFormat(jsonData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // 4. Process and transform data
    const processedData = processExcelData(jsonData);

    // 5. Insert data using transaction with bulk operations
    const result = await db.transaction(async (tx) => {
      let productsProcessed = 0;
      let recordsCreated = 0;
      const allDailyRecords: DailyRecordData[] = [];

      // Process all products first
      for (const productData of processedData.products) {
        // Upsert product using efficient Drizzle operation
        const [product] = await tx
          .insert(products)
          .values({
            productCode: productData.productCode,
            name: productData.name,
          })
          .onConflictDoUpdate({
            target: products.productCode,
            set: { name: productData.name },
          })
          .returning();

        productsProcessed++;

        // Clear existing records for this product (for clean upload)
        await tx
          .delete(dailyRecords)
          .where(eq(dailyRecords.productId, product.id));

        // Prepare daily records for this product
        const productRecords = processedData.records
          .filter(record => record.productCode === productData.productCode)
          .map(record => ({
            productId: product.id,
            recordDate: record.recordDate,
            openingInventory: record.openingInventory,
            procurementQty: record.procurementQty,
            procurementPrice: record.procurementPrice,
            salesQty: record.salesQty,
            salesPrice: record.salesPrice,
            closingInventory: record.closingInventory,
          }));

        allDailyRecords.push(...productRecords);
      }

              // 6. Bulk insert all daily records in one operation
      if (allDailyRecords.length > 0) {
        await tx.insert(dailyRecords).values(allDailyRecords);
        recordsCreated = allDailyRecords.length;
      }

      return { productsProcessed, recordsCreated };
    });

    return NextResponse.json({
      success: true,
      message: 'File processed successfully',
      summary: {
        productsProcessed: result.productsProcessed,
        recordsCreated: result.recordsCreated,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value')) {
        return NextResponse.json(
          { error: 'Some data already exists. Please check for duplicates.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

// Process Excel data and transform to our database format
function processExcelData(excelData: ExcelRow[]) {
  const products: Array<{ productCode: string; name: string }> = [];
  const records: Array<{
    productCode: string;
    recordDate: string; // YYYY-MM-DD format
    openingInventory: number;
    procurementQty: number;
    procurementPrice: string;
    salesQty: number;
    salesPrice: string;
    closingInventory: number;
  }> = [];

  // Define the base date (today)
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0); // Set to start of day

  // Process each product row
  for (const row of excelData) {
    const productCode = row.ID?.toString().trim();
    const productName = row['Product Name']?.toString().trim();

    // Skip invalid rows (validation should have caught these, but double-check)
    if (!productCode || !productName) {
      console.warn('Skipping row with missing product code or name:', row);
      continue;
    }

    // Add product to list
    products.push({
      productCode,
      name: productName
    });

    // Extract day columns and transform to daily records
    const dayColumns = extractDayColumns(row);
    const totalDays = dayColumns.length;
    
    if (totalDays === 0) {
      console.warn(`No valid day columns found for product ${productCode}, skipping`);
      continue;
    }
    
    let previousClosingInventory = 0;

    for (let dayIndex = 0; dayIndex < dayColumns.length; dayIndex++) {
      const dayData = dayColumns[dayIndex];
      const recordDate = new Date(baseDate);
      // Calculate date from past to present: Day 1 = earliest date, Last Day = today
      recordDate.setDate(baseDate.getDate() - (totalDays - 1 - dayIndex));

      // Calculate inventory
      const openingInventory = dayIndex === 0 ? dayData.openingInventory : previousClosingInventory;
      const closingInventory = openingInventory + dayData.procurementQty - dayData.salesQty;

      records.push({
        productCode,
        recordDate: recordDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        openingInventory,
        procurementQty: dayData.procurementQty,
        procurementPrice: dayData.procurementPrice.toString(),
        salesQty: dayData.salesQty,
        salesPrice: dayData.salesPrice.toString(),
        closingInventory
      });

      previousClosingInventory = closingInventory;
    }
  }

  return { products, records };
}

// Extract day-specific columns from the Excel row using flexible regex matching
function extractDayColumns(row: ExcelRow): DayData[] {
  const dayMap = new Map<number, DayData>();

  // Regex patterns for flexible column matching
  const procurementQtyPattern = /^Procurement Qty \(Day (\d+)\)$/i;
  const procurementPricePattern = /^Procurement Price \(Day (\d+)\)$/i;
  const salesQtyPattern = /^Sales Qty \(Day (\d+)\)$/i;
  const salesPricePattern = /^Sales Price \(Day (\d+)\)$/i;

  // Initialize with Opening Inventory for Day 1
  const openingInventory = parseFloat(row['Opening Inventory']?.toString() || '0') || 0;
  
  // Process each column in the row
  for (const [columnName, value] of Object.entries(row)) {
    const numericValue = parseFloat(value?.toString() || '0') || 0;

    // Check for Procurement Quantity columns
    const procQtyMatch = columnName.match(procurementQtyPattern);
    if (procQtyMatch) {
      const day = parseInt(procQtyMatch[1]);
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          openingInventory: day === 1 ? openingInventory : 0,
          procurementQty: 0,
          procurementPrice: 0,
          salesQty: 0,
          salesPrice: 0
        });
      }
      dayMap.get(day)!.procurementQty = numericValue;
      continue;
    }

    // Check for Procurement Price columns
    const procPriceMatch = columnName.match(procurementPricePattern);
    if (procPriceMatch) {
      const day = parseInt(procPriceMatch[1]);
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          openingInventory: day === 1 ? openingInventory : 0,
          procurementQty: 0,
          procurementPrice: 0,
          salesQty: 0,
          salesPrice: 0
        });
      }
      dayMap.get(day)!.procurementPrice = numericValue;
      continue;
    }

    // Check for Sales Quantity columns
    const salesQtyMatch = columnName.match(salesQtyPattern);
    if (salesQtyMatch) {
      const day = parseInt(salesQtyMatch[1]);
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          openingInventory: day === 1 ? openingInventory : 0,
          procurementQty: 0,
          procurementPrice: 0,
          salesQty: 0,
          salesPrice: 0
        });
      }
      dayMap.get(day)!.salesQty = numericValue;
      continue;
    }

    // Check for Sales Price columns
    const salesPriceMatch = columnName.match(salesPricePattern);
    if (salesPriceMatch) {
      const day = parseInt(salesPriceMatch[1]);
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          openingInventory: day === 1 ? openingInventory : 0,
          procurementQty: 0,
          procurementPrice: 0,
          salesQty: 0,
          salesPrice: 0
        });
      }
      dayMap.get(day)!.salesPrice = numericValue;
      continue;
    }
  }

  // Convert map to sorted array
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, data]) => data);
}

// Validate Excel file format and structure
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

  // Check for consistent day structure across all rows
  const dayNumbers = new Set<number>();
  columns.forEach(col => {
    dayColumnPatterns.forEach(pattern => {
      const match = col.match(pattern);
      if (match) {
        // Extract day number from column name
        const dayMatch = col.match(/Day (\d+)/i);
        if (dayMatch) {
          dayNumbers.add(parseInt(dayMatch[1]));
        }
      }
    });
  });

  if (dayNumbers.size === 0) {
    return { 
      isValid: false, 
      error: 'No valid day columns found. Expected format: "Procurement Qty (Day 1)", "Sales Qty (Day 1)", etc.' 
    };
  }

  // Check if all required columns exist for each day
  const sortedDays = Array.from(dayNumbers).sort((a, b) => a - b);
  for (const day of sortedDays) {
    const requiredDayColumns = [
      `Procurement Qty (Day ${day})`,
      `Procurement Price (Day ${day})`,
      `Sales Qty (Day ${day})`,
      `Sales Price (Day ${day})`
    ];

    const missingDayColumns = requiredDayColumns.filter(col => 
      !columns.some(existingCol => existingCol.toLowerCase() === col.toLowerCase())
    );

    if (missingDayColumns.length > 0) {
      return { 
        isValid: false, 
        error: `Missing columns for Day ${day}: ${missingDayColumns.join(', ')}` 
      };
    }
  }

  return { isValid: true };
}
