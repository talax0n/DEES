export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="h-screen bg-gray-200" />

      {/* About skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] rounded-3xl bg-gray-200" />
          <div className="space-y-4 py-8">
            <div className="h-4 w-24 rounded-full bg-gray-200" />
            <div className="h-10 w-3/4 rounded-xl bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Programs skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="aspect-[4/3] rounded-3xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-4 w-20 rounded-full bg-gray-200" />
            <div className="h-10 w-2/3 rounded-xl bg-gray-200" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded-2xl bg-gray-200" />
              <div className="h-24 rounded-2xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Downloads skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20 bg-off-white">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-6 w-32 rounded-full bg-gray-300 mx-auto" />
          <div className="h-10 w-64 rounded-xl bg-gray-300 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="h-64 rounded-3xl bg-gray-200" />
            <div className="h-64 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Dokumentasi skeleton */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
        <div className="h-10 w-48 rounded-xl bg-gray-200 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
