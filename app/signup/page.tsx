import SignupForm from "./signup-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <p className="mt-2 text-center text-gray-600">Join Maziwa Smart to manage your dairy farm</p>

        <SignupForm />

        <p className="mt-8 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-600 hover:text-emerald-700">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
