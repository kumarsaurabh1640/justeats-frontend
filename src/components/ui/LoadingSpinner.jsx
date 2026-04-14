export default function LoadingSpinner({ fullPage = false }) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }
  return spinner;
}
