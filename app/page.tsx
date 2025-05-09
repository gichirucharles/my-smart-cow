import { MobileSidebarToggle } from "@/components/mobile-sidebar-toggle"

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="md:hidden p-4 border-b flex items-center">
        <MobileSidebarToggle />
        <h1 className="ml-4 text-xl font-bold">Maziwa Smart</h1>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Milk Production</h2>
            <p className="text-gray-600">View your daily milk production statistics</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Cow Health</h2>
            <p className="text-gray-600">Monitor the health status of your cows</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Feed Inventory</h2>
            <p className="text-gray-600">Track your feed and supplies inventory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
