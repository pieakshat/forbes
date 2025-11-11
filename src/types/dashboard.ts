export interface DashboardTableRow {
    label: string;
    values: number[];
    total?: number;
    average?: number;
}

export interface DashboardTableData {
    headers: string[];
    rows: DashboardTableRow[];
}

export interface DashboardChartPoint {
    name: string;
    indexFGCompletion: number;
    capacityAt100: number;
    capacityWithAbs: number;
    percentage: number;
}

export interface DashboardSummary {
    manpowerTotal: number;
    manpowerAverage: number;
    absenteeismAverage: number;
    indexedFgCompletionAverage: number;
    capacityUtilizationAverage: number;
}

export interface DashboardMeta {
    month: number;
    year: number;
    label: string;
    days: number;
}

export interface DashboardMetricsResult {
    table: DashboardTableData;
    chart: DashboardChartPoint[];
    summary: DashboardSummary;
    meta: DashboardMeta;
}


