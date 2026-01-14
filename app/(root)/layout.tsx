import Header from "@/components/ui/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

async function Layout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/register");

  const user = {
    id: session?.user.id,
    name: session?.user.name,
    email: session?.user.email,
  };

  return (
    <main className="min-h-screen text-gray-400">
      {/* Header */}
      <Header user={user} />
      <div className="container py-10">{children}</div>
    </main>
  );
}

export default Layout;
