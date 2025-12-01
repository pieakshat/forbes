-- Migration: Add employment period columns to employees table
-- This migration adds employment_start_date and employment_end_date columns
-- to track when employees are employed and automatically remove them when their period expires

-- Add employment_start_date column (nullable, can be set later)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS employment_start_date DATE;

-- Add employment_end_date column (nullable, employees without end date are considered permanent)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS employment_end_date DATE;

-- Add a comment to explain the columns
COMMENT ON COLUMN employees.employment_start_date IS 'The date when the employee started employment. NULL means unknown.';
COMMENT ON COLUMN employees.employment_end_date IS 'The date when the employee employment period ends. NULL means permanent/ongoing. Employees with end_date < today are automatically filtered out.';

-- Optional: Create an index on employment_end_date for faster queries when filtering expired employees
CREATE INDEX IF NOT EXISTS idx_employees_employment_end_date ON employees(employment_end_date) WHERE employment_end_date IS NOT NULL;

