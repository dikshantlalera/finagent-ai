import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";

interface MemoCardProps {
  analysis: AnalysisResult;
  wordFile?: string;
}

export function MemoCard({ analysis, wordFile }: MemoCardProps) {
  const { memo, company_name, extracted_data, years_covered } = analysis;
  if (!memo) return null;

  const recColor =
    memo.recommendation === "Buy"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : memo.recommendation === "Sell"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30";

  const RecIcon =
    memo.recommendation === "Buy"
      ? CheckCircle
      : memo.recommendation === "Sell"
      ? AlertTriangle
      : MinusCircle;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            Investment Memo — {company_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`gap-1 ${recColor}`}>
              <RecIcon className="h-3 w-3" />
              {memo.recommendation}
            </Badge>
            {wordFile && (
              <a href={getDownloadUrl(wordFile)} download>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                  <Download className="h-3 w-3" />
                  Word
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Executive Summary */}
        {memo.executive_summary && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{memo.executive_summary}</p>
          </div>
        )}

        <Separator className="bg-border/30" />

        {/* Investment Thesis */}
        {memo.investment_thesis && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Investment Thesis</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{memo.investment_thesis}</p>
          </div>
        )}

        {/* Key Metrics Table */}
        {extracted_data && years_covered && years_covered.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Key Financial Metrics ($M)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Metric</th>
                      {years_covered.map((y) => (
                        <th key={y} className="py-2 px-2 text-right text-muted-foreground font-medium">{y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        { label: "Revenue", key: "revenue" },
                        { label: "Net Income", key: "net_income" },
                        { label: "EBITDA", key: "ebitda" },
                        { label: "FCF", key: "free_cash_flow" },
                      ] as const
                    ).map((row) => {
                      const items = extracted_data[row.key] || [];
                      const yearMap = Object.fromEntries(items.map((i) => [i.year, i.value]));
                      return (
                        <tr key={row.key} className="border-b border-border/20">
                          <td className="py-2 pr-3 font-medium">{row.label}</td>
                          {years_covered.map((y) => (
                            <td key={y} className="py-2 px-2 text-right tabular-nums">
                              {yearMap[y] != null ? Number(yearMap[y]).toLocaleString() : "—"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Valuation Summary */}
        {memo.valuation_summary && (
          <>
            <Separator className="bg-border/30" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Valuation Summary</h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{memo.valuation_summary}</p>
            </div>
          </>
        )}

        {/* Risk Factors */}
        {memo.risk_factors && memo.risk_factors.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Risk Factors
              </h4>
              <ul className="space-y-1.5">
                {memo.risk_factors.map((risk, i) => (
                  <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500/60 shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
