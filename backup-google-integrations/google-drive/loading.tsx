export default function Loading() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-black p-4 animate-pulse"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-black p-4 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 font-bold">Loading Google Drive resources...</p>
        </div>
      </div>
    </div>
  );
}
