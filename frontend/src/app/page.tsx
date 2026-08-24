export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4 text-center">
        Welcome to SNEC Task & Project Management
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl text-center mb-8">
        A powerful platform to manage projects, assign tasks, track progress, and collaborate seamlessly across your organization.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Frontend Initialized</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          The Next.js application has been successfully scaffolded. Authentication, routing, dashboards, and full business logic will be implemented in future phases.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center font-medium">
          Ready for development
        </div>
      </div>
    </div>
  );
}
