"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TermsDialog() {
  const [showDialog, setShowDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if terms have been accepted
    const termsAccepted = localStorage.getItem("termsAccepted")
    const currentUser = localStorage.getItem("currentUser")

    if (currentUser && !termsAccepted) {
      setShowDialog(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true")
    setShowDialog(false)
  }

  const handleViewTerms = () => {
    router.push("/terms")
  }

  if (!showDialog) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>

        <p className="mb-4">
          Welcome to Maziwa Smart! Before you continue, please read and accept our Terms and Conditions.
        </p>

        <div className="h-48 overflow-y-auto border rounded p-3 mb-4 text-sm">
          <p className="mb-2">By using Maziwa Smart, you agree to be bound by these Terms and Conditions.</p>
          <p className="mb-2">
            Maziwa Smart provides dairy farm management tools and services to help users track milk production, manage
            livestock, and optimize farm operations.
          </p>
          <p className="mb-2">
            Maziwa Smart offers various subscription plans with different features and pricing. The cost of each plan
            depends on the package selected by the user.
          </p>
          <p className="mb-2">
            New users are entitled to a 30-day free trial of Maziwa Smart. During this period, users can access all
            features of the selected plan without charge.
          </p>
          <p>For the complete terms and conditions, please click "View Full Terms".</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={handleViewTerms} className="px-4 py-2 text-emerald-600 hover:text-emerald-700">
            View Full Terms
          </button>
          <button onClick={handleAccept} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  )
}
