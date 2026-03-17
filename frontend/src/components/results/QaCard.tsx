import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareText } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface QaCardProps {
  analysis: AnalysisResult;
}

function highlightNumbers(text: string): React.ReactNode[] {
  // Split text by numbers and highlight them
  const parts = text.split(/(\$?[\d,]+\.?\d*[BMKTbmkt%]?)/g);
  return parts.map((part, i) => {
    if (/^\$?[\d,]+\.?\d*[BMKTbmkt%]?$/.test(part) && part.length > 0) {
      return (
        <span
          key={i}
          className="font-semibold text-emerald-400 bg-emerald-500/10 px-1 rounded"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function QaCard({ analysis }: QaCardProps) {
  const { custom_answer, company_name } = analysis;

  if (!custom_answer) return null;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15">
            <MessageSquareText className="h-4 w-4 text-cyan-500" />
          </div>
          Analysis
          {company_name && ` — ${company_name}`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {highlightNumbers(custom_answer)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
