import { useState } from "react";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Hash,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";

export default function ErrorRow({ error }) {
  const [expanded, setExpanded] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyErrors = async () => {
    const text = error.errors.join("\n");

    await navigator.clipboard.writeText(text);

    setCopied(true);

    toast.success("Errors copied");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-background"
    >
      <div
        className="

                p-5

                hover:bg-muted/30

                transition-colors

            "
      >
        {/* TOP */}

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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="rounded-full">
                <Hash className="mr-1 h-3 w-3" />
                Row {error.rowNumber}
              </Badge>

              <Badge variant="outline">
                {error?.errors?.length || 0} Error
                {error?.errors?.length > 1 && "s"}
              </Badge>
            </div>

            <p
              className="

                            text-sm

                            text-muted-foreground

                        "
            >
             {error?.errors?.[0]}

            </p>
          </div>

          <div
            className="

                        flex

                        gap-2

                        w-full

                        md:w-auto

                    "
          >
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none"
              onClick={copyErrors}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}

              {copied ? "Copied" : "Copy"}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="flex-1 md:flex-none"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="mr-2 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-2 h-4 w-4" />
              )}

              {expanded ? "Hide" : "View"}
            </Button>
          </div>
        </div>

        {/* DETAILS */}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{
                opacity: 0,

                height: 0,
              }}
              animate={{
                opacity: 1,

                height: "auto",
              }}
              exit={{
                opacity: 0,

                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <Separator className="my-5" />

              <div className="space-y-3">
                {error.errors.map((message, index) => (
                  <div
                    key={index}
                    className="

                                                    flex

                                                    items-start

                                                    gap-3

                                                    rounded-xl

                                                    border

                                                    bg-red-50

                                                    dark:bg-red-950/20

                                                    p-3

                                                "
                  >
                    <AlertTriangle
                      className="

                                                        mt-0.5

                                                        h-5

                                                        w-5

                                                        shrink-0

                                                        text-red-600

                                                    "
                    />

                    <span
                      className="

                                                        text-sm

                                                    "
                    >
                      {message}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
