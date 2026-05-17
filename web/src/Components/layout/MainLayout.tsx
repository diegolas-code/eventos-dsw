import { ReactNode } from "react";
import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}