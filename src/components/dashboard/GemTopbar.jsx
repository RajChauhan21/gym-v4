import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Moon, Sun } from "lucide-react"
import { useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar" // Import the trigger

export default function GemTopbar({ setDark, dark }) {
  
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <div className="w-full flex justify-between items-center p-4 border-b bg-white dark:bg-black transition-colors">
      
      <div className="flex items-center gap-3">
        {/* Shadcn's built-in trigger - handles opening/closing automatically */}
        <SidebarTrigger className="dark:text-white" />

        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-2 w-40 md:w-80 dark:bg-black dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button 
          onClick={() => setDark(!dark)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun className="text-white"/> : <Moon className="text-gray-800" />}
        </button>

        <Avatar>
          <AvatarFallback className="dark:bg-gray-800 dark:text-white">RC</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
