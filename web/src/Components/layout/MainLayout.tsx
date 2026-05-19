import { ReactNode } from "react";

import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}