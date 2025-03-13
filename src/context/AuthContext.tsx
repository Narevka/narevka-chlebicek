
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type UserRole = 'user' | 'admin';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    adminVerified?: boolean;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<UserRole>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAndSetAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed", _event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAndSetAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dedicated function to check and set admin status
  const checkAndSetAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for user ID:", userId);
      const role = await checkUserRole();
      console.log("Auth state change role check:", role);
      const adminStatus = role === 'admin';
      console.log("Setting isAdmin to:", adminStatus);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const checkUserRole = async (): Promise<UserRole> => {
    if (!user) return 'user';
    
    try {
      console.log("Checking role for user ID:", user.id);
      
      // First try the RPC function (most reliable)
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id: user.id });
      
      if (error) {
        console.error("Error checking user role via RPC:", error);
      } else {
        console.log("RPC returned role:", data);
        return (data as UserRole) || 'user';
      }
      
      // Fallback to direct query if RPC fails
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleError) {
        console.error("Error in direct role query:", roleError);
        return 'user';
      }
      
      if (roleData && roleData.role === 'admin') {
        console.log("Direct query found admin role");
        return 'admin';
      }
      
      return 'user';
    } catch (error) {
      console.error("Exception checking user role:", error);
      return 'user';
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("Signing in with email:", email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Get the latest user after sign in
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      const role = await checkUserRole();
      console.log("Sign in role check:", role);
      const adminStatus = role === 'admin';
      setIsAdmin(adminStatus);
      return { error: null, adminVerified: adminStatus };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    checkUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
