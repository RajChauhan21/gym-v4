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
    if (!form.name || !/^[A-Za-z\s]+$/.test(form.name))
      newErrors.name = "Only letters allowed";
    if (!form.validity || isNaN(form.validity))
      newErrors.validity = "Enter a valid number";
    if (!form.price || isNaN(form.price))
      newErrors.price = "Enter a valid amount";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const plan = {
        id: editPlan?.id ?? null,
        name: form.name,
        validity: form.validity,
        price: form.price,
      };

      const response = await addPlan(plan);
      if (response.status === 202) {
        console.log(response);
        toast.success(
          editPlan ? "Plan updated succeessfully" : "Plan added successfully",
        );
        fetchPlans();
        setEditPlan(null);
      } else if (response.status === 404) {
        toast.error(
          response.data.message ||
            "Plan not found. Please select a valid plan.",
        );
      }
    } catch (error) {
      toast.error("Error saving plan");
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
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="mb-4 dark:bg-white dark:text-black"
        >
          {"+ Add Plan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90%] max-w-md rounded-2xl p-0 shadow-xl flex flex-col h-[480px]">
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
