import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { previewTemplate } from "../apis/backend_apis";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewFrame({
  src,

  scale = 0.35,

  className = "",
}) {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");
  const loadHtml = async (templateName) => {
    try {
      setLoading(true);
      const response = await previewTemplate(templateName);
      if (response.status === 200) {
        setHtml(response.data);
      }
    } catch (error) {
      toast.error("Failed to load template preview.");
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   loadHtml(src);
  // }, [src]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-auto rounded-lg bg-slate-100",
        className,
      )}
    >
      {loading && (
        <div className="absolute inset-0 z-10 bg-white p-4">
          <Skeleton className="h-8 w-40 rounded-md" />

          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="mt-10 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )}

      <iframe
        srcDoc={src}
        className="h-full w-full border-0"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
