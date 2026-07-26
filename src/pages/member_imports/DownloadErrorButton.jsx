import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useState } from "react";

import { toast } from "sonner";

export default function DownloadErrorButton({
  disabled,

  onClick,
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (disabled) {
      toast.info("No validation errors found.");

      return;
    }

    try {
      setLoading(true);

      await onClick();
    } catch (e) {
      toast.error("Unable to download error report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || loading}
      className="w-full sm:w-auto"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}

      {loading ? "Preparing..." : "Download Error Report"}
    </Button>
  );
}
