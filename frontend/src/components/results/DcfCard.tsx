import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3, Zap } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";

interface DcfCardProps {
  analysis: AnalysisResult;
  excelFile?: string;
}

function formatNumber(val: number | null | undefined): string {
  if (val == null) return "N/A";
  if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}T`;
  if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(1)}B`;
  return `$${val.toFixed(1)}M`;
}

function formatPct(val: number | null | undefined): string {
  if (val == null) return "N/A";
  return `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;
}

export function DcfCard({ analysis, excelFile }: DcfCardProps) {
  const { extracted_data, dcf, projections, company_name } = analysis;

  const latestRevenue = extracted_data?.revenue?.at(-1)?.value;
  const latestEbitda = extracted_data?.ebitda?.at(-1)?.value;
  const latestFcf = extracted_data?.free_cash_flow?.at(-1)?.value;

  const upside = dcf?.upside_downside_pct;
  const isPositive = upside != null && upside > 0;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </div>
            DCF Valuation — {company_name}
          </CardTitle>
          {excelFile && (
            <a href={getDownloadUrl(excelFile)} download>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                <Download className="h-3 w-3" />
                Excel
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" /> Revenue
            </div>
            <div className="text-lg font-bold text-foreground">{formatNumber(latestRevenue)}</div>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Zap className="h-3 w-3" /> EBITDA
            </div>
            <div className="text-lg font-bold text-foreground">{formatNumber(latestEbitda)}</div>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" /> FCF
            </div>
            <div className="text-lg font-bold text-foreground">{formatNumber(latestFcf)}</div>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* DCF Output */}
        {dcf && (
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-muted/30 to-muted/10 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">DCF Output</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground">Implied Price</div>
                <div className="text-2xl font-bold text-emerald-400">${dcf.implied_price?.toFixed(2) ?? "N/A"}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Upside / Downside</div>
                <div className={`text-2xl font-bold flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatPct(upside)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Enterprise Value</div>
                <div className="text-sm font-semibold">{formatNumber(dcf.enterprise_value)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Equity Value</div>
                <div className="text-sm font-semibold">{formatNumber(dcf.equity_value)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">WACC</div>
                <div className="text-sm font-semibold">{dcf.wacc}%</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Terminal Growth</div>
                <div className="text-sm font-semibold">{dcf.terminal_growth_rate}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Projections */}
        {projections && projections.years?.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">5-Year Projections ($M)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Metric</th>
                    {projections.years.map((y) => (
                      <th key={y} className="py-2 px-2 text-right text-muted-foreground font-medium">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Revenue", data: projections.revenue },
                    { label: "EBITDA", data: projections.ebitda },
                    { label: "FCF", data: projections.fcf },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-border/20">
                      <td className="py-2 pr-3 font-medium">{row.label}</td>
                      {row.data?.map((v, i) => (
                        <td key={i} className="py-2 px-2 text-right tabular-nums">{v != null ? v.toLocaleString() : "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
