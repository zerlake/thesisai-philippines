/**
 * Hook to check if auth is ready before allowing AI operations
 * Prevents race conditions where session is null due to loading state
 */
import { useAuth } from "@/components/auth-provider";

export function useAuthReady() {
  const { session, isLoading } = useAuth();
  
  const isReady = !isLoading && !!session;
  
  const checkAuthBeforeAI = (operation: string): boolean => {
    if (isLoading) {
      return false;
    }
    if (!session) {
      console.error(`[${operation}] No active session. User must be logged in.`);
      return false;
    }
    return true;
  };

  return { session, isLoading, isReady, checkAuthBeforeAI };
}
