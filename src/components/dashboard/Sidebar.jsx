import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboardIcon,
  UsersIcon,
  CreditCardIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react"

const links = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboardIcon className="w-4 h-4" /> },
  { name: "Members", path: "/members", icon: <UsersIcon className="w-4 h-4" /> },
  { name: "Payments", path: "/payments", icon: <CreditCardIcon className="w-4 h-4" /> },
  { name: "Settings", path: "/settings", icon: <SettingsIcon className="w-4 h-4" /> },
]

export default function Sidebar({ open, setOpen, profile }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <MenuIcon className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-black">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700">
            <Avatar>
              <AvatarImage src={profile.logo} alt="Owner Logo" />
              <AvatarFallback>{profile.owner[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile.gymName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.owner}</p>
            </div>
          </div>

          {/* Scrollable Links */}
          <ScrollArea className="flex-1 px-2 py-4 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-pink-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {link.icon} {link.name}
              </NavLink>
            ))}
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={profile.logo} alt="Owner Logo" />
                    <AvatarFallback>{profile.owner[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left">{profile.owner}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOutIcon className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-72 h-screen bg-white dark:bg-black border-r dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700">
          <Avatar>
            <AvatarImage src={profile.logo} alt="Owner Logo" />
            <AvatarFallback>{profile.owner[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{profile.gymName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.owner}</p>
          </div>
        </div>

        {/* Scrollable Links */}
        <ScrollArea className="flex-1 px-2 py-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                }`
              }
            >
              {link.icon} {link.name}
            </NavLink>
          ))}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile.logo} alt="Owner Logo" />
                  <AvatarFallback>{profile.owner[0]}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left">{profile.owner}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>
                <LogOutIcon className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}