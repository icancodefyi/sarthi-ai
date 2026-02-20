import { ObjectId } from "mongodb";

// ─── User ──────────────────────────────────────────────────────────────────
export interface User {
  _id?: ObjectId | string;
  id: string;
  name: string;
  email: string;
  planType: "free" | "pro";
  createdAt: Date;
}

// ─── Dataset ───────────────────────────────────────────────────────────────
export type DatasetStatus = "processing" | "analyzed" | "completed" | "failed";

export interface Analytics {
  totalRecords: number;
  dateRange: { min: string; max: string } | null;
  columns: string[];
  numericSummary: Record<
    string,
    {
      mean: number;
      variance: number;
      min: number;
      max: number;
      stdDev: number;
    }
  >;
  growthPercent: number | null;
  movingAverages: Record<string, number[]>;
  anomalies: Anomaly[];
  riskScore: number;
  forecast: ForecastPoint[];
}

export interface Anomaly {
  rowIndex: number;
  column: string;
  value: number;
  zScore: number;
  label: string;
}

export interface ForecastPoint {
  period: number;
  value: number;
  label: string;
}

export interface AIReport {
  executiveSummary: string;
  insightHighlights: string[];
  anomalyExplanations: string[];
  riskReasoning: string;
  forecastNarrative: string;
  contextualNews: string[];
  certificationReasoning: string;
  confidenceScore: number;
}

export interface LinkedFarmer {
  aadhaar: string;
  name: string;
  village: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  crops: string[];
  landAcres: number;
  soilType: string;
  irrigationType: string;
}

export type DatasetCategory =
  | "agricultural"
  | "health"
  | "education"
  | "finance"
  | "infrastructure"
  | "environment"
  | "social"
  | "general";

export interface Dataset {
  _id?: ObjectId | string;
  userId: string;
  filename: string;
  originalName: string;
  category: DatasetCategory;
  status: DatasetStatus;
  metadata: {
    rowCount: number;
    columnCount: number;
    columns: string[];
    fileSize: number;
  };
  analytics: Analytics | null;
  aiReport: AIReport | null;
  linkedFarmer?: LinkedFarmer | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Report ────────────────────────────────────────────────────────────────
export interface CertificateObject {
  reportId: string;
  userId: string;
  userName: string;
  userEmail: string;
  datasetId: string;
  datasetName: string;
  generatedDate: Date;
  integrityHash: string;
  aiConfidenceScore: number;
  qrCodeUrl: string;
  snapshotSummary: {
    totalRecords: number;
    growthRate: number;
    riskScore: number;
    anomalyCount: number;
  };
  aiSummary: string;
  certificationNotes: string[];
}

export interface Report {
  _id?: ObjectId | string;
  reportId: string;
  userId: string;
  datasetId: string;
  snapshotData: {
    analytics: Analytics;
    aiReport: AIReport;
    user: Pick<User, "id" | "name" | "email">;
    dataset: Pick<
      Dataset,
      "filename" | "originalName" | "metadata"
    >;
  };
  integrityHash: string;
  certificateObject: CertificateObject;
  qrCodeUrl: string;
  createdAt: Date;
}
