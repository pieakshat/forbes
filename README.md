# Forbes Progress Pulse
## Worker Attendance and Production Tracking System

### Executive Summary

Forbes Progress Pulse is a comprehensive web-based application developed for Forbes Marshall to track worker attendance, monitor production metrics, and analyze workforce utilization across multiple manufacturing groups. The system provides real-time visibility into daily operations through an intuitive dashboard interface, enabling management to make data-driven decisions regarding workforce planning and production efficiency.

The platform integrates attendance management with production data from Finished Goods (FG) completion reports, calculating key performance indicators including capacity utilization, absenteeism rates, and production completion percentages. The system supports hierarchical organizational structures with role-based access control, ensuring appropriate data visibility and management capabilities for different user levels.

### Project Overview

This project addresses the critical need for centralized tracking and analysis of workforce attendance and production metrics in a manufacturing environment. The system automates the collection, processing, and visualization of attendance data alongside production completion records, eliminating manual data aggregation and reducing the time required for management reporting.

The application serves multiple stakeholders within the organization:
- Leaders who record daily attendance and manage employee information for their assigned groups
- Managers who upload production reports and analyze performance metrics
- Administrators who oversee system operations and have access to comprehensive analytics

### System Architecture

The application is built using a modern, scalable architecture that separates concerns between the frontend presentation layer, backend API services, and database storage. The system follows a component-based design pattern, enabling modular development and maintainability.

**Frontend Architecture:**
- Built on Next.js 15 with React 18, utilizing server-side rendering and client-side interactivity
- TypeScript for type safety and improved developer experience
- Component-based UI architecture using Radix UI primitives and Tailwind CSS
- State management through React hooks and context API
- Responsive design supporting desktop and tablet devices

**Backend Architecture:**
- Next.js API routes handling server-side logic
- Service layer pattern for business logic separation
- Supabase as the backend-as-a-service platform providing database, authentication, and real-time capabilities
- RESTful API design for data operations

**Database Architecture:**
- PostgreSQL database hosted on Supabase
- Relational data model with proper foreign key constraints
- Row-level security policies for data access control
- Indexed queries for optimal performance on large datasets

### Technical Stack

**Core Technologies:**
- Next.js 15.5.4: React framework with App Router
- React 18.3.1: UI library
- TypeScript 5.8.3: Type-safe JavaScript
- Supabase 2.76.1: Backend platform and database

**UI Components and Styling:**
- Radix UI: Accessible component primitives
- Tailwind CSS 3.4.17: Utility-first CSS framework
- Lucide React: Icon library
- Recharts 2.15.4: Data visualization library

**Data Processing:**
- PapaParse 5.5.3: CSV parsing
- CSV-Parse 6.1.0: CSV file processing
- Date-fns 3.6.0: Date manipulation utilities

**Development Tools:**
- ESLint: Code linting
- TypeScript Compiler: Type checking
- PostCSS: CSS processing

### Key Features

**1. Attendance Management**
The system provides comprehensive attendance tracking capabilities:
- Daily attendance recording with multiple status options (Present, Absent, Leave, Half Day, Holiday)
- Group-based attendance organization
- Historical attendance data viewing and analysis
- Bulk attendance entry for efficiency
- Date-based filtering and search capabilities

**2. Production Tracking**
Production metrics are integrated through FG Completion report uploads:
- CSV file upload for production data
- Automatic parsing and validation of production records
- Index factor and index quantity calculations
- Transaction date tracking for production timelines
- Support for multiple grouping dimensions (Class, Department Code, Item Type, FG Under FG)

**3. Dashboard and Analytics**
The dashboard provides real-time insights into operations:
- Key Performance Indicator cards showing Overall Completion, Active Groups, Total Workforce, and Average Absenteeism
- Interactive data tables displaying daily metrics for selected groups and time periods
- Performance charts visualizing trends over time
- Hierarchical selection interface for filtering by group, month, and year
- Aggregated metrics across all groups for organization-wide visibility

**4. Employee Management**
Comprehensive employee data management:
- Employee profile creation and editing
- Token number-based identification system
- Group assignment and reassignment
- Designation and role tracking
- Employment period tracking with start and end dates
- Automatic filtering of expired employment records

**5. User Authentication and Authorization**
Secure access control system:
- Email and password-based authentication
- Role-based access control with three levels: Leader, Manager, and Admin
- Protected routes ensuring appropriate access
- Session management through Supabase authentication

**6. Report Upload and Processing**
Automated report processing workflow:
- CSV file upload interface for managers and administrators
- File validation including size limits and format checking
- Batch processing for large datasets
- Error handling and validation feedback
- Upload session tracking for audit purposes

### Database Structure

The system utilizes a relational database schema with the following core tables:

**Employees Table:**
- Stores employee master data including token numbers, names, designations, groups, and roles
- Tracks employment periods with start and end dates
- Supports group-based filtering and queries

**Attendance Table:**
- Records daily attendance for each employee
- Stores attendance status, date, group assignment, and metadata
- Unique constraint on token number and attendance date combination
- Supports time-based queries for historical analysis

**FG Completion Table:**
- Stores production completion data from uploaded reports
- Includes item details, transaction quantities, dates, and index factors
- Supports multiple grouping dimensions for flexible analysis
- Tracks job order numbers and department codes

**Users Table:**
- Manages system user accounts (table name: "Users")
- Stores role assignments linked to email addresses
- Integrates with Supabase authentication system for credential management

### User Roles and Access Control

The system implements a three-tier role-based access control model:

**Leader Role:**
- Access to group leader panel for attendance management
- Ability to mark and view attendance for assigned groups
- Employee management within assigned groups
- View summary reports for assigned groups
- No access to production report uploads or organization-wide analytics

**Manager Role:**
- All leader capabilities
- Access to production report upload functionality
- Dashboard access with organization-wide metrics
- Ability to view analytics across all groups
- Limited administrative capabilities

**Admin Role:**
- Full system access including all manager capabilities
- User account management
- System-wide configuration access
- Complete analytics and reporting access
- Administrative dashboard with aggregated metrics

### Core Functionalities

**Attendance Recording Workflow:**
1. Leader selects a date for attendance entry
2. System loads all employees assigned to the leader's groups
3. Leader marks attendance status for each employee
4. System validates and saves attendance records
5. Records are immediately available for reporting and analysis

**Production Data Integration Workflow:**
1. Manager uploads FG Completion CSV file through the dashboard
2. System validates file format and size
3. CSV is parsed and data is validated
4. Records are transformed and inserted into the database in batches
5. Production data becomes available for dashboard calculations

**Dashboard Metrics Calculation:**
1. User selects a group and time period (month and year)
2. System retrieves attendance data for the selected group and period
3. System retrieves FG completion data matching the group criteria
4. Metrics are calculated including:
   - Daily manpower counts
   - Absenteeism percentages
   - Indexed capacity calculations
   - Capacity utilization percentages
   - FG completion percentages
5. Results are displayed in tables and charts for visualization

**Employee Management Workflow:**
1. Leader accesses employee management interface
2. System displays existing employees with filtering options
3. Leader can add new employees or edit existing records
4. Changes are validated and saved to the database
5. Updated employee data is immediately reflected in attendance forms

### Data Flow and Processing

The system processes data through several key workflows:

**Attendance Data Flow:**
- Attendance records are created through the leader interface
- Data is validated server-side before database insertion
- Records are stored with group associations for efficient querying
- Dashboard queries aggregate attendance data by date and group
- Metrics calculations combine attendance with production data

**Production Data Flow:**
- CSV files are uploaded through the report upload interface
- Files are parsed and validated for required columns and data types
- Data is transformed to match database schema requirements
- Records are inserted in batches to handle large datasets efficiently
- Production data is linked to groups through multiple matching criteria

**Analytics Data Flow:**
- Dashboard requests metrics for selected groups and time periods
- Service layer queries attendance and production data
- Calculations are performed server-side for accuracy
- Results are formatted and returned to the frontend
- Frontend components render data in tables and charts

### Security and Data Protection

The system implements multiple security measures:

- Row-level security policies in the database restrict data access based on user roles
- Authentication is handled through Supabase's secure authentication system
- API routes verify user authentication before processing requests
- Input validation prevents SQL injection and data corruption
- File upload validation ensures only authorized file types and sizes are processed
- Session management tracks user activity and enforces timeout policies

### Performance Considerations

The system is optimized for performance:

- Database queries use indexed columns for fast retrieval
- Batch processing handles large CSV uploads efficiently (1000 records per batch with timeout protection)
- React state management prevents unnecessary re-fetches of already loaded data
- Date-based and group-based filtering limit data transfer volumes
- Optimized React components minimize re-renders through proper dependency management
- Server-side calculations reduce client-side processing load

### Repository Structure

The project follows Next.js 15 App Router conventions with a well-organized directory structure that separates concerns and promotes maintainability:

```
forbes-progress-pulse/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/                # API route handlers
│   │   │   ├── attendance/     # Attendance CRUD operations
│   │   │   ├── dashboard/      # Dashboard metrics endpoints
│   │   │   │   └── metrics/
│   │   │   │       ├── route.ts        # Group-specific metrics
│   │   │   │       └── all/route.ts   # Aggregated metrics
│   │   │   ├── employees/      # Employee management endpoints
│   │   │   ├── upload-fg-completion/  # Production data upload
│   │   │   └── users/          # User account management
│   │   ├── dashboard/          # Dashboard page component
│   │   ├── group-leader/       # Group leader panel page
│   │   ├── manage-accounts/    # Account management page
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home/landing page
│   │   ├── middleware.ts       # Route protection middleware
│   │   └── providers.tsx       # React context providers
│   ├── components/             # React components organized by feature
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── groupleader/        # Group leader panel components
│   │   ├── layout/             # Layout components (navbar, sidebar)
│   │   ├── navigation/         # Navigation components
│   │   ├── reports/            # Report upload components
│   │   ├── ui/                  # Reusable UI component library
│   │   └── views/               # Page-level view components
│   ├── contexts/               # React context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core library code
│   │   ├── api/                # API client utilities
│   │   │   └── auth.ts         # Authentication verification
│   │   ├── services/           # Business logic services
│   │   │   ├── attendanceService.ts    # Attendance operations
│   │   │   ├── dashboardService.ts     # Dashboard calculations
│   │   │   └── fgCompletionService.ts  # Production data processing
│   │   ├── supabase/           # Supabase client configuration
│   │   │   ├── client.ts       # Browser client
│   │   │   └── server.ts       # Server-side client
│   │   ├── auth.ts             # Authentication functions
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript type definitions
│       └── dashboard.ts        # Dashboard-related types
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── next.config.js              # Next.js configuration
```

**Key Architectural Patterns:**

- **Feature-based organization**: Components are grouped by feature domain (auth, dashboard, groupleader) rather than by technical type
- **Service layer pattern**: Business logic is isolated in service classes within `lib/services/`
- **Separation of concerns**: API routes handle HTTP concerns, services handle business logic, components handle presentation
- **Type safety**: TypeScript types are centralized in the `types/` directory
- **Reusable components**: UI components in `components/ui/` follow a design system pattern

### API Layout

The application uses Next.js API routes following RESTful conventions. All API endpoints are located under `src/app/api/` and implement consistent patterns for authentication, error handling, and response formatting.

**API Endpoint Structure:**

**1. Attendance API (`/api/attendance`)**
- `GET /api/attendance` - Retrieve attendance records
  - Query parameters: `date`, `startDate`, `endDate`, `token_no`
  - Returns: Array of attendance records with employee details
  - Authentication: All authenticated users (leader, manager, admin)
  
- `POST /api/attendance` - Create or update attendance records
  - Body: Single record object or `{ records: [...] }` for bulk operations
  - Supports bulk upsert for efficient batch attendance entry
  - Returns: Success status and count of records updated
  - Authentication: All authenticated users

**2. Employees API (`/api/employees`)**
- `GET /api/employees` - Retrieve all active employees
  - Automatically filters out employees with expired employment periods
  - Returns: Array of employee objects
  - Authentication: All authenticated users
  
- `POST /api/employees` - Create new employee
  - Body: Employee data (token_no, name, group, desig, role, employment dates)
  - Returns: Created employee object
  - Authentication: Leader or admin only
  
- `PUT /api/employees` - Update existing employee
  - Body: Token number and fields to update
  - Returns: Updated employee object
  - Authentication: Leader or admin only
  
- `DELETE /api/employees` - Delete employee
  - Query parameter: `token_no`
  - Returns: Success confirmation
  - Authentication: Leader or admin only

**3. Dashboard Metrics API (`/api/dashboard/metrics`)**
- `GET /api/dashboard/metrics` - Get group-specific metrics
  - Query parameters: `group` (required), `month`, `year`
  - Returns: Dashboard metrics including tables, charts, and summary data
  - Authentication: All authenticated users
  
- `GET /api/dashboard/metrics/all` - Get aggregated metrics across all groups
  - Query parameters: `month`, `year`
  - Returns: Aggregated summary and active groups count
  - Authentication: All authenticated users

**4. FG Completion Upload API (`/api/upload-fg-completion`)**
- `POST /api/upload-fg-completion` - Upload production data CSV
  - Body: FormData with CSV file
  - Returns: Upload result with record counts and session ID
  - Authentication: Manager or admin only
  - Features: File validation, CSV parsing, batch insertion

**5. Users API (`/api/users/create`)**
- `POST /api/users/create` - Create new user account
  - Body: User data (email, password, role)
  - Returns: Created user object
  - Authentication: Admin only

**API Design Patterns:**

- **Consistent Response Format**: All endpoints return JSON with `success`, `data`, and `error` fields
- **Authentication Middleware**: All routes use `verifyAuth()` from `lib/api/auth.ts` to check authentication and roles
- **Error Handling**: Standardized error responses with appropriate HTTP status codes (400, 401, 404, 500)
- **Input Validation**: Request validation occurs in both API routes and service layers
- **Type Safety**: TypeScript interfaces ensure type safety across API boundaries
- **Dynamic Rendering**: API routes use `export const dynamic = 'force-dynamic'` to ensure fresh data

**Authentication Flow:**

1. Client makes request to API endpoint
2. API route calls `verifyAuth()` with optional allowed roles
3. `verifyAuth()` checks Supabase session and fetches user role from Users table
4. Role-based authorization is enforced
5. If authorized, request proceeds to service layer
6. Service layer performs database operations
7. Response is formatted and returned to client

### Database Operations

The system uses Supabase (PostgreSQL) as the database backend. All database operations are performed through the Supabase client library, which provides type-safe query builders and automatic connection management.

**Database Client Configuration:**

**Server-Side Client (`lib/supabase/server.ts`):**
- Uses `createServerClient` from `@supabase/ssr` for server-side rendering
- Manages cookies through Next.js `cookies()` API
- Ensures proper session handling in server components and API routes
- Automatically handles authentication tokens in server context

**Client-Side Client (`lib/supabase/client.ts`):**
- Uses `createBrowserClient` for client-side operations
- Manages browser-based authentication sessions
- Used in React components for client-side data fetching

**Service Layer Pattern:**

All database operations are abstracted through service classes that encapsulate business logic:

**1. AttendanceService (`lib/services/attendanceService.ts`)**
- `getEmployees()`: Fetches active employees, filtering by employment end dates
- `getAttendance()`: Retrieves attendance records with flexible date range filtering
- `upsertAttendance()`: Creates or updates single attendance record with validation
- `bulkUpsertAttendance()`: Efficiently processes multiple attendance records
- `createEmployee()`, `updateEmployee()`, `deleteEmployee()`: Employee CRUD operations
- `cleanupExpiredEmployees()`: Background task to remove expired employment records

**Query Patterns:**
```typescript
// Example: Filtering with date ranges
const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .gte('attendance_date', startDate)
    .lte('attendance_date', endDate)
    .eq('group', groupName)
    .order('attendance_date', { ascending: false });
```

**2. DashboardService (`lib/services/dashboardService.ts`)**
- `getGroupMetrics()`: Complex aggregation query combining attendance and production data
- `getAllGroupsMetrics()`: Cross-group aggregation for organization-wide metrics
- Performs server-side calculations for:
  - Daily manpower counts
  - Absenteeism percentages
  - Indexed capacity calculations
  - Capacity utilization percentages
  - FG completion percentages

**Query Patterns:**
```typescript
// Example: Joining data from multiple sources
const { data: attendanceData } = await supabase
    .from('attendance')
    .select('token_no, attendance_date, status')
    .eq('group', group)
    .gte('attendance_date', startDateKey)
    .lte('attendance_date', endDateKey);

const { data: fgData } = await supabase
    .from('FG_Completion')
    .select('*')
    .gte('Transaction Date', startDateKey)
    .lte('Transaction Date', endDateKey);
```

**3. FGCompletionService (`lib/services/fgCompletionService.ts`)**
- `uploadCSV()`: Orchestrates the complete upload workflow
- `validateFile()`: Checks file size (50MB limit) and format
- `parseCSV()`: Parses CSV content using csv-parse library
- `validateData()`: Validates required columns and data types
- `transformData()`: Sanitizes and transforms data for database insertion
- `insertData()`: Batch inserts with timeout protection (1000 records per batch)

**Batch Processing Pattern:**
```typescript
const BATCH_SIZE = 1000;
const TIMEOUT_MS = 60000;

for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const result = await Promise.race([
        supabase.from('FG_Completion').insert(batch),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
        )
    ]);
    // Process result and continue
}
```

**Database Query Best Practices:**

1. **Indexed Queries**: All queries use indexed columns (token_no, attendance_date, group) for optimal performance
2. **Date Filtering**: Date ranges are filtered using `.gte()` and `.lte()` operators with ISO date strings
3. **Selective Field Selection**: Queries specify only required fields using `.select()` to minimize data transfer
4. **Ordering**: Results are consistently ordered for predictable pagination and display
5. **Error Handling**: All database operations include comprehensive error handling with descriptive messages
6. **Transaction Safety**: Bulk operations use batch processing to avoid transaction timeouts
7. **Data Validation**: Input validation occurs before database operations to prevent invalid data insertion

**Row-Level Security (RLS):**

The database implements row-level security policies to restrict data access based on user roles:
- Policies are defined in SQL and applied at the database level
- Policies ensure users can only access data appropriate for their role
- Authentication context is automatically passed through Supabase client

**Data Integrity:**

- **Unique Constraints**: Attendance table has unique constraint on (token_no, attendance_date)
- **Foreign Key Relationships**: Employee token numbers are validated before attendance record creation
- **Employment Period Filtering**: Employees with expired employment_end_date are automatically excluded from queries
- **Data Sanitization**: All string inputs are trimmed and sanitized before database insertion
- **Type Validation**: Numeric fields are validated and converted with proper error handling

### Installation and Setup

This section provides step-by-step instructions for setting up the development environment and running the application locally.

**Prerequisites:**
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager
- Supabase account and project
- Git (for cloning the repository)

**Step 1: Clone and Install Dependencies**

```bash
# Clone the repository
git clone <repository-url>
cd forbes-progress-pulse

# Install dependencies (using npm as example)
npm install
```

**Step 2: Environment Configuration**

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values can be found in your Supabase project settings under API configuration.

**Step 3: Database Setup**

1. Create the required tables in your Supabase database:
   - `employees` - Employee master data
   - `attendance` - Attendance records
   - `FG_Completion` - Production completion data
   - `Users` - System user accounts



2. Create initial user accounts in the `Users` table with appropriate roles (leader, manager, admin)

**Step 4: Run Development Server**

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

**Step 5: Build for Production**

```bash
# Type check
npm run type-check

# Build the application
npm run build

# Start production server
npm start
```

**Available Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript compiler to check for type errors

### Key Algorithms and Calculations

The dashboard metrics are calculated using specific business logic formulas that combine attendance data with production completion data. Understanding these calculations is essential for interpreting the metrics correctly.

**Capacity Factor:**
The system uses a constant capacity factor derived from standard manufacturing metrics:
```
CAPACITY_FACTOR = 435 / 17 ≈ 25.588
```
This factor represents the indexed capacity per unit of manpower and is used to calculate theoretical production capacity.

**Daily Metrics Calculation:**

For each day in the selected period, the following metrics are calculated:

1. **Manpower (Nos)**
   - Count of employees assigned to the group
   - Filtered to exclude employees with expired employment periods

2. **Absentees (Nos)**
   - Count of employees marked as absent or on leave
   - Half-day absences are counted as 0.5
   - Formula: Sum of absence weights (absent=1, leave=1, half_day=0.5, present=0, holiday=0)

3. **Absenteeism Percentage**
   ```
   Absenteeism (%) = (Absentees / Manpower) × 100
   ```

4. **Indexed Capacity at 100%**
   ```
   Indexed Capacity (at 100%) = Manpower × CAPACITY_FACTOR
   ```
   This represents the theoretical maximum production capacity if all employees are present.

5. **Indexed Capacity with Actual Absenteeism**
   ```
   Indexed Capacity (with Absenteeism) = Indexed Capacity (at 100%) × (1 - Absenteeism (%) / 100)
   ```
   This adjusts the capacity to account for actual attendance levels.

6. **Indexed FG Completion Value**
   - Sum of "Index Qty" from FG Completion records matching the group for the date
   - Group matching is performed across multiple dimensions: Class, Dept Code, Item Type, FG Under FG

7. **Indexed FG Completion Percentage**
   ```
   Indexed FG Completion (%) = (Indexed FG Completion Value / Indexed Capacity (at 100%)) × 100
   ```
   This shows production completion relative to full capacity.

8. **Capacity Utilization Percentage**
   ```
   Capacity Utilization (%) = (Indexed FG Completion Value / Indexed Capacity (with Absenteeism)) × 100
   ```
   This is the key metric showing actual utilization accounting for attendance.

**Aggregation Logic:**

Monthly averages and totals are calculated as follows:
- **Total**: Sum of daily values across all days in the period
- **Average**: Total divided by the number of days in the period
- **Overall Completion**: Average of Capacity Utilization Percentage across all days

**Group Matching Algorithm:**

FG Completion records are matched to groups using a flexible matching algorithm:
1. Normalize group name and record field values (trim and lowercase)
2. Check if any of the following fields match the group name:
   - Class
   - Dept Code
   - Item Type
   - FG Under FG
3. If any field matches, the record is included in the group's metrics

This allows production data to be associated with groups through multiple dimensions, providing flexibility in how production is tracked and reported.

### Component Architecture

The frontend follows a component-based architecture with clear separation between presentation components, business logic, and data fetching. Understanding this architecture helps in maintaining and extending the application.

**Component Hierarchy:**

**1. Page-Level Components (`src/components/views/`)**
- `Dashboard.tsx` - Main dashboard page with KPI cards, tables, and charts
- `GroupLeaderPanel.tsx` - Group leader interface with attendance and employee management
- `ManageAccountsPanel.tsx` - User account management (admin only)
- `Index.tsx` - Landing/home page
- `NotFound.tsx` - 404 error page

**2. Feature Components (`src/components/`)**
- **auth/** - Authentication components (LoginPage, ProtectedRoute)
- **dashboard/** - Dashboard-specific components (DataTable, PerformanceChart)
- **groupleader/** - Group leader functionality (AttendanceForm, AttendanceTable, EmployeeForm, GroupSummary)
- **layout/** - Layout components (DashboardLayout, DashboardNavbar)
- **navigation/** - Navigation components (HierarchySelector)
- **reports/** - Report upload components (ReportUpload)
- **ui/** - Reusable UI component library (buttons, cards, tables, forms, etc.)

**3. State Management:**

**React Context (`src/contexts/AuthContext.tsx`):**
- Manages global authentication state
- Provides `user` object and `signIn`/`signOut` functions
- Wraps the application in `app/providers.tsx`

**Local State:**
- Components use React hooks (`useState`, `useEffect`) for local state management
- Data fetching is handled through `useEffect` hooks that call API endpoints
- Loading and error states are managed locally within each component

**4. Data Flow Pattern:**

```
User Interaction
    ↓
Component Event Handler
    ↓
API Call (fetch to /api/*)
    ↓
API Route Handler
    ↓
Service Layer (business logic)
    ↓
Supabase Client (database)
    ↓
Response flows back through layers
    ↓
Component State Update
    ↓
UI Re-render
```

**5. Component Communication:**

- **Props**: Parent-to-child data passing
- **Callbacks**: Child-to-parent communication via function props
- **Context**: Global state (authentication) via React Context
- **URL State**: Hierarchy selection (group, month, year) via URL parameters and component state

**6. Reusable UI Components:**

The `components/ui/` directory contains a comprehensive design system built on Radix UI primitives:
- Form components (Input, Select, Checkbox, etc.)
- Layout components (Card, Tabs, Separator)
- Feedback components (Toast, Alert, Dialog)
- Data display (Table, Badge, Avatar)
- Navigation (Breadcrumb, Navigation Menu)

These components follow consistent patterns and can be composed to build complex interfaces.

**7. Type Safety:**

TypeScript interfaces ensure type safety across components:
- Component props are typed with interfaces
- API responses are typed with service-defined interfaces
- Shared types are defined in `src/types/dashboard.ts`

**8. Styling Approach:**

- **Tailwind CSS**: Utility-first CSS framework for styling
- **CSS Variables**: Theme colors and spacing defined in `globals.css`
- **Component Variants**: Using `class-variance-authority` for component style variants
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Configuration

The application requires minimal configuration, primarily through environment variables and database setup.

**Environment Variables:**

Create a `.env.local` file in the project root with the following required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Environment Variable Details:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key (found in Project Settings > API)

**Note:** The `NEXT_PUBLIC_` prefix makes these variables available to client-side code. Never expose sensitive keys (like service role keys) with this prefix.

**Database Configuration:**

The application expects the following database structure:

**Tables:**
1. `employees` - Employee master data
2. `attendance` - Daily attendance records
3. `FG_Completion` - Production completion data (case-sensitive table name)
4. `Users` - System user accounts (case-sensitive table name)

**Required Columns:**

- **employees**: token_no (PK), name, group, desig, role, employment_start_date, employment_end_date
- **attendance**: token_no, attendance_date, status, group (composite unique key on token_no + attendance_date)
- **FG_Completion**: Item, Class, Transaction Date, Index factor, Index Qty, Dept Code, Item Type, FG Under FG
- **Users**: email (PK), role

**Next.js Configuration:**

The `next.config.js` file contains Next.js-specific settings. The default configuration is suitable for most deployments, but can be customized for:
- Image optimization domains
- Redirects and rewrites
- Environment variable exposure
- Build optimizations

**TypeScript Configuration:**

The `tsconfig.json` file configures TypeScript compilation:
- Strict type checking enabled
- Path aliases configured (`@/` maps to `src/`)
- Next.js and React types included

**Tailwind Configuration:**

The `tailwind.config.ts` file configures:
- Content paths for class scanning
- Theme customization (colors, spacing, fonts)
- Plugin configuration (animations, typography)

**Development vs Production:**

- **Development**: Uses `.env.local` for local development
- **Production**: Environment variables should be set in your hosting platform (Vercel, Netlify, etc.)
- **Build**: Type checking and linting should pass before deployment

### Conclusion

Forbes Progress Pulse is a comprehensive solution for workforce attendance and production tracking in manufacturing environments. The system integrates multiple data sources, implements complex business logic calculations, and provides an intuitive interface for stakeholders at various organizational levels.

**Fundamental Concepts and Technologies:**

The project leverages modern software engineering principles and web technologies:

- **Full-Stack Architecture**: Next.js App Router with server-side rendering and client-side interactivity
- **Type Safety**: TypeScript throughout for compile-time error detection and improved maintainability
- **Component-Based Design**: React components organized by feature domain for modularity and reusability
- **Service Layer Pattern**: Business logic abstracted into service classes (AttendanceService, DashboardService, FGCompletionService) for separation of concerns
- **RESTful API Design**: Standard HTTP methods with clear semantics for intuitive API usage
- **Database Abstraction**: Supabase PostgreSQL with type-safe query builder combining ORM benefits with SQL flexibility
- **State Management**: React Context API for global state and local component state for UI-specific data
- **Server-Side Calculations**: Complex business logic (capacity utilization, absenteeism, production metrics) computed server-side for accuracy
- **Batch Processing**: Large dataset operations handled through batched inserts with timeout protection
- **Role-Based Access Control**: Three-tier authorization model (leader, manager, admin) at API and database levels
- **Responsive Design**: Tailwind CSS for cross-device compatibility
- **Error Handling**: Multi-layer validation (components, API routes, service layers) ensuring data integrity

**Key Achievements:**

The system automates manual data entry, provides real-time visibility into workforce and production metrics, enables data-driven decision making, supports role-based access control, handles large-scale data processing efficiently, and maintains data integrity through comprehensive validation.

The project demonstrates modern web development best practices including type-safe development, modular architecture, separation of concerns, performance optimization, and user experience design. The Forbes Progress Pulse system effectively applies modern web technologies and software engineering principles to solve real-world business challenges in manufacturing operations management.

