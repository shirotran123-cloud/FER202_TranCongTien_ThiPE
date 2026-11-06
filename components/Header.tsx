"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Header() {
  const { user, loading, signOut } = useApp();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="border-b bg-white dark:bg-slate-950 px-4 lg:px-8 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tight text-primary">
        ShelfLife
      </Link>

      <div className="flex items-center gap-4">
        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <span data-testid="user-email" className="text-sm font-medium text-muted-foreground">
                {user.email}
              </span>
              <Link
                href="/books"
                data-testid="link-books"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Books
              </Link>
              <Button
                data-testid="btn-logout"
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                data-testid="btn-login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Login
              </Link>
              <Link
                href="/register"
                data-testid="btn-register"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Register
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}
