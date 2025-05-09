import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">Login to Maziwa Smart</h1>
        <p className="mt-2 text-center text-gray-600">Enter your credentials to access your account</p>

        <LoginForm />

        <p className="mt-8 text-center">
          <a href="/" className="text-emerald-600 hover:text-emerald-700">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  )
}
