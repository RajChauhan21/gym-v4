import { Spinner } from "@/components/ui/spinner"

export default function CenteredLoader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Spinner className="size-8" />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {text}
      </p>
    </div>
  )
}