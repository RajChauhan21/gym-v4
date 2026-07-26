import { useCallback } from "react";

import { useDropzone } from "react-dropzone";

import {
  UploadCloud,
  FileSpreadsheet,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function UploadDropzone({
  selectedFile,

  onFileSelect,

  onRemove,

  disabled,
}) {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (disabled) return;

      // Validation errors
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];

        switch (error.code) {
          case "file-invalid-type":
            toast.error("Only .xlsx files are supported.");
            break;

          case "file-too-large":
            toast.error("Maximum file size is 10 MB.");
            break;

          default:
            toast.error("Invalid file selected.");
        }

        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },

    [onFileSelect, disabled],
  );

  const {
    getRootProps,

    getInputProps,

    isDragActive,
  } = useDropzone({
    onDrop,

    multiple: false,

    disabled,

    maxSize: 10 * 1024 * 1024,

    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  return (
    <div className="space-y-5">
      {/* Drop Area */}

      <div
        {...getRootProps()}
        className={`

                    rounded-2xl

                    border-2

                    border-dashed

                    cursor-pointer

                    transition-all

                    duration-300

                    p-8

                    md:p-12

                    text-center

                    hover:border-primary

                    hover:bg-primary/5

                    ${
                      isDragActive
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-muted-foreground/30"
                    }

                    ${disabled ? "pointer-events-none opacity-60" : ""}

                `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <div
            className="

                        h-20

                        w-20

                        rounded-full

                        bg-primary/10

                        flex

                        items-center

                        justify-center

                        mb-6

                    "
          >
            <UploadCloud
              className="

                            h-10

                            w-10

                            text-primary

                        "
            />
          </div>

          <h3
            className="

                        text-xl

                        font-semibold

                    "
          >
            {isDragActive ? "Drop your Excel file" : "Drag & Drop Excel File"}
          </h3>

          <p
            className="

                        mt-2

                        text-muted-foreground

                        text-sm

                    "
          >
            or click anywhere to browse
          </p>

          <div
            className="

                        mt-6

                        flex

                        flex-wrap

                        justify-center

                        gap-2

                    "
          >
            <span
              className="

                            rounded-full

                            bg-muted

                            px-3

                            py-1

                            text-xs

                        "
            >
              .xlsx only
            </span>

            <span
              className="

                            rounded-full

                            bg-muted

                            px-3

                            py-1

                            text-xs

                        "
            >
              Max 10 MB
            </span>
          </div>
        </div>
      </div>

      {/* File Preview */}

      {selectedFile && (
        <div
          className="

                        rounded-xl

                        border

                        p-4

                        bg-card

                    "
        >
          <div
            className="

                            flex

                            flex-col

                            gap-4

                            sm:flex-row

                            sm:items-center

                            sm:justify-between

                        "
          >
            <div className="flex gap-3">
              <div
                className="

                                    h-12

                                    w-12

                                    rounded-lg

                                    bg-green-100

                                    dark:bg-green-900/30

                                    flex

                                    items-center

                                    justify-center

                                "
              >
                <FileSpreadsheet
                  className="

                                        h-6

                                        w-6

                                        text-green-600

                                    "
                />
              </div>

              <div>
                <h4
                  className="

                                        font-medium

                                        break-all

                                    "
                >
                  {selectedFile.name}
                </h4>

                <p
                  className="

                                        text-sm

                                        text-muted-foreground

                                    "
                >
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={onRemove}>
              <XCircle className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      )}

      {/* Help */}

      <div
        className="

                flex

                items-start

                gap-3

                rounded-xl

                border

                bg-muted/40

                p-4

            "
      >
        <AlertCircle
          className="

                    mt-0.5

                    h-5

                    w-5

                    text-primary

                    shrink-0

                "
        />

        <div>
          <h4 className="font-medium">Before Uploading</h4>

          <ul
            className="

                        mt-2

                        space-y-1

                        text-sm

                        text-muted-foreground

                        list-disc

                        ml-5

                    "
          >
            <li>Use the sample template.</li>

            <li>Do not rename column headers.</li>

            <li>Membership plan must already exist.</li>

            <li>Save the file as .xlsx.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
