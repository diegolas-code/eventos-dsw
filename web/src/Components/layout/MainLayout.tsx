import { ReactNode } from 'react';

import Navbar from './Navbar';
import Footer from './Footer';

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}
