export default function TermsPage() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

        <div className="prose">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Maziwa Smart, you agree to be bound by these Terms and Conditions. If you do not
            agree to these terms, please do not use the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Maziwa Smart provides dairy farm management tools and services to help users track milk production, manage
            livestock, and optimize farm operations.
          </p>

          <h2>3. Subscription Plans</h2>
          <p>
            Maziwa Smart offers various subscription plans with different features and pricing. The cost of each plan
            depends on the package selected by the user.
          </p>

          <h2>4. Free Trial</h2>
          <p>
            New users are entitled to a 30-day free trial of Maziwa Smart. During this period, users can access all
            features of the selected plan without charge.
          </p>

          <h2>5. User Accounts</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their account information, including username
            and password. Users are also responsible for all activities that occur under their account.
          </p>

          <h2>6. Data Privacy</h2>
          <p>
            Maziwa Smart collects and processes user data in accordance with our Privacy Policy. By using our service,
            you consent to such processing and warrant that all data provided by you is accurate.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Maziwa Smart shall not be liable for any indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            Maziwa Smart reserves the right to modify these terms at any time. We will provide notice of significant
            changes to these terms by posting the new terms on the site and/or via email.
          </p>

          <h2>9. Governing Law</h2>
          <p>These Terms shall be governed by the laws of Kenya without regard to its conflict of law provisions.</p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
