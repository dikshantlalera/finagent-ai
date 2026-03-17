import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, PieChart } from "lucide-react";
import type { AnalysisResult, RatioItem } from "@/lib/types";
import { getDownloadUrl } from "@/lib/api";

interface RatioCardProps {
  analysis: AnalysisResult;
  excelFile?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  profitability: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "border-emerald-500/30" },
  liquidity: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "border-blue-500/30" },
  leverage: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "border-amber-500/30" },
  efficiency: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "border-purple-500/30" },
};

function RatioGroup({ title, items, colorKey }: { title: string; items: RatioItem[]; colorKey: string }) {
  const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.profitability;

  return (
    <div>
      <h4 className={`text-xs uppercase tracking-wider mb-2.5 font-medium ${colors.text}`}>
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((ratio) => (
          <div
            key={ratio.name}
            className={`rounded-lg border ${colors.icon} ${colors.bg} p-3`}
          >
            <div className="text-[10px] text-muted-foreground mb-1">{ratio.name}</div>
            <div className="text-lg font-bold tabular-nums">
              {ratio.value != null ? `${ratio.value}${ratio.unit}` : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatioCard({ analysis, excelFile }: RatioCardProps) {
  const { ratios, company_name } = analysis;

  if (!ratios) return null;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
              <PieChart className="h-4 w-4 text-orange-500" />
            </div>
            Financial Ratios
            {company_name && ` — ${company_name}`}
          </CardTitle>
          {excelFile && (
            <a href={getDownloadUrl(excelFile)} download>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-orange-500/30 text-orange-500 hover:bg-orange-500/10">
                <Download className="h-3 w-3" />
                Excel
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {ratios.profitability && ratios.profitability.length > 0 && (
          <RatioGroup title="Profitability" items={ratios.profitability} colorKey="profitability" />
        )}
        {ratios.liquidity && ratios.liquidity.length > 0 && (
          <RatioGroup title="Liquidity" items={ratios.liquidity} colorKey="liquidity" />
        )}
        {ratios.leverage && ratios.leverage.length > 0 && (
          <RatioGroup title="Leverage" items={ratios.leverage} colorKey="leverage" />
        )}
        {ratios.efficiency && ratios.efficiency.length > 0 && (
          <RatioGroup title="Efficiency" items={ratios.efficiency} colorKey="efficiency" />
        )}
      </CardContent>
    </Card>
  );
}
