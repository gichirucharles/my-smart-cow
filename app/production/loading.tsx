import { Skeleton } from "@/components/ui/skeleton"
import { BasicSidebar } from "@/components/basic-sidebar"

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <BasicSidebar />
      <div className="ml-64 p-6 flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 rounded-full mr-2" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 flex-1" />
          </div>

          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
