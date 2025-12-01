-- SQL Query to Generate Random Attendance Data for June 2025
-- ===========================================================
-- This will create attendance records for all employees for all days in June 2025
-- Status distribution: ~75% present, ~10% absent, ~8% leave, ~5% half_day, ~2% remote
-- Weekends: 30% holiday, 70% present

WITH 
-- Generate all dates in June 2025
june_dates AS (
    SELECT generate_series(
        '2025-06-01'::date,
        '2025-06-30'::date,
        '1 day'::interval
    )::date AS attendance_date
),
-- Get all employees with their groups
all_employees AS (
    SELECT 
        token_no,
        "group" AS employee_group
    FROM employees
    WHERE token_no IS NOT NULL
),
-- Cross join to get all combinations of employees and dates
employee_date_combinations AS (
    SELECT 
        e.token_no,
        d.attendance_date,
        e.employee_group,
        -- Determine if it's a weekend (Saturday = 6, Sunday = 0)
        EXTRACT(DOW FROM d.attendance_date) AS day_of_week
    FROM all_employees e
    CROSS JOIN june_dates d
),
-- Generate random status based on day type
random_attendance AS (
    SELECT 
        token_no,
        attendance_date,
        -- Assign group from employee record (same as in employees table)
        employee_group AS "group",
        CASE 
            -- Weekends: 30% holiday, 70% present (some people work weekends)
            WHEN day_of_week IN (0, 6) THEN 
                CASE WHEN random() < 0.3 THEN 'holiday'::attendance_status ELSE 'present'::attendance_status END
            -- Weekdays: Random distribution
            WHEN random() < 0.75 THEN 'present'::attendance_status      -- 75% present
            WHEN random() < 0.85 THEN 'absent'::attendance_status       -- 10% absent
            WHEN random() < 0.93 THEN 'leave'::attendance_status       -- 8% leave
            WHEN random() < 0.98 THEN 'half_day'::attendance_status     -- 5% half_day
            
        END AS status,
        NOW() AS updated_at
    FROM employee_date_combinations
    WHERE employee_group IS NOT NULL  -- Only create attendance for employees with a group assigned
)
-- Insert the generated attendance records
INSERT INTO attendance (
    token_no,
    attendance_date,
    status,
    "group",
    updated_at
)
SELECT 
    token_no,
    attendance_date,
    status,
    "group",
    updated_at
FROM random_attendance
ON CONFLICT (token_no, attendance_date) 
DO UPDATE SET
    status = EXCLUDED.status,
    "group" = EXCLUDED."group",
    updated_at = EXCLUDED.updated_at;

-- Alternative: Simpler version without group field (if you want to test without groups)
-- ====================================================================================
/*
WITH 
june_dates AS (
    SELECT generate_series('2025-06-01'::date, '2025-06-30'::date, '1 day'::interval)::date AS attendance_date
),
all_tokens AS (
    SELECT DISTINCT token_no FROM employees WHERE token_no IS NOT NULL
),
token_date_combinations AS (
    SELECT t.token_no, d.attendance_date
    FROM all_tokens t
    CROSS JOIN june_dates d
)
INSERT INTO attendance (token_no, attendance_date, status, updated_at)
SELECT 
    token_no,
    attendance_date,
    CASE 
        WHEN random() < 0.75 THEN 'present'::attendance_status
        WHEN random() < 0.85 THEN 'absent'::attendance_status
        WHEN random() < 0.93 THEN 'leave'::attendance_status
        WHEN random() < 0.98 THEN 'half_day'::attendance_status
        ELSE 'remote'::attendance_status
    END AS status,
    NOW() AS updated_at
FROM token_date_combinations
ON CONFLICT (token_no, attendance_date) 
DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;
*/

-- Notes:
-- ======
-- 1. This assumes there's a UNIQUE constraint on (token_no, attendance_date)
-- 2. The query uses ON CONFLICT to handle duplicates (upsert behavior)
-- 3. Weekends are treated differently (more likely to be holiday)
-- 4. Group is taken from the employees table for each employee
-- 5. Adjust the status distribution percentages as needed
-- 6. The query will generate approximately:
--    - ~22-23 present days per employee (75% of 30 days)
--    - ~3 absent days per employee (10% of 30 days)
--    - ~2-3 leave days per employee (8% of 30 days)
--    - ~1-2 half_day per employee (5% of 30 days)
--    - ~0-1 remote per employee (2% of 30 days)

