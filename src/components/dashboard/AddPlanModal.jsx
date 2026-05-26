import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { allowOnlyText, allowOnlyNumbers } from "../../lib/inputValidator";
import { addPlan } from "../../apis/backend_apis";
import { useGymStore } from "../../store/gymStore";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useProfile } from "../../contexts/ProfileContext";
export default function AddPlanModal({
  open,
  setOpen,
  plans,
  setPlans,
  editPlan,
  setEditPlan,
}) {
  const [form, setForm] = useState({ name: "", validity: "", price: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fetchPlans = useGymStore((state) => state.fetchPlans);
  const profile = useProfile();

  useEffect(() => {
    fetchPlans(profile.profile.gymId);
    // Empty array [] ensures this runs exactly once on mount
  }, [profile.profile.gymId]);

  useEffect(() => {
    if (open) {
      if (editPlan) {
        setForm({
          name: editPlan.name,
          validity: editPlan.validity,
          price: editPlan.price,
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [open, editPlan]);

  const validate = () => {
    const newErrors = {};
    if (!form.name || !/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = "Only letters allowed";
    } else if (form.name.trim().length > 10) {
      newErrors.name = "Maximum 10 letters allowed";
    }
    if (!form.validity || isNaN(form.validity))
      newErrors.validity = "Enter a valid number";
    if (!form.price || isNaN(form.price))
      newErrors.price = "Enter a valid amount";
    setErrors(newErrors);
    setLoading(false);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (profile.profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    if (!validate()) return;

    try {
      const plan = {
        id: editPlan?.id ?? null,
        gymId: profile.profile.gymId,
        name: form.name,
        validity: form.validity,
        price: form.price,
        ownerId: profile.profile.ownerId,
      };

      const response = await addPlan(plan);
      if (response.status === 202) {
        console.log(response);
        toast.success(
          editPlan ? "Plan updated succeessfully" : "Plan added successfully",
        );
        fetchPlans(profile.profile.gymId);
        setEditPlan(null);
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message.includes("404")
        ) {
          toast.error("Please setup your gym profile before adding plans.");
        } else if(response.data.message == "Plan already exists") {
          toast.error(
           response.data.message,
          );
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching plans. Please try again later.",
      );
    } finally {
      setLoading(false);
      setOpen(false);
      resetForm();
    }
  };

  const initialFormState = {
    name: "",
    validity: "",
    price: "",
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  const handleClose = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditPlan(null); // Crucial: Reset to "Add Mode"
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Button
        onClick={() => {
          // CRITICAL: Double check if your API returns 'No Active Plan' or 'No Active plan'
          if (profile.profile.planName === "No Active Plan") {
            toast.error(
              "You need an active plan to add plans. Please subscribe to a plan first.",
            );
          } else {
            setOpen(true); // This safely updates modalOpen in the parent
          }
        }}
        className="mb-4 dark:bg-white dark:text-black"
      >
        {"+ Add Plan"}
      </Button>
      <DialogContent
        className="w-[90%] max-w-md rounded-2xl p-0 shadow-xl flex flex-col h-[480px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{editPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
          <DialogPrimitive.Close
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
            onClick={handleClose} // Also clear form if they just close the modal
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1">
            <Label className="mb-1">Plan Name</Label>
            <Input
              type="text"
              disabled={loading}
              placeholder="Gold / Silver / Platinum"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={allowOnlyText}
            />
            <div className="min-h-[20px]">
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="mb-1">validity (months)</Label>
            <Input
              disabled={loading}
              type="number"
              placeholder="1 / 3 / 6 / 12"
              value={form.validity}
              onChange={(e) => setForm({ ...form, validity: e.target.value })}
              onKeyDown={allowOnlyNumbers}
            />
            <div className="min-h-[20px]">
              {errors.validity && (
                <p className="text-red-500 text-sm">{errors.validity}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="mb-1">Price</Label>
            <Input
              disabled={loading}
              type="number"
              placeholder="Enter price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              onKeyDown={allowOnlyNumbers}
            />
            <div className="min-h-[20px]">
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Saving..." : "Save Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
