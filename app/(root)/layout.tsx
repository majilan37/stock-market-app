import Header from "@/components/ui/header";
import { PropsWithChildren } from "react";

function Layout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen text-gray-400">
      {/* Header */}
      <Header />
      <div className="container py-10">{children}</div>
    </main>
  );
}

export default Layout;
