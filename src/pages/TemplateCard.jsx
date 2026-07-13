import { Eye, Check, Sparkles, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PreviewFrame from "./PreviewFrame";
import { Badge } from "@/components/ui/badge";

export default function TemplateCard({
  template,
  active,
  onPreview,
  onSelect,
  loading,
}) {
  return (
    <Card
      className={`
        group
        overflow-hidden
        rounded-2xl
        flex
       flex-col
       h-full
        border
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        ${active ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200"}
    `}
    >
      {/* Accent */}

      <div
        className="h-1 w-full"
        style={{
          background: template.color || "#2563eb",
        }}
      />

      {/* Preview */}

      <div
        className="
        relative
        h-[260px]
        overflow-hidden
        bg-gradient-to-b
        from-slate-100
        to-slate-200
    "
      >
        {template.featured && (
          <Badge
            className="
                absolute
                left-3
                top-3
                z-20
                bg-amber-500
            "
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Featured
          </Badge>
        )}

        {/* {active && (
          <Badge
            className="
                absolute
                right-3
                top-3
                z-20
            "
          >
            <Check className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )} */}

        <PreviewFrame
          src={template.previewUrl}
          fit="width"
          className="h-full"
        />
      </div>

      {/* Information */}

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-black">{template.name}</h3>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>

          {/* <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{template.category}</Badge>
            {active && (
              <Badge className="w-full min-[769px]:flex-1 h-5 min-h-[31px] text-white dark:bg-black dark:text-white flex items-center justify-center gap-2 rounded-md border-0 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-right-5 duration-300 ease-in-out">
                <Check className="h-4 w-4 shrink-0" />
                <span>Active</span>
              </Badge>
            )}

            {template.singlePage && (
              <Badge variant="outline">Single Page</Badge>
            )}
          </div> */}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{template.category}</Badge>

            {active && (
              <Badge
                // Removed w-full and flex-1. Added clean padding and matching height styles.
                className="h-5 text-white bg-primary dark:bg-zinc-900 dark:text-white flex items-center gap-1.5 px-2.5 text-xs font-semibold shadow-sm animate-in fade-in zoom-in-95 duration-200"
              >
                <Check className="h-3 w-3 shrink-0" />
                <span>Active</span>
              </Badge>
            )}

            {template.singlePage && (
              <Badge variant="outline">Single Page</Badge>
            )}
          </div>
        </div>

        <div className="mt-auto pt-5 flex flex-col gap-2 min-[769px]:flex-row">
          <Button
            className="w-full min-[769px]:flex-1 dark:bg-black text-white dark:text-white"
            onClick={onPreview}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          {/* <Button
            variant="outline"
            className="w-full min-[769px]:flex-1 text-black dark:bg-black dark:text-white flex items-center justify-center gap-2"
            disabled={active || loading} // Disable button during loading too
            onClick={onSelect}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Selecting...</span>
              </>
            ) : active ? (
              "Selected"
            ) : (
              "Use"
            )}
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
