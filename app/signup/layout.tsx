import type React from "react"
export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="md:ml-0">{children}</div>
}
