import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";

import { FileSpreadsheet, X } from "lucide-react";

import SummaryCards from "./SummaryCards";
import ImportProgress from "./ImportProgress";
import ErrorList from "./ErrorList";
import DownloadErrorButton from "./DownloadErrorButton";
import { downloadMemberImportErrorReport } from "./downloadMemberImportErrorReport";
import { toast } from "sonner";

export default function ImportResultDialog({
  open,

  onOpenChange,

  result,
  downloadingErrors,
  onDownloadErrors,
}) {
  if (!result) return null;

  const downloadErrorReport = async () => {
    try {
      await downloadMemberImportErrorReport(result);

      toast.success("Error report downloaded successfully.");
    } catch {
      toast.error("Failed to download error report. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
                p-0
                flex flex-col
                overflow-hidden

                w-[96vw]

                sm:max-w-3xl

                lg:max-w-5xl

                xl:max-w-6xl

                max-h-[95vh]

                rounded-2xl
            "
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* HEADER */}

        <DialogHeader
          className="

                    border-b

                    px-5

                    py-5

                    sm:px-8

                "
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-4 no-scrollbar">
              <div
                className="
                                flex

                                h-14

                                w-14

                                items-center

                                justify-center

                                rounded-xl

                                bg-green-100

                                dark:bg-green-900/40

                            "
              >
                <FileSpreadsheet
                  className="

                                    h-7

                                    w-7

                                    text-green-600

                                "
                />
              </div>

              <div>
                <DialogTitle
                  className="

                                    text-xl

                                    sm:text-2xl

                                "
                >
                  Import Members
                </DialogTitle>
                <DialogPrimitive.Close asChild>
                  <button
                    disabled={downloadingErrors}
                    type="button"
                    className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
                    onClick={onOpenChange}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </DialogPrimitive.Close>

                <DialogDescription className="mt-1">
                  Review imported members and resolve any validation issues
                  before importing again.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}

        <div
          className="

                    space-y-6
no-scrollbar
                    overflow-y-auto

                    px-4

                    py-6

                    sm:px-8

                "
        >
          <SummaryCards
            total={result.totalRows}
            imported={result.importedRows}
            failed={result.failedRows}
          />

          <ImportProgress
            total={result.totalRows}
            imported={result.importedRows}
            failed={result.failedRows}
          />

          <Separator />

          <ErrorList errors={result.errors} />
        </div>

        {/* FOOTER */}

        <div
          className="

                    border-t

                    bg-muted/30

                    px-4

                    py-4

                    sm:px-8

                "
        >
          <div
            className="

                        flex

                        flex-col-reverse

                        gap-3

                        sm:flex-row

                        sm:justify-end

                    "
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>

            {/* <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onRetry}
            >
              Retry Import
            </Button> */}

            <DownloadErrorButton
              disabled={result.failedRows === 0}
              onClick={downloadErrorReport}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
