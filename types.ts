export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  content: string | ArrayBuffer | null; // Text content or base64 for images
  mimeType: string;
  tokenCount?: number; // Estimated
}

export interface ResearchConfig {
  apiKey: string;
  model: ModelType;
  useGoogleSearch: boolean;
  useLocalContext: boolean; // New: Toggle for using uploaded files
  thinkingBudget: number; // 0 to disable
  language: string;
}

export interface SearchResult {
  title: string;
  url: string;
}

export interface ReportData {
  markdown: string;
  sources: SearchResult[];
  loading: boolean;
  error?: string;
  status: string; // 'planning' | 'searching' | 'analyzing' | 'writing' | 'done'
}