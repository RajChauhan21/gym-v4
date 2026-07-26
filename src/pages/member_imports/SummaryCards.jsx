import { Card, CardContent } from "@/components/ui/card";

import {
  CheckCircle2,
  CircleX,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

export default function SummaryCards({
  total,

  imported,

  failed,
}) {
  const successRate = total === 0 ? 0 : Math.round((imported / total) * 100);

  const cards = [
    {
      title: "Total Rows",
      value: total,
      icon: FileSpreadsheet,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },

    {
      title: "Imported",
      value: imported,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },

    {
      title: "Failed",
      value: failed,
      icon: CircleX,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },

    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <CardContent className="p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>

                  <h2 className="mt-2 text-3xl font-bold">{card.value}</h2>
                </div>

                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <Icon className={`h-7 w-7 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
