import type { AnalysisResponse } from "./types";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:8000";

export async function analyzeDocuments(
  files: File[],
  prompt: string,
  apiKey: string
): Promise<AnalysisResponse> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("prompt", prompt);
  formData.append("api_key", apiKey);

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export function getDownloadUrl(filename: string): string {
  return `${API_BASE}/download/${encodeURIComponent(filename)}`;
}
