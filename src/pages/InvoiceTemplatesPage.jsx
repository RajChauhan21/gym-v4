import { useEffect, useMemo, useState } from "react";
import {
  Search,
  LayoutGrid,
  Sparkles,
  Star,
  BadgeCheck,
  Palette,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "../contexts/ProfileContext";

import TemplateCard from "./TemplateCard";
import PreviewDialog from "./PreviewDialog";
import { getAllTemplates, selectTemplate } from "../apis/backend_apis";
import { toast } from "sonner";

const templates = [
  {
    id: 1,
    name: "Modern Card",
    category: "Modern",
    featured: true,
    previewUrl: "invoice-premium",
    description: "Minimal receipt with elegant cards.",
  },
  {
    id: 2,
    name: "Executive Blue",
    category: "Corporate",
    featured: false,
    previewUrl: "invoice-luxury-executive",
    description: "Professional corporate invoice.",
  },
  {
    id: 3,
    name: "Soft Blue SaaS",
    category: "Premium",
    featured: false,
    previewUrl: "invoice-material-light",
    description: "Inspired by Stripe & Razorpay.",
  },
  {
    id: 4,
    name: "Elite Premium",
    category: "Premium",
    featured: true,
    previewUrl: "invoice-fitness-green",
    description: "Our flagship premium template.",
  },
  {
    id: 5,
    name: "Lightweight Minimal",
    category: "Premium",
    featured: true,
    previewUrl: "invoice-soft-blue-saas",
    description: "Our flagship premium template.",
  },
  {
    id: 6,
    name: "Wild Template",
    category: "Premium",
    featured: true,
    previewUrl: "invoice-corporate-business",
    description: "Our flagship premium template.",
  },
  {
    id: 7,
    name: "Soft Business",
    category: "Premium",
    featured: true,
    previewUrl: "invoice-apple-minimal",
    description: "Our flagship premium template.",
  },
  {
    id: 8,
    name: "Soft Business",
    category: "Premium",
    featured: true,
    previewUrl: "invoice-modern-card",
    description: "Our flagship premium template.",
  },
  {
    id: 9,
    name: "Light Magic",
    category: "Luxury",
    featured: true,
    previewUrl: "invoice-10-paper-fold-ticket-light",
    description: "Our flagship premium template.",
  },
  {
    id: 10,
    name: "Paper light template",
    category: "Luxury",
    featured: true,
    previewUrl: "invoice-03-iron-chalk-light",
    description: "Our flagship premium template.",
  },
];

export default function InvoiceTemplatesPage() {
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(4);

  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [templates, setTemplates] = useState([]);

  const { profile } = useProfile();

  const categories = ["All", "Modern", "Corporate", "Premium", "Luxury"];

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        category === "All" || template.category === category;

      const matchesSearch = template.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category, templates]);

  const chooseTemplate = async (id) => {
    setLoading(true);
    try {
      const response = await selectTemplate(profile?.ownerId, id);
      if (response.status === 202 || response.data.statusCodeValue === 200) {
        if (response.data == "success") {
          toast.success("Template selected successfully.");
        }
      } else if (response.status === 404) {
        // toast.error(
        //   "Something went wrong while fetching plans. Please try again later.",
        // );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error("An error occurred while selecting the template.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTemplates = async () => {
    if (!profile?.ownerId) {
      console.log("Skipping API call: profile.ownerId is not loaded yet.");
      return;
    }
    setLoading(true);
    try {
      const response = await getAllTemplates(profile?.ownerId);
      if (response.status === 202) {
        setTemplates(response.data);
      } else if (response.status === 404) {
      } else if (response.status === 429) {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filteredTemplates;
  }, [templates]);

  useEffect(() => {
    fetchAllTemplates();
  }, [profile?.ownerId]);

  return (
    <div className="min-h-screen bg-white/90 dark:bg-black rounded-2xl">
      {/* Header */}

      <div className="sticky top-0 z-30 border-b bg-white/90 dark:bg-black border-sm rounded-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-4 sm:py-6">
          <div className=" flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Invoice Templates
              </h1>

              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Choose how payment receipts look for your members.
              </p>
            </div>

            {/* <Button className="w-full sm:w-auto">Save Changes</Button> */}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                placeholder="Search templates..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 sm:py-8">
        {/* Active Template */}

        <div className="rounded-xl border bg-white p-6 shadow-sm bg-white dark:bg-black">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
            <div>
              <Badge className="mb-3">Currently Active</Badge>

              <h2 className="text-xl font-semibold">Elite Premium</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Every receipt generated will use this template.
              </p>
            </div>

            <Badge variant="secondary" className="self-start sm:self-auto">
              <BadgeCheck className="mr-2 h-4 w-4" />
              Active
            </Badge>
          </div>
        </div>

        <Separator className="my-10" />

        {/* <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {categories.map((cat) => (
              <Button
                className="shrink-0"
                key={cat}
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea> */}

        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-3 pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                className="shrink-0"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div className="mt-10">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />

            <h2 className="text-xl font-semibold">Featured Templates</h2>
          </div>

          {/* <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  active={template.id === selectedTemplate}
                  onPreview={() => setPreviewTemplate(template)}
                  onSelect={() => chooseTemplate(template.id)}
                  loading={loading}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No templates found matching your search.
              </div>
            )}
          </div> */}

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {loading ? (
              /* 1. SHOW SPINNING LOADER WHEN API IS FETCHING */
              <div className="col-span-full flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm">Loading templates...</span>
              </div>
            ) : filteredTemplates.length > 0 ? (
              /* 2. SHOW TEMPLATES WHEN DATA EXISTS */
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  active={template.id === selectedTemplate}
                  onPreview={() => setPreviewTemplate(template)}
                  onSelect={() => chooseTemplate(template.id)}
                  loading={loading}
                />
              ))
            ) : (
              /* 3. SHOW FALLBACK ONLY WHEN NOT LOADING AND ARRAY IS EMPTY */
              <div className="col-span-full text-center py-8 text-gray-500">
                No templates found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <PreviewDialog
        open={!!previewTemplate}
        template={previewTemplate}
        activeId={selectedTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTemplate(null);
          }
        }}
        onSelect={(template) => {
          setSelectedTemplate(template.id);
          chooseTemplate(template.id);
          setPreviewTemplate(null);
        }}
      /> */}

      <PreviewDialog
        open={!!previewTemplate}
        template={previewTemplate}
        activeId={selectedTemplate}
        loading={loading} // 1. Pass the loading state down to the child
        onOpenChange={(open) => {
          if (!open && !loading) {
            // 2. Prevent closing the dialog while saving
            setPreviewTemplate(null);
          }
        }}
        onSelect={async (template) => {
          // 3. Keep the dialog open, run the API call first
          setSelectedTemplate(template.id);
          await chooseTemplate(template.id); // Ensure chooseTemplate is awaited if needed, or let finally handle it

          // 4. Only close the modal AFTER a successful operation
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
}
