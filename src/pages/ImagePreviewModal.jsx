import { Dialog, DialogContent } from "@/components/ui/dialog";
import Loader from "@/components/ui/Loader";
import { useEffect, useState } from "react";

export function ImagePreviewModal({
  open,
  onOpenChange,
  image,
  title,
  subtitle,
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) setIsLoading(true);
  }, [image, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-800px border-0 bg-transparent p-0 shadow-none"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="overflow-hidden w-full rounded-2xl bg-background">
          {/* IMAGE */}
          
          <div className="relative aspect-square w-full overflow-hidden bg-muted flex items-center justify-center">
            {/* SPINNER: Shows only when isLoading is true */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            <img
              src={image}
              alt={title}
              // onLoad triggers automatically when the browser finishes fetching the image
              onLoad={() => setIsLoading(false)}
              className={`h-full w-full object-cover transition-all duration-500 hover:scale-105 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          {/* FOOTER */}
          <div className="border-t p-4">
            <h3 className="text-lg font-bold">{title}</h3>

            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
