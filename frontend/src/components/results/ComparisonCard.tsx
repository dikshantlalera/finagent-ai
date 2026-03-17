import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, GitCompareArrows } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";

interface ComparisonCardProps {
  analysis: AnalysisResult;
  excelFile?: string;
}

export function ComparisonCard({ analysis, excelFile }: ComparisonCardProps) {
  const { comparison, company_name } = analysis;

  if (!comparison || !comparison.companies?.length) return null;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15">
              <GitCompareArrows className="h-4 w-4 text-purple-500" />
            </div>
            Company Comparison
            {company_name && ` — ${company_name}`}
          </CardTitle>
          {excelFile && (
            <a href={getDownloadUrl(excelFile)} download>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-purple-500/30 text-purple-500 hover:bg-purple-500/10">
                <Download className="h-3 w-3" />
                Excel
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Metric
                </th>
                {comparison.companies.map((c) => (
                  <th
                    key={c.name}
                    className="py-2.5 px-3 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.metrics.map((metric, i) => (
                <tr
                  key={metric}
                  className={`border-b border-border/20 ${i % 2 === 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="py-2.5 pr-4 font-medium text-foreground/90">{metric}</td>
                  {comparison.companies.map((c) => {
                    const val = c.values[metric];
                    return (
                      <td key={c.name} className="py-2.5 px-3 text-right tabular-nums">
                        {val != null ? val.toLocaleString() : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
