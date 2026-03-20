import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"

export default function Topbar() {
  // const [dark, setDark] = useState(false)
  const { dark, toggleDark } = useTheme();



  return (
    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-black dark:border-gray-700">

      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <SidebarTrigger className="md:hidden" />

        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      {/* Right side */}
      <Button variant="ghost" size="icon" onClick={toggleDark}>
        {dark ? (
          <Sun className="w-5 h-5 text-white" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>
    </header>
  )
}