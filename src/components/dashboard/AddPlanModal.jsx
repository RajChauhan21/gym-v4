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
export default function AddPlanModal({
  open,
  setOpen,
  plans,
  setPlans,
  editPlan,
  setEditPlan,
}) {
  const [form, setForm] = useState({ name: "", duration: "", price: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editPlan) {
        setForm({
          name: editPlan.name,
          duration: editPlan.duration,
          price: editPlan.price,
        });
      } else {
        setForm({ name: "", duration: "", price: "" });
      }
      setErrors({});
    }
  }, [open, editPlan]);

  const validate = () => {
    const newErrors = {};
    if (!form.name || !/^[A-Za-z\s]+$/.test(form.name))
      newErrors.name = "Only letters allowed";
    if (!form.duration || isNaN(form.duration))
      newErrors.duration = "Enter a valid number";
    if (!form.price || isNaN(form.price))
      newErrors.price = "Enter a valid amount";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // 1. Check for Duplicate Name
    const isDuplicate = plans.some((p, idx) => {
      // If editing, ignore the current plan's index
      if (editPlan && idx === editPlan.index) return false;

      // Compare names (case-insensitive for better safety)
      return p.name.toLowerCase() === form.name.toLowerCase();
    });

    if (isDuplicate) {
      toast.error(`A plan named "${form.name}" already exists.`);
      return; // Stop the function here
    }

    setLoading(true);
    setTimeout(() => {
      if (editPlan) {
        const updatedPlans = [...plans];
        updatedPlans[editPlan.index] = form;
        setPlans(updatedPlans);
        toast.success("Plan updated successfully");
        setEditPlan(null);
      } else {
        setPlans([...plans, form]);
        toast.success("Plan added successfully");
      }
      setLoading(false);
      setOpen(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="mb-4 dark:bg-white dark:text-black"
        >
          {editPlan ? "Edit Plan" : "+ Add Plan"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90%] max-w-md rounded-2xl p-0 shadow-xl flex flex-col h-[480px]">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{editPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
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
            <Label className="mb-1">Duration (months)</Label>
            <Input
              disabled={loading}
              type="number"
              placeholder="1 / 3 / 6"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              onKeyDown={allowOnlyNumbers}
            />
            <div className="min-h-[20px]">
              {errors.duration && (
                <p className="text-red-500 text-sm">{errors.duration}</p>
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
