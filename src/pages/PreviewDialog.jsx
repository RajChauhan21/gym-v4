import { useEffect, useMemo, useState } from "react";

import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Check,
} from "lucide-react";
import PreviewFrame from "./PreviewFrame";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import { previewTemplate } from "../apis/backend_apis";

export default function PreviewDialog({
  open,
  template,
  activeId,
  onOpenChange,
  onSelect,
}) {
  const [loading, setLoading] = useState(false);
  const handleOpenPreview = async () => {
    const newWindow = window.open("", "_blank");
    newWindow.document.open();
    newWindow.document.write(template.previewUrl);
    newWindow.document.close();
  };

  if (!template) return null;
  const isActive = activeId === template.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-[92vw] sm:w-[90vw] lg:w-[95vw] max-w-7xl h-[88vh] sm:h-[92vh] lg:h-[95vh] p-0 overflow-hidden bg-white dark:bg-black">
        {/* Header */}
        <DialogHeader className="border-b px-8 py-5">
          {/* Added items-start to lock the row alignment vertically */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between w-full pr-4">
            {/* Added lg:max-w-[75%] to stop title/description from expanding into badge space */}
            <div className="flex-1 lg:max-w-[75%]">
              <DialogTitle className="text-xl sm:text-2xl">
                {template.name}
              </DialogTitle>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                {template.description}
              </p>
            </div>

            {/* Added lg:ml-auto and lg:justify-end to perfectly pin badges to the right boundary */}
            <div className="flex flex-wrap gap-2 lg:ml-auto lg:justify-end lg:shrink-0 min-w-[80px]">
              {template.featured && <Badge>Featured</Badge>}
              {isActive && (
                <Badge className="transition-all duration-200">Active</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden bg-slate-200 p-2 sm:p-4 lg:p-4">
          <PreviewFrame src={template.previewUrl} className="min-h-full" />
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={handleOpenPreview}
            className="w-full"
            disabled={loading} // Disable during loading
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Full Preview
          </Button>

          <Button
            onClick={() => onSelect(template)} // 2. FIX: Pass the whole template object, not just template.id
            className="w-full flex items-center justify-center gap-2"
            disabled={isActive || loading} // 3. Disable if already active OR loading
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Selecting...</span>
              </>
            ) : isActive ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Use This Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
