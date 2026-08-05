import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Upload, Download, Loader2, X } from "lucide-react";

import UploadDropzone from "./UploadDropzone";

import ImportResultDialog from "./ImportResultDialog";

import useMemberImport from "./useMemberImport";

export default function ImportMembersDialog({
  open,

  onOpenChange,
}) {
  const {
    selectedFile,

    selectFile,

    removeFile,

    uploading,

    uploadMembers,

    downloadTemplate,

    downloadingTemplate,

    result,

    resultOpen,

    setResultOpen,

    resetImport,

    downloadErrors,

    downloadingErrors,
  } = useMemberImport();

  //-------------------------------------
  // Reset when dialog closes
  //-------------------------------------

  useEffect(() => {
    if (!open) {
      resetImport();
    }
  }, [open, resetImport]);

  //-------------------------------------
  // Upload
  //-------------------------------------

  const handleImport = async () => {
    await uploadMembers();
  };

  //-------------------------------------
  // Close
  //-------------------------------------

  const handleClose = () => {
    if (uploading) return;

    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleClose}
        disableOutsidePointerEvents={uploading || downloadingTemplate}
      >
        <DialogContent
          className="

                        w-[95vw]

                        sm:max-w-3xl

                        max-h-[95vh]

                        overflow-y-auto

                        rounded-2xl

                        p-0
                    "
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* {!(uploading || downloadingTemplate) && (
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          )} */}

          {/* Header */}

          <DialogHeader
            className="

                            border-b

                            px-6

                            py-5

                        "
          >
            <DialogTitle>Import Members</DialogTitle>
            <DialogPrimitive.Close
              disabled={uploading || downloadingTemplate}
              className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
              onClick={handleClose} // Also clear form if they just close the modal
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <DialogDescription>
              Upload an Excel (.xlsx) file to import members into your gym.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}

          <div className="space-y-6 p-6">
            <UploadDropzone
              selectedFile={selectedFile}
              onFileSelect={selectFile}
              onRemove={removeFile}
              disabled={uploading || downloadingTemplate}
            />
          </div>

          {/* Footer */}

          <div
            className="

                            border-t

                            px-6

                            py-5

                            flex

                            flex-col

                            gap-3

                            sm:flex-row

                            sm:justify-between

                            sm:items-center

                        "
          >
            {/* Left */}

            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={downloadingTemplate || uploading}
              className="w-full sm:w-auto"
            >
              {downloadingTemplate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Template
            </Button>

            {/* Right */}

            <div
              className="

                                flex

                                flex-col

                                gap-2

                                sm:flex-row

                            "
            >
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={downloadingTemplate || uploading}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <Button
                onClick={handleImport}
                disabled={uploading || !selectedFile}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}

                {uploading ? "Importing..." : "Import Members"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImportResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        result={result}
        downloadingErrors={downloadingErrors}
        onDownloadErrors={downloadErrors}
      />
    </>
  );
}
