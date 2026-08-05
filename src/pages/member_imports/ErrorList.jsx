import { useMemo, useState } from "react";

import { Search, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import ErrorRow from "./ErrorRow";

export default function ErrorList({ errors = [] }) {
  const [search, setSearch] = useState("");

  const [showOnlyFailed, setShowOnlyFailed] = useState(false);

  const filteredErrors = useMemo(() => {
    let data = [...errors];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter((error) => {
        if (error.rowNumber.toString().includes(keyword)) {
          return true;
        }

        return error.errors.some((msg) => msg.toLowerCase().includes(keyword));
      });
    }

    if (showOnlyFailed) {
      data = data.filter((row) => row.errors.length > 0);
    }

    return data;
  }, [errors, search, showOnlyFailed]);

  return (
    <div className="space-y-5">
      {/* Header */}

      <div
        className="
                    flex
                    flex-col
                    gap-3

                    lg:flex-row

                    lg:items-center

                    lg:justify-between
                "
      >
        <div>
          <h2 className="text-lg font-semibold">Validation Errors</h2>

          <p className="text-sm text-muted-foreground">
            Review every failed row before importing again.
          </p>
        </div>

        <Badge variant="secondary" className="w-fit">
          {filteredErrors.length} Row(s)
        </Badge>
      </div>

      {/* Search */}

      <div
        className="
                    flex
                    flex-col
                    gap-3

                    sm:flex-row
                "
      >
        <div className="relative flex-1">
          <Search
            className="
                            absolute

                            left-3

                            top-1/2

                            h-4

                            w-4

                            -translate-y-1/2

                            text-muted-foreground
                        "
          />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            placeholder="Search row or error..."
          />
        </div>

        <Button
          variant={showOnlyFailed ? "default" : "outline"}
          onClick={() => setShowOnlyFailed(!showOnlyFailed)}
        >
          Failed Only
        </Button>
      </div>

      {/* List */}

      <ScrollArea
        className="
                    h-[420px]

                    rounded-xl

                    border
                "
      >
        {filteredErrors.length === 0 ? (
          <div
            className="
                                    flex

                                    h-[400px]

                                    flex-col

                                    items-center

                                    justify-center

                                    gap-3
                                "
          >
            {/* <img src="/empty.svg" alt="No Errors" className="h-24" /> */}
            <CheckCircle2 className="h-24 w-24 text-green-500" />

            <h3
              className="
                                        text-lg

                                        font-semibold
                                    "
            >
              No Errors Found
            </h3>

            <p
              className="
                                        text-sm

                                        text-muted-foreground
                                    "
            >
              Every imported member passed validation.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredErrors.map((error) => (
              <ErrorRow key={error.rowNumber} error={error} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
