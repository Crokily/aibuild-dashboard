# Test Guide

This directory contains test files for the AI Build Dashboard project.

## Test Environment Setup

1. Ensure `.env.test` file is created with test database connection information
2. Test data file is located at `test/data/ProductData.xlsx`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
# Run upload API tests
npm run test:upload

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Test Structure

### API Tests
- `test/api/upload.test.ts` - Upload API endpoint tests

### Test Data
- `test/data/ProductData.xlsx` - Excel file used for testing

### Test Configuration
- `test/setup.ts` - Test environment initialization and cleanup
- `vitest.config.ts` - Vitest configuration

## Test Coverage

Upload API tests include:

### File Validation
- ✅ No file uploaded
- ✅ Invalid file type
- ✅ Empty Excel file

### Data Processing
- ✅ Valid Excel file processing
- ✅ Product data insertion
- ✅ Daily record data insertion
- ✅ Duplicate product code upsert handling

### Database Operations
- ✅ Transaction processing
- ✅ Foreign key relationship validation
- ✅ Data cleanup (clearing old records on re-upload)

### Error Handling
- ✅ Database error handling
- ✅ Malformed Excel files
- ✅ Network error handling

### Data Validation
- ✅ Inventory calculation accuracy
- ✅ Required column validation
- ✅ Data type validation

## Important Notes

1. Tests automatically clean the database to ensure isolation between tests
2. Uses real Excel files for end-to-end testing
3. All tests are asynchronous with appropriate waiting mechanisms
4. Error tests verify correct error responses and status codes
