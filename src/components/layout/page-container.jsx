"use client";

export default function PageContainer({ children }) {
  return (
    <div className="w-full px-2 py-4 md:px-4 md:py-4">
      <div className="w-full max-w-full md:mx-auto space-y-4">
        {children}
      </div>
    </div>
  );
}