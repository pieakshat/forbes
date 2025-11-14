import { createClient } from '../supabase/server';
import { parse } from 'csv-parse/sync';

export interface FGCompletionRow {
    Item: string;
    Class: string;
    Description?: string;
    'Transaction Qty'?: string;
    'Transaction Date'?: string;
    'User Name'?: string;
    'Job Order No'?: string;
    'FG Under FG'?: string;
    'Item Type'?: string;
    'Dept Code'?: string;
    'Trim Code'?: string;
    VENDOR?: string;
    'Index factor'?: string;
    'Index Qty'?: string;
}

// Match exact SQL column names (with quotes for case-sensitive columns)
export interface FGCompletionRecord {
    "Item": string;
    "Class": string | null;
    "Description": string | null;
    "Transaction Qty": number | null;
    "Transaction Date": string | null;
    "User Name": string | null;
    "Job Order No": string | null;
    "FG Under FG": string | null;
    "Item Type": string | null;
    "Dept Code": string | null;
    "Trim Code": string | null;
    "VENDOR": string | null;
    "Index factor": number | null;
    "Index Qty": number | null;
}

export interface UploadResult {
    success: boolean;
    message: string;
    recordsUploaded: number;
    recordsTotal: number;
    skipped: number;
    uploadSessionId?: string;
    data?: any[];
    error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB


export class FGCompletionService {
    /**
     * Upload FG Completion CSV file
     */
    static async uploadCSV(
        fileBuffer: ArrayBuffer,
        fileName: string,
        uploadedBy: string
    ): Promise<UploadResult> {
        try {
            // Validate file
            const validation = this.validateFile(fileBuffer, fileName);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.error || 'Invalid file',
                    recordsUploaded: 0,
                    recordsTotal: 0,
                    skipped: 0,
                    error: validation.error,
                };
            }

            console.log("parsing csv...")
            const parseResult = this.parseCSV(fileBuffer);
            if (!parseResult.success || !parseResult.records) {
                console.error("CSV parse failed:", parseResult.error);
                return {
                    success: false,
                    message: parseResult.error || 'Failed to parse CSV',
                    recordsUploaded: 0,
                    recordsTotal: 0,
                    skipped: 0,
                    error: parseResult.error,
                };
            }
            console.log(`CSV parsed successfully: ${parseResult.records.length} records`);

            // Validate data
            console.log("validating data...")
            const validationResult = this.validateData(parseResult.records);
            if (!validationResult.success || !validationResult.records) {
                console.error("Data validation failed:", validationResult.error);
                return {
                    success: false,
                    message: validationResult.error || 'Invalid data',
                    recordsUploaded: 0,
                    recordsTotal: parseResult.records.length,
                    skipped: parseResult.records.length,
                    error: validationResult.error,
                };
            }
            console.log("Data validation passed");

            // Generate unique upload session ID with timestamp
            const uploadSessionId = this.generateUploadSessionId(uploadedBy, fileName);

            // Transform and sanitize data
            console.log("transforming data...")
            const transformedData = this.transformData(
                validationResult.records
            );
            console.log("insertingData");
            // Insert into database
            const insertResult = await this.insertData(transformedData);
            console.log("insertResult", insertResult);
            if (!insertResult.success) {
                return {
                    success: false,
                    message: insertResult.error || 'Database insert failed',
                    recordsUploaded: 0,
                    recordsTotal: parseResult.records.length,
                    skipped: parseResult.records.length,
                    error: insertResult.error,
                };
            }
            console.log("insertResult success");

            return {
                success: true,
                message: `Successfully uploaded ${transformedData.length} records`,
                recordsUploaded: transformedData.length,
                recordsTotal: parseResult.records.length,
                skipped: parseResult.records.length - transformedData.length,
                uploadSessionId: uploadSessionId,
                data: insertResult.data,
            };

        } catch (error) {
            console.error('FGCompletionService upload error:', error);
            return {
                success: false,
                message: 'Internal server error',
                recordsUploaded: 0,
                recordsTotal: 0,
                skipped: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Validate file before processing
     */
    private static validateFile(fileBuffer: ArrayBuffer, fileName: string): {
        valid: boolean;
        error?: string;
    } {
        // Check file size
        if (fileBuffer.byteLength > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        // Check file type
        if (!fileName.endsWith('.csv')) {
            return {
                valid: false,
                error: 'Invalid file type. Only CSV files are allowed',
            };
        }

        return { valid: true };
    }

    /**
     * Parse CSV content
     */
    private static parseCSV(fileBuffer: ArrayBuffer): {
        success: boolean;
        records?: FGCompletionRow[];
        error?: string;
    } {
        try {
            const fileContent = Buffer.from(fileBuffer).toString('utf-8');

            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }) as FGCompletionRow[];

            if (!records || records.length === 0) {
                return {
                    success: false,
                    error: 'CSV file is empty or has no valid data',
                };
            }

            return { success: true, records };
        } catch (error) {
            console.error('CSV parsing error:', error);
            return {
                success: false,
                error: 'Failed to parse CSV file. Please check the format.',
            };
        }
    }

    /**
     * Validate parsed CSV data
     */
    private static validateData(records: FGCompletionRow[]): {
        success: boolean;
        records?: FGCompletionRow[];
        error?: string;
    } {
        if (!records || records.length === 0) {
            return {
                success: false,
                error: 'No records to validate',
            };
        }

        // Check for required columns (case-insensitive)
        const requiredColumns = ['Item'];
        const firstRow = records[0];
        console.log("First row keys:", Object.keys(firstRow));
        console.log("Checking for required columns:", requiredColumns);

        // Case-insensitive column matching
        const rowKeys = Object.keys(firstRow);
        const missingColumns = requiredColumns.filter(col => {
            const found = rowKeys.find(key => key.toLowerCase() === col.toLowerCase());
            return !found;
        });

        if (missingColumns.length > 0) {
            console.error(`Missing columns: ${missingColumns.join(', ')}, Available columns: ${Object.keys(firstRow).join(', ')}`);
            return {
                success: false,
                error: `Missing required columns: ${missingColumns.join(', ')}. Available columns: ${Object.keys(firstRow).join(', ')}`,
            };
        }

        return { success: true, records };
    }

    /**
     * Generate unique upload session ID with timestamp
     */
    private static generateUploadSessionId(uploadedBy: string, fileName: string): string {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const userHash = uploadedBy.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '');
        const fileHash = fileName.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '');
        return `${timestamp}_${userHash}_${fileHash}`;
    }

    /**
     * Transform and sanitize data for database insertion
     */
    private static transformData(
        records: FGCompletionRow[]
    ): FGCompletionRecord[] {
        return records
            .map(row => this.transformRow(row))
            .filter(row => row["Item"] && row["Item"].length > 0); // Filter out empty items
    }

    /**
     * Helper to get case-insensitive value from row
     */
    private static getValue(row: any, key: string): string | undefined {
        const rowKeys = Object.keys(row);
        const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey] : undefined;
    }

    /**
     * Transform a single row - using exact SQL column names
     */
    private static transformRow(
        row: FGCompletionRow
    ): FGCompletionRecord {
        return {
            "Item": this.sanitizeString(this.getValue(row, 'Item') || ''),
            "Class": this.getValue(row, 'Class') ? this.sanitizeString(this.getValue(row, 'Class')!) : null,
            "Description": this.getValue(row, 'Description') ? this.sanitizeString(this.getValue(row, 'Description')!) : null,
            "Transaction Qty": this.getValue(row, 'Transaction Qty')
                ? this.sanitizeNumber(this.getValue(row, 'Transaction Qty')!)
                : null,
            "Transaction Date": this.getValue(row, 'Transaction Date')
                ? this.parseDate(this.getValue(row, 'Transaction Date')!)
                : null,
            "User Name": this.getValue(row, 'User Name') ? this.sanitizeString(this.getValue(row, 'User Name')!) : null,
            "Job Order No": this.getValue(row, 'Job Order No')
                ? this.sanitizeString(this.getValue(row, 'Job Order No')!)
                : null,
            "FG Under FG": this.getValue(row, 'FG Under FG')
                ? this.sanitizeString(this.getValue(row, 'FG Under FG')!)
                : null,
            "Item Type": this.getValue(row, 'Item Type') ? this.sanitizeString(this.getValue(row, 'Item Type')!) : null,
            "Dept Code": this.getValue(row, 'Dept Code') ? this.sanitizeString(this.getValue(row, 'Dept Code')!) : null,
            "Trim Code": this.getValue(row, 'Trim Code') ? this.sanitizeString(this.getValue(row, 'Trim Code')!) : null,
            "VENDOR": this.getValue(row, 'VENDOR') ? this.sanitizeString(this.getValue(row, 'VENDOR')!) : null,
            "Index factor": this.getValue(row, 'Index factor')
                ? this.sanitizeNumber(this.getValue(row, 'Index factor')!)
                : null,
            "Index Qty": this.getValue(row, 'Index Qty') ? this.sanitizeNumber(this.getValue(row, 'Index Qty')!) : null,
        };
    }

    /**
     * Sanitize string input
     */
    private static sanitizeString(value: string): string {
        if (!value) return '';
        // Trim whitespace and remove control characters
        return value
            .trim()
            .replace(/[\x00-\x1F\x7F]/g, '')
            .substring(0, 1000); // Max length protection
    }

    /**
     * Sanitize and parse number
     */
    private static sanitizeNumber(value: string): number | null {
        try {
            const num = parseFloat(value);
            if (isNaN(num) || !isFinite(num)) {
                return null;
            }
            return num;
        } catch {
            return null;
        }
    }

    /**
     * Parse and sanitize date string
     */
    private static parseDate(dateString: string): string | null {
        if (!dateString || dateString.trim() === '') {
            return null;
        }

        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return null;
            }

            // Return ISO format date string (YYYY-MM-DD)
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Date parsing error:', error);
            return null;
        }
    }

    /**
     * Insert data into database with batching and timeout handling
     */
    private static async insertData(data: FGCompletionRecord[]): Promise<{
        success: boolean;
        data?: any[];
        error?: string;
    }> {
        try {
            const supabase = await createClient();
            console.log("client created...");
            console.log(`Inserting ${data.length} records...`);

            // Batch size: Supabase typically handles 1000-5000 rows well
            const BATCH_SIZE = 1000;
            const TIMEOUT_MS = 60000; // 60 seconds per batch
            const allInsertedData: any[] = [];

            // Process in batches
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                const batch = data.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(data.length / BATCH_SIZE);

                console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

                // Insert with timeout - using exact table name from SQL
                const insertPromise = supabase
                    .from('FG_Completion')
                    .insert(batch)
                    .select();

                // Create timeout wrapper
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`Batch ${batchNumber} timed out after ${TIMEOUT_MS}ms`));
                    }, TIMEOUT_MS);
                });

                try {
                    const result = await Promise.race([insertPromise, timeoutPromise]);

                    if (result.error) {
                        console.error(`Database insert error for batch ${batchNumber}:`, result.error);
                        return {
                            success: false,
                            error: `Failed to insert batch ${batchNumber}: ${result.error.message}`,
                        };
                    }

                    if (result.data) {
                        allInsertedData.push(...result.data);
                        console.log(`Batch ${batchNumber} inserted successfully (${result.data.length} records)`);
                    }
                } catch (error) {
                    if (error instanceof Error && error.message.includes('timed out')) {
                        console.error(`Batch ${batchNumber} timed out`);
                        return {
                            success: false,
                            error: `Batch ${batchNumber} timed out. This may indicate a network issue or the batch is too large.`,
                        };
                    }
                    // Re-throw other errors to be caught by outer catch
                    throw error;
                }

                // Small delay between batches to avoid overwhelming the database
                if (i + BATCH_SIZE < data.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            console.log(`Insertion complete: ${allInsertedData.length} records inserted`);

            return { success: true, data: allInsertedData };
        } catch (error) {
            console.error('Database insert error:', error);
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown database error',
            };
        }
    }
}

