export default function ProtectedPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Confirmed!</h1>
        <p className="text-gray-600 mb-6">Your email has been confirmed. Redirecting to dashboard...</p>
      </div>
      <script>
        {`
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        `}
      </script>
    </div>
  )
}
