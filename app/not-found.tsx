export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-xl">The page you are looking for does not exist.</p>
      <a href="/" className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Home
      </a>
    </div>
  )
}
