"use client";

export default function PageContainer({ children }) {
  return (
    <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
      <div className="space-y-4">
        {children}
      </div>
    </main>
  );
}