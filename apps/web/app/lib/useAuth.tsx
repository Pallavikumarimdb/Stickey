import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    userId: session?.user?.id ?? null,
    userName: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    status, // 'loading' | 'authenticated' | 'unauthenticated'
    isAuthenticated: status === "authenticated",
  };
}
