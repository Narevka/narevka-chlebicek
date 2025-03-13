
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, loading, user, checkUserRole, signOut } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!loading) {
        try {
          setIsChecking(true);
          if (user) {
            // Double-check admin status
            const role = await checkUserRole();
            console.log("Admin page - user role:", role);
            const adminAccess = role === 'admin';
            setHasAccess(adminAccess);
            
            if (!adminAccess) {
              toast({
                title: "Access Denied",
                description: "You do not have admin privileges",
                variant: "destructive",
              });
              // Sign out since they shouldn't be here
              await signOut();
            }
          } else {
            setHasAccess(false);
          }
        } catch (error) {
          console.error("Error verifying admin access:", error);
          setHasAccess(false);
        } finally {
          setIsChecking(false);
        }
      }
    };
    
    verifyAdminAccess();
  }, [loading, user, checkUserRole, isAdmin, toast, signOut]);

  // If still loading or checking, show loading indicator
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not admin, redirect to admin login
  if (!hasAccess) {
    return <Navigate to="/shesh/login" state={{ from: location }} replace />;
  }

  // If admin, render the protected route
  return <>{children}</>;
};

export default AdminRoute;
