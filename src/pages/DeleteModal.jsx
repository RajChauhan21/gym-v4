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
import { getMembersOnMemberShipId } from "../apis/backend_apis";
import { useEffect, useState } from "react";
import { useProfile } from "../contexts/ProfileContext";

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  memberShipId,
}) {
  const { profile } = useProfile();
  const [membersCount, setMembersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const findMembersCountOnMemberShipId = async (memberShipId) => {
    setIsLoading(true);
    try {
      const response = await getMembersOnMemberShipId(
        memberShipId,
        profile?.gymId,
        profile?.ownerId,
      );
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
    findMembersCountOnMemberShipId(memberShipId);
  }, [memberShipId]);

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
                {membersCount === 1 ? "There is " : "There are "}
                <span className="font-bold text-foreground">
                  {membersCount}
                </span>{" "}
                associated {membersCount === 1 ? "member" : "members"} with this
                membership/plan. Deleting this membership/plan may affect the
                hierarchy of the payments data and other records. This action
                cannot be undone.
              </>
            ) : (
              <>
                This will permanently delete{" "}
                <span className="font-bold text-foreground">"{itemName}"</span>.
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
