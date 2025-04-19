import Link from "next/link"
import {
  Home,
  Milk,
  Wheat,
  Stethoscope,
  BarChart2,
  Settings,
  LogOut,
  DollarSign,
  HelpCircle,
  Baby,
  ShoppingBag,
  CreditCard,
  Tag,
} from "lucide-react"

export function BasicSidebar() {
  // Navigation items
  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/cows", label: "Cow Management", icon: <Milk className="h-5 w-5" /> },
    { href: "/production", label: "Milk Production", icon: <Milk className="h-5 w-5" /> },
    { href: "/calves", label: "Calves", icon: <Baby className="h-5 w-5" /> },
    { href: "/veterinary", label: "Veterinary", icon: <Stethoscope className="h-5 w-5" /> },
    { href: "/feeds", label: "Feeds", icon: <Wheat className="h-5 w-5" /> },
    { href: "/cow-feeding", label: "Cow Feeding", icon: <Wheat className="h-5 w-5" /> },
    { href: "/expenses", label: "Expenses", icon: <DollarSign className="h-5 w-5" /> },
    { href: "/vendors", label: "Vendors", icon: <ShoppingBag className="h-5 w-5" /> },
    { href: "/milk-pricing", label: "Milk Pricing", icon: <Tag className="h-5 w-5" /> },
    { href: "/reports", label: "Reports", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/subscription", label: "Subscription", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
    { href: "/support", label: "Support", icon: <HelpCircle className="h-5 w-5" /> },
  ]

  return (
    <div className="w-64 bg-emerald-700 text-white h-screen fixed left-0 top-0 overflow-y-auto shadow-xl">
      <div className="p-4 border-b border-emerald-600">
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" className="text-white">
            <path
              fill="currentColor"
              d="M18.5 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75Zm2.25 2.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm-4.5 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm.75 2.75a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-.75-.75ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm11.75 4.484c-.16-.293-.552-.398-.845-.238a5.5 5.5 0 0 1-5.61.141.75.75 0 0 0-.69 1.331 7 7 0 0 0 7.145-.234c.293-.16.398-.552.238-.845l-.238-.155ZM12 2.75a9.25 9.25 0 1 0 0 18.5 9.25 9.25 0 0 0 0-18.5ZM4.25 12a7.75 7.75 0 1 1 15.5 0 7.75 7.75 0 0 1-15.5 0Z"
            />
          </svg>
          <h1 className="ml-2 text-xl font-bold">My Smart Cow</h1>
        </div>
        <div className="mt-2 text-center text-sm">
          <p className="font-medium">Hello, User</p>
        </div>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-600"
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-emerald-600 mt-auto">
        <div className="flex items-center justify-between px-3 py-2 mb-3">
          <span className="text-sm font-medium">Theme</span>
          <div className="bg-white rounded-full p-1">
            <span className="text-emerald-700">☀️</span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
