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
import { useGymStore } from "../store/gymStore"

export default function Plans() {
  const plans = useGymStore((state) => state.plans);
  const setPlans = useGymStore((state) => state.setPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  // Delete confirmation
  const confirmDelete = (idx) => {
    const planName = plans[idx].name;
    const newPlans = plans.filter((_, i) => i !== idx);
    setPlans(newPlans);
    toast.success(`"${planName}" plan deleted successfully`);
  };

  // Edit button
  const handleEdit = (plan, idx) => {
    setEditPlan({ ...plan, index: idx });
    setModalOpen(true);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <Loader text="Loading Plans...." />;
  }

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

      {/* --- 1. VISUAL PLAN CARDS (Fills Mobile Space) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className="relative overflow-hidden border-2 hover:border-primary/50 transition-all group"
          >
            {/* Design Element: Top Accent Bar */}
            <div className="h-2 w-full bg-black dark:bg-white md:bg-white dark:md:bg-black transition-colors duration-200 md:hover:bg-black md:dark:hover:bg-white md:group-hover:bg-black md:dark:group-hover:bg-white" />

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <Package className="size-5 text-muted-foreground opacity-20" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  ₹{plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ total</span>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="size-4 text-primary" />
                <span>
                  Valid for {plan.duration}{" "}
                  {plan.duration > 1 ? "months" : "month"}
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
                {/* <Button variant="destructive" className="flex-1 rounded-xl h-9 text-xs" onClick={() => handleDelete(idx)}>
                  <Trash2 className="size-3 mr-2" /> Delete
                </Button> */}
                <DeleteModal
                  itemName={plan.name}
                  onConfirm={() => confirmDelete(idx)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State / Add New Placeholder */}
        <div
          onClick={() => {
            setEditPlan(null);
            setModalOpen(true);
          }}
          className="border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:bg-muted/50 cursor-pointer min-h-[200px] transition-all"
        >
          <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2">
            <span className="text-2xl">+</span>
          </div>
          <p className="text-sm font-medium">Create New Plan</p>
        </div>
      </div>
    </div>
  );
}
