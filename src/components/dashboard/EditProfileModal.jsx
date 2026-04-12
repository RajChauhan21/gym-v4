import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { allowOnlyText, allowOnlyNumbers } from "../../lib/inputValidator";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { saveGymDetails } from "../../apis/backend_apis";
import { Loader2 } from "lucide-react";

export default function EditProfileModal({
  open,
  setOpen,
  profile,
  setProfile,
}) {
  const [form, setForm] = useState(profile);
  const [owner, setOwner] = useState({
    ownerId: null,
    gymId: null,
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    googleMapUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(profile);
      setErrors({});
    }
  }, [open, profile]);

  useEffect(() => {
    const savedData = localStorage.getItem("userProfile");

    if (savedData) {
      const user = JSON.parse(savedData);
      console.log("Loaded user data from localStorage:", user);
      // Map the localStorage object to your form state
      setOwner({
        ownerId: user.ownerId, // 17
        gymId: user.gymId, // null
        name: user.gymName || "", // Mapping gymName to 'name'
        ownerName: user.owner || "", // "Vikram Diwan"
        email: user.email || "", // "vikram12345@gmail.com"
        phone: user.phone || "", // null -> ""
        website: user.website || "", // ""
        location: user.address || "", // ""
        googleMapUrl: user.googleMapUrl || "", // ""
        gymLogo: user.ownerImage,
        ownerLogo: user.gymImage,
      });
    }
  }, []);

  const validate = () => {
    let newErrors = {};

    // Text-only validation (Allows letters, spaces, and basic punctuation like hyphens/apostrophes)
    const textRegex = /^[a-zA-Z\s'.-]+$/;

    if (!form.gymName.trim()) {
      newErrors.gymName = "Gym name required";
    } else if (!textRegex.test(form.gymName)) {
      newErrors.gymName = "Gym name should only contain letters";
    }

    if (!form.owner.trim()) {
      newErrors.owner = "Owner name required";
    } else if (!textRegex.test(form.owner)) {
      newErrors.owner = "Owner name should only contain letters";
    }

    // Address: Allows letters, numbers, spaces, and common separators (/, #, -)
    const addressRegex = /^[a-zA-Z0-9\s,.'#/-]+$/;
    if (!form.address.trim()) {
      newErrors.address = "Location required";
    } else if (!addressRegex.test(form.address)) {
      newErrors.address = "Invalid characters found in location";
    }

    // Phone Validation
    if (!form.phone || !form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // react-phone-number-input values usually start with '+'
      // A valid E.164 number is typically between 10 and 15 digits (including country code)
      const cleanPhone = form.phone.replace(/\D/g, ""); // Remove everything except digits

      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        newErrors.phone =
          "Enter a valid international phone number (e.g., +91...)";
      }
    }

    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // Website Validation (Supports http, https, or starting with www)
    if (form.website.trim()) {
      const urlPattern =
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/.*)?$/;
      if (!urlPattern.test(form.website.trim())) {
        newErrors.website = "Enter a valid website (e.g., www.gym.com)";
      }
    }

    return newErrors;
  };

  const handleSave = async () => {
    setLoading(true);
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setLoading(false);
      return;
    }

    const payload = {
      gymId: profile.gymId, // mapping gymId
      ownerId: profile.ownerId, // mapping ownerId
      gymName: form.gymName, // mapping from 'name'
      ownerName: form.owner, // mapping from 'ownerName'
      website: form.website, // mapping from 'website'
      googleMapUrl: form.googleMapUrl, // mapping from 'googleMapUrl'
      number: form.phone,
      location: form.address,
      email: form.email,
    };
    const response = await saveGymDetails(payload);
    try {
      console.log("Save Gym Response:", response);
      if (response.status === 202) {
        console.log("form data " + form);
        const payload = {
          ...profile,
          ownerId: response?.data.ownerId,
          gymId: response?.data.gymId,
          gymName: response?.data.gymName,
          owner: response?.data.ownerName, // mapping ownerName to owner
          email: response?.data.email,
          phone: response?.data.number, // mapping number back to phone
          address: response?.data.location, // mapping location back to address
          website: response?.data.website,
          googleMapUrl: response?.data.googleMapUrl,
        };

        console.log("Updated profile payload:", payload);
        setProfile(payload);
        localStorage.setItem("userProfile", JSON.stringify(payload));
        toast.success("Profile details updated successfully.");
        setOpen(false);
      } else {
        toast.error(
          response?.data?.message ||
            "Failed to update profile details. Please try again.",
        );
      }
    } catch (error) {
      toast.error(
        response?.data?.message ||
          "Failed to update profile details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[90%] max-w-md h-[520px] flex flex-col rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {/* Gym Name */}
          <div>
            <Label className="mb-3">Gym Name</Label>
            <Input
              disabled={loading}
              value={form.gymName}
              onChange={(e) => setForm({ ...form, gymName: e.target.value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.gymName}
            </p>
          </div>

          {/* Owner */}
          <div>
            <Label className="mb-3">Owner</Label>
            <Input
              disabled={loading}
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">{errors.owner}</p>
          </div>

          {/* Phone */}
          <div>
            <Label className="mb-3">Phone</Label>
            {/* <Input
              type="number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            /> */}
            <PhoneNumberInput
              disabled={loading}
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">{errors.phone}</p>
          </div>

          {/* Address */}
          <div>
            <Label className="mb-3">Address/Location</Label>
            <Input
              disabled={loading}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">
              {errors.address}
            </p>
          </div>

          {/* Email */}
          <div>
            <Label className="mb-3">Email</Label>
            <Input
              disabled={loading}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <p className="text-red-500 text-xs min-h-[16px]">{errors.email}</p>
          </div>

          {/* Website */}
          <div>
            <Label className="mb-3">Website (Optional)</Label>
            <Input
              disabled={loading}
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
              disabled={loading}
              placeholder="Paste Google Maps link here"
              value={form.googleMapUrl}
              onChange={(e) =>
                setForm({ ...form, googleMapUrl: e.target.value })
              }
            />
          </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="pt-3">
          <Button onClick={handleSave} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
