import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react"; // Optional icon
import {
  getMembersCount,
  getMembersOnMemberShipId,
} from "../apis/backend_apis";
import { useEffect, useState } from "react";
import { useProfile } from "../contexts/ProfileContext";

export function DeleteSourceModal({
  open,
  onOpenChange,
  onConfirm,
  sourceName,
  sourceId,
}) {
  const { profile } = useProfile();
  const [membersCount, setMembersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const findMembersCountOnSourceId = async (sourceId) => {
    setIsLoading(true);
    try {
      const response = await getMembersCount(sourceId);
      if (response.status === 202) {
        setMembersCount(response.data);
      }
    } catch (error) {
      setMembersCount(0);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    findMembersCountOnSourceId(sourceId);
  }, [sourceId]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {/* 1. Show loader condition first */}
            {isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground animate-pulse">
                Checking active member dependencies...
              </span>
            ) : membersCount > 0 ? (
              <>
                There {membersCount === 1 ? "is" : "are"}{" "}
                <span className="font-bold text-foreground">
                  {membersCount}
                </span>{" "}
                associated {membersCount === 1 ? "member" : "members"} with this
                source. Deleting this source may impact member records and
                source analytics data. This action cannot be undone.
              </>
            ) : (
              <>
                This will permanently delete{" "}
                <span className="font-bold text-foreground">"{sourceName}"</span>.
                This action cannot be undone and will remove all associated
                data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading} // 2. Disable button while loading to prevent race conditions
            className="bg-red-600 hover:bg-red-700"
          >
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
