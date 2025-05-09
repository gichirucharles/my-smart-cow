import { Copyright } from "@/components/copyright"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Maziwa Smart</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The complete dairy farm management solution for modern farmers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email: support@maziwa-smart.com
              <br />
              Phone: +254 700 000 000
            </p>
          </div>
        </div>
        <Copyright />
      </div>
    </footer>
  )
}
