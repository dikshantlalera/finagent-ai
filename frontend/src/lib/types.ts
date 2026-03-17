export interface YearValue {
  year: number;
  value: number | null;
}

export interface ExtractedData {
  revenue?: YearValue[];
  net_income?: YearValue[];
  ebitda?: YearValue[];
  gross_margin_pct?: YearValue[];
  free_cash_flow?: YearValue[];
  total_debt?: YearValue[];
  cash?: YearValue[];
  shares_outstanding?: YearValue[];
}

export interface Projections {
  years: number[];
  revenue: number[];
  ebitda: number[];
  fcf: number[];
}

export interface DcfData {
  wacc: number;
  terminal_growth_rate: number;
  implied_price: number;
  upside_downside_pct: number;
  enterprise_value: number;
  equity_value: number;
}

export interface MemoData {
  executive_summary: string;
  investment_thesis: string;
  valuation_summary: string;
  risk_factors: string[];
  recommendation: "Buy" | "Hold" | "Sell";
}

export interface ComparisonCompany {
  name: string;
  values: Record<string, number | null>;
}

export interface ComparisonData {
  metrics: string[];
  companies: ComparisonCompany[];
}

export interface RatioItem {
  name: string;
  value: number | null;
  unit: string;
}

export interface RatiosData {
  profitability?: RatioItem[];
  liquidity?: RatioItem[];
  leverage?: RatioItem[];
  efficiency?: RatioItem[];
}

export type AnalysisType = "dcf" | "memo" | "comparison" | "ratio_analysis" | "custom_qa";

export interface AnalysisResult {
  analysis_type: AnalysisType;
  company_name?: string;
  companies?: string[];
  years_covered?: number[];
  extracted_data?: ExtractedData;
  projections?: Projections;
  dcf?: DcfData;
  memo?: MemoData;
  comparison?: ComparisonData;
  ratios?: RatiosData;
  custom_answer?: string;
}

export interface AnalysisResponse {
  analysis: AnalysisResult;
  downloads: {
    excel?: string;
    word?: string;
    error?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content?: string;
  files?: string[];
  analysis?: AnalysisResult;
  downloads?: AnalysisResponse["downloads"];
  timestamp: Date;
}
