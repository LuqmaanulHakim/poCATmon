"use client";

import { useEffect, useState } from "react";

export default function CatchCatPage() {
  const [dots, setDots] = useState(".");

  // simple loading animation for "upgrading"
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-3">Upgrading this page</h1>

        <p className="text-muted-foreground text-sm leading-relaxed">
          We are currently improving the Catch Cat experience{dots}
          <br />
          Please check back soon.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="w-10 h-10 border-4 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}