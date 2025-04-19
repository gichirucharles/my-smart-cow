import { BasicSidebar } from "@/components/basic-sidebar"

export default function ProductionPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Always show the sidebar */}
      <BasicSidebar />

      {/* Main content */}
      <div className="ml-64 p-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Milk Production</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Production Records</h2>
          <p className="text-gray-600">Track your milk production records here</p>
        </div>
      </div>
    </div>
  )
}
