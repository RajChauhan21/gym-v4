import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import Loader from "@/components/ui/Loader";
import AddPlanModal from "@/components/dashboard/AddPlanModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Package, Clock, Edit3, Trash2 } from "lucide-react";
import { DeleteModal } from "./DeleteModal";
import { useGymStore } from "../store/gymStore";
import {
  deletePlanById,
  getAllPlans,
  getMembersOnMemberShipId,
} from "../apis/backend_apis";
import { useProfile } from "../contexts/ProfileContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Plans() {
  const plans = useGymStore((state) => state.plans);
  const setPlans = useGymStore((state) => state.setPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const profile = useProfile();
  const fetchPlans = useGymStore((state) => state.fetchPlans);
  const [loading, setLoading] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [planToDelete, setPlanToDelete] = useState(null);

  useEffect(() => {
    // if (!profile?.gymId) return;

    const fetchAndPopulate = async () => {
      try {
        setLoading(true);
        console.log("Fetching plans for gymId:", profile.profile.gymId);

        const response = await getAllPlans(profile.profile.gymId);
        if (response.status === 202) {
          if (response.data) {
            setPlans(response.data);
          } else {
            setPlans([]);
          }
        } else if (response.status === 404) {
          if (
            response.data &&
            response.data.message &&
            response.data.message !== "100"
          ) {
            toast.error(
              "Something went wrong while fetching plans. Please try again",
            );
            // Member already exists with the name
          }
        } else if (response.status === 429) {
          // toast.error(
          //   "You are performing actions too quickly. Please wait a few seconds and try again.",
          // );
        }

        console.log("Fetched plans data:", response.data);
        console.log(plans);
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndPopulate();
  }, [profile]);

  const findMembersCountOnMemberShipId = async (memberShipId) => {
    try {
      const response = await getMembersOnMemberShipId(memberShipId);
      if (response.status === 202) {
        setMembersCount(response.data);
      }
    } catch (error) {
    } finally {
    }
  };

  // Delete confirmation
  const confirmDelete = async (idx) => {
    setLoading(true);
    if (profile.profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    const id = plans[idx].id;
    try {
      const response = await deletePlanById(id);
      if (response.status === 202) {
        console.log(response);
        toast.success("Plan deleted successfully");
        fetchPlans(profile.profile.gymId);
      } else if (response.status === 404) {
        toast.error(
          "Someting went wrong while deleting the plan. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(
        "Someting went wrong while deleting the plan. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
    // const newPlans = plans.filter((_, i) => i !== idx);
    // setPlans(newPlans);
    // toast.success(`"${planName}" plan deleted successfully`);
  };

  // Edit button
  const handleEdit = (plan, idx) => {
    if (profile.profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    setEditPlan({ ...plan, index: idx });
    setModalOpen(true);
  };

  return (
    <div className="p-4 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Membership Plans
          </h2>
          <p className="text-sm text-muted-foreground italic md:not-italic">
            Manage your gym's subscription tiers and pricing.
          </p>
        </div>
        <AddPlanModal
          open={modalOpen}
          setOpen={setModalOpen}
          plans={plans}
          setPlans={setPlans}
          editPlan={editPlan}
          setEditPlan={setEditPlan}
        />
      </div>

      {/* --- VISUAL PLAN CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // 2. Render 3 Skeleton Cards while loading
          Array.from({ length: 3 }).map((_, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden border-2 p-6 space-y-4"
            >
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="pt-4 flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </div>
            </Card>
          ))
        ) : (
          // 3. Render actual cards when loading is complete
          <>
            {plans &&
              plans.map((plan, idx) => (
                <Card
                  key={idx}
                  className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group"
                >
                  <div className="h-2 w-full bg-black dark:bg-white md:bg-white dark:md:bg-black transition-colors duration-200 md:hover:bg-black md:dark:hover:bg-white md:group-hover:bg-black md:dark:group-hover:bg-white" />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <Package className="size-5 text-black dark:text-white" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight">
                        ₹{plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / total
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="size-4 text-primary" />
                      <span>
                        Valid for {plan.validity}{" "}
                        {plan.validity > 1 ? "months" : "month"}
                      </span>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1 rounded-xl h-9 text-xs"
                        onClick={() => handleEdit(plan, idx)}
                      >
                        <Edit3 className="size-3 mr-2" /> Edit
                      </Button>
                      {/* <DeleteModal
                        itemName={plan.name}
                        onConfirm={() => confirmDelete(idx)}
                        memberShipId={plan.id}
                      /> */}
                      <button
                        onClick={() => setPlanToDelete({ plan, idx })}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {planToDelete && (
              <DeleteModal
                open={!!planToDelete}
                onOpenChange={(isOpen) => !isOpen && setPlanToDelete(null)}
                itemName={planToDelete.plan.name}
                memberShipId={planToDelete.plan.id}
                onConfirm={() => {
                  confirmDelete(planToDelete.idx);
                  setPlanToDelete(null); // Clear state after deleting
                }}
              />
            )}

            {/* Empty State / Add New Placeholder */}
            <div
              onClick={() => {
                if (profile?.profile?.planName === "No Active Plan") {
                  toast.error(
                    "You need an active plan to add plans. Please subscribe to a plan first.",
                  );
                } else {
                  setEditPlan(null);
                  setModalOpen(true);
                }
              }}
              className="border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:bg-muted/50 cursor-pointer min-h-[200px] transition-all"
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-sm font-medium">Create New Plan</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
