import { CheckCircle2, CircleX, Clock3, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import { Badge } from "@/components/ui/badge";

export default function ImportProgress({
  total,

  imported,

  failed,
}) {
  const successRate = total === 0 ? 0 : Math.round((imported / total) * 100);

  const remaining = Math.max(total - imported - failed, 0);

  return (
    <div
      className="
                rounded-2xl
                border
                bg-card
                p-5
                shadow-sm
                space-y-5
            "
    >
      {/* Top */}

      <div
        className="
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
      >
        <div>
          <h3
            className="
                            text-lg
                            font-semibold
                        "
          >
            Import Progress
          </h3>

          <p
            className="
                            text-sm
                            text-muted-foreground
                            mt-1
                        "
          >
            {imported} of {total} members imported successfully
          </p>
        </div>

        <Badge
          className="
                        self-start
                        md:self-auto
                        rounded-full
                        px-4
                        py-1.5
                        text-sm
                    "
        >
          {successRate}% Success
        </Badge>
      </div>

      {/* Progress */}

      <div className="space-y-2">
        <Progress value={successRate} className="h-3" />

        <div
          className="
                        flex
                        justify-between
                        text-xs
                        text-muted-foreground
                    "
        >
          <span>0%</span>

          <span>100%</span>
        </div>
      </div>

      {/* Statistics */}

      <div
        className="
                    grid
                    grid-cols-1
                    gap-3

                    sm:grid-cols-3
                "
      >
        {/* Imported */}

        <div
          className="
                        rounded-xl
                        border
                        bg-green-50
                        dark:bg-green-950/20
                        p-4
                    "
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="
                                h-5
                                w-5
                                text-green-600
                            "
            />

            <span
              className="
                                text-sm
                                font-medium
                            "
            >
              Imported
            </span>
          </div>

          <p
            className="
                            mt-3
                            text-3xl
                            font-bold
                            text-green-700
                            dark:text-green-400
                        "
          >
            {imported}
          </p>
        </div>

        {/* Failed */}

        <div
          className="
                        rounded-xl
                        border
                        bg-red-50
                        dark:bg-red-950/20
                        p-4
                    "
        >
          <div className="flex items-center gap-2">
            <CircleX
              className="
                                h-5
                                w-5
                                text-red-600
                            "
            />

            <span
              className="
                                text-sm
                                font-medium
                            "
            >
              Failed
            </span>
          </div>

          <p
            className="
                            mt-3
                            text-3xl
                            font-bold
                            text-red-700
                            dark:text-red-400
                        "
          >
            {failed}
          </p>
        </div>

        {/* Remaining */}

        <div
          className="
                        rounded-xl
                        border
                        bg-blue-50
                        dark:bg-blue-950/20
                        p-4
                    "
        >
          <div className="flex items-center gap-2">
            <Clock3
              className="
                                h-5
                                w-5
                                text-blue-600
                            "
            />

            <span
              className="
                                text-sm
                                font-medium
                            "
            >
              Remaining
            </span>
          </div>

          <p
            className="
                            mt-3
                            text-3xl
                            font-bold
                            text-blue-700
                            dark:text-blue-400
                        "
          >
            {remaining}
          </p>
        </div>
      </div>

      {/* Footer */}

      <div
        className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-muted/40
                    px-4
                    py-3
                "
      >
        <TrendingUp
          className="
                        h-5
                        w-5
                        text-primary
                    "
        />

        <p
          className="
                        text-sm
                        text-muted-foreground
                    "
        >
          {successRate === 100
            ? "Excellent! Every member was imported successfully."
            : `${failed} member${failed !== 1 ? "s" : ""} require attention before they can be imported.`}
        </p>
      </div>
    </div>
  );
}
