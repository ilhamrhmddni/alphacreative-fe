"use client";

export default function PageContainer({ children }) {
  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {children}
      </div>
    </div>
  );
}