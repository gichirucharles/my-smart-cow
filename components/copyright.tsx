export function Copyright() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
      &copy; {currentYear} Maziwa Smart. All rights reserved.
    </div>
  )
}
