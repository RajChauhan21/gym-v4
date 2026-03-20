import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {toast} from "sonner"
export default function EditProfileModal({
  open,
  setOpen,
  profile,
  setProfile,
}) {
  const [form, setForm] = useState(profile)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (open) {
      setForm(profile)
      setErrors({})
    }
  }, [open, profile])

  const validate = () => {
    let newErrors = {}

    if (!form.gymName.trim()) newErrors.gymName = "Gym name required"
    if (!form.owner.trim()) newErrors.owner = "Owner name required"

    if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Enter valid 10-digit phone"

    if (!form.address.trim()) newErrors.address = "Address required"

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (form.website.trim()) {
      // This regex checks for common patterns like www.google.com or https://google.com
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/;
      if (!urlPattern.test(form.website.trim())) {
        newErrors.website = "Enter a valid website (e.g., www.gym.com)";
      }
    }

    return newErrors
  }

  const handleSave = () => {
    setLoading(true);
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setProfile({...form})
    setOpen(false)
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile details updated successfully.");
      setOpen(false);
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90%] max-w-md h-[520px] flex flex-col rounded-2xl">

        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">

          {/* Gym Name */}
          <div>
            <Label className="mb-3">Gym Name</Label>
            <Input
              value={form.gymName}
              onChange={(e) =>
                setForm({ ...form, gymName: e.target.value })
              }
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.gymName}
            </p>
          </div>

          {/* Owner */}
          <div>
            <Label className="mb-3">Owner</Label>
            <Input
              value={form.owner}
              onChange={(e) =>
                setForm({ ...form, owner: e.target.value })
              }
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.owner}
            </p>
          </div>

          {/* Phone */}
          <div>
            <Label className="mb-3">Phone</Label>
            <Input
              type="number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.phone}
            </p>
          </div>

          {/* Address */}
          <div>
            <Label className="mb-3">Address</Label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.address}
            </p>
          </div>

          {/* Email */}
          <div>
            <Label className="mb-3">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.email}
            </p>
          </div>

          {/* Website */}
          <div>
            <Label className="mb-3">Website (Optional)</Label>
            <Input
              placeholder="www.yourgym.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.website}
            </p>
          </div>

          {/* Google Maps Link */}
          <div>
            <Label className="mb-3">Google Maps URL</Label>
            <Input
              placeholder="Paste Google Maps link here"
              value={form.mapLink}
              onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
            />
          </div>

        </div>

        {/* FOOTER BUTTON */}
        <div className="pt-3">
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}