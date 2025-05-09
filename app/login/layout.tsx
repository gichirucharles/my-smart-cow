import type React from "react"
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="md:ml-0">{children}</div>
}
