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
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { allowOnlyText, allowOnlyNumbers } from "../../lib/inputValidator";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { saveGymDetails, saveOwnerDetails } from "../../apis/backend_apis";
import { Loader2, X } from "lucide-react";

export default function EditProfileModal({
  open,
  setOpen,
  profile,
  setProfile,
  editType,
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

  const handleFieldValidation = (field, value) => {
    const error = validateField(field, value);

    setErrors((prev) => {
      const updated = { ...prev };

      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }

      return updated;
    });
  };

  const validate = () => {
    const errors = {};

    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);

      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  const validateField = (name, value) => {
    const textRegex = /^[a-zA-Z\s'.-]+$/;
    const addressRegex = /^[a-zA-Z0-9\s,.'#/-]+$/;
    const phoneRegex = /^(?:\+91|91|0)?\s*[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/.*)?$/;

    switch (name) {
      case "gymName":
        if (editType === "gym" && !value.trim()) return "Gym name required";
        if (editType === "gym" && !textRegex.test(value))
          return "Gym name should only contain letters";
        if (editType === "gym" && value.trim().length > 20)
          return "Maximum 20 letters allowed";
        return "";

      case "address":
        if (editType === "gym" && !value.trim()) return "Address required";
        if (editType === "gym" && !addressRegex.test(value))
          return "Invalid characters found in address";
        if (editType === "gym" && value.trim().length > 20)
          return "Maximum 20 letters allowed";
        return "";

      // case "website":
      //   if (editType === "gym" && value.trim().length > 20)
      //     return "Maximum 20 letters allowed";
      //   return "";

      case "owner":
        if (editType === "owner" && !value.trim()) return "Owner name required";
        if (editType === "owner" && !textRegex.test(value))
          return "Owner name should only contain letters";
        if (editType === "owner" && value.trim().length > 20)
          return "Maximum 20 letters allowed";
        return "";

      case "phone":
        if (editType === "owner" && !value) return "Phone number is required";
        if (
          editType === "owner" &&
          !phoneRegex.test(value.replace(/[\s()-]/g, ""))
        )
          return "Enter a valid 10 digit Indian phone number";
        return "";

      case "email":
        if (editType === "owner" && !value.trim()) return "Email required";
        if (editType === "owner" && !emailRegex.test(value))
          return "Invalid email format";
        return "";

      default:
        return "";
    }
  };

  const handleGymSave = async () => {
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
      // ownerName: form.owner, // mapping from 'ownerName'
      website: form.website, // mapping from 'website'
      googleMapUrl: form.googleMapUrl, // mapping from 'googleMapUrl'
      // number: form.phone,
      location: form.address,
      // email: form.email,
    };
    const response = await saveGymDetails(payload);
    try {
      console.log("Save Gym Response:", response);
      if (response.status === 202) {
        console.log("form data " + form);
        const payload = {
          ...profile,
          // ownerId: response?.data.ownerId,
          gymId: response?.data.gymId,
          gymName: response?.data.gymName,
          // owner: response?.data.ownerName, // mapping ownerName to owner
          // email: response?.data.email,
          // phone: response?.data.number, // mapping number back to phone
          address: response?.data.location, // mapping location back to address
          website: response?.data.website,
          googleMapUrl: response?.data.googleMapUrl,
        };

        console.log("Updated gym profile payload:", payload);
        setProfile(payload);
        localStorage.setItem("userProfile", JSON.stringify(payload));
        toast.success("Gym profile details updated successfully.");
        setOpen(false);
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message === "100"
        ) {
          toast.error(
            "You need an active plan to use this functionality. Please subscribe to a plan first.",
          );
          // Member already exists with the name
        } else {
          toast.error(
            "Failed to update gym profile details. Please try again.",
          );
        }
      } else if (response.status === 429) {
        toast.error(
          "You're performing actions too quickly. Please wait a few seconds.",
        );
      }
    } catch (error) {
      toast.error("Failed to update gym profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSave = async () => {
    setLoading(true);
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setLoading(false);
      return;
    }

    const payload = {
      // gymId: profile.gymId, // mapping gymId
      ownerId: profile.ownerId, // mapping ownerId
      // gymName: form.gymName, // mapping from 'name'
      ownerName: form.owner, // mapping from 'ownerName'
      // website: form.website, // mapping from 'website'
      // googleMapUrl: form.googleMapUrl, // mapping from 'googleMapUrl'
      phone: form.phone,
      // location: form.address,
      email: form.email,
    };
    const response = await saveOwnerDetails(payload);
    try {
      console.log("Save Owner Response:", response);
      if (response.status === 202) {
        console.log("form data " + form);
        const payload = {
          ...profile,
          ownerId: response?.data.ownerId,
          // gymId: response?.data.gymId,
          // gymName: response?.data.gymName,
          owner: response?.data.ownerName, // mapping ownerName to owner
          email: response?.data.email,
          phone: response?.data.phone, // mapping number back to phone
          // address: response?.data.location, // mapping location back to address
          // website: response?.data.website,
          // googleMapUrl: response?.data.googleMapUrl,
        };

        console.log("Updated profile payload:", payload);
        setProfile(payload);
        localStorage.setItem("userProfile", JSON.stringify(payload));
        toast.success("Owner details updated successfully.");
        setOpen(false);
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message === "100"
        ) {
          toast.error(
            "You need an active plan to use this functionality. Please subscribe to a plan first.",
          );
          // Member already exists with the name
        } else {
          toast.error("Failed to update owner details. Please try again.");
        }
      } else if (response.status === 429) {
        toast.error(
          "You're performing actions too quickly. Please wait a few seconds.",
        );
      }
    } catch (error) {
      toast.error("Failed to update owner details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={`w-[90%] max-w-md flex flex-col rounded-2xl ${
          editType === "gym" ? "h-[450px]" : "h-[370px]"
        }`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editType === "gym" ? "Edit Gym Profile" : "Edit Owner Profile"}
          </DialogTitle>
          <DialogPrimitive.Close asChild>
            <button
              disabled={loading}
              type="button"
              className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
              onClick={setOpen}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* FORM */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {/* Gym Name */}
          {editType == "gym" && (
            <div>
              <Label className="mb-3">
                Gym Name<span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={loading}
                value={form.gymName}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    gymName: value,
                  }));

                  handleFieldValidation("gymName", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.gymName}
              </p>
            </div>
          )}

          {/* Owner */}
          {editType == "owner" && (
            <div>
              <Label className="mb-3">
                Owner<span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={loading}
                value={form.owner}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    owner: value,
                  }));

                  handleFieldValidation("owner", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.owner}
              </p>
            </div>
          )}

          {/* Phone */}
          {editType == "owner" && (
            <div>
              <Label className="mb-3">
                Phone<span className="text-red-500">*</span>
              </Label>
              <PhoneNumberInput
                disabled={loading}
                value={form.phone}
                onChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    phone: value,
                  }));

                  handleFieldValidation("phone", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.phone}
              </p>
            </div>
          )}

          {/* Address */}
          {editType == "gym" && (
            <div>
              <Label className="mb-3">
                Address/Location<span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={loading}
                value={form.address}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    address: value,
                  }));

                  handleFieldValidation("address", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.address}
              </p>
            </div>
          )}

          {/* Email */}
          {editType == "owner" && (
            <div>
              <Label className="mb-3">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                disabled={loading}
                type="email"
                value={form.email}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    email: value,
                  }));

                  handleFieldValidation("email", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.email}
              </p>
            </div>
          )}

          {/* Website */}
          {editType == "gym" && (
            <div>
              <Label className="mb-3">Website</Label>
              <Input
                disabled={loading}
                placeholder="www.yourgym.com"
                value={form.website}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    website: value,
                  }));

                  // handleFieldValidation("website", value);
                }}
              />
              <p className="text-red-500 text-xs min-h-[16px]">
                {errors.website}
              </p>
            </div>
          )}

          {/* Google Maps Link */}
          {editType == "gym" && (
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
          )}
        </div>

        {/* FOOTER BUTTON */}
        <div className="pt-3">
          <Button
            onClick={editType == "gym" ? handleGymSave : handleOwnerSave}
            className="w-full"
          >
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
