
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, checkUserRole, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated and is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const role = await checkUserRole();
        console.log("Admin page - user role:", role);
        
        if (role === 'admin') {
          toast({
            title: "Already authenticated",
            description: "You are already signed in as admin",
          });
          navigate("/shesh/dashboard");
        }
      }
    };
    
    checkAdminStatus();
  }, [user, checkUserRole, navigate, toast]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Check if user is admin after sign in
      const userRole = await checkUserRole();
      console.log("Sign in attempt - user role:", userRole);
      
      if (userRole === 'admin') {
        toast({
          title: "Success",
          description: "You have successfully signed in as admin",
        });
        navigate("/shesh/dashboard");
      } else {
        toast({
          title: "Access Denied",
          description: "You do not have admin privileges",
          variant: "destructive",
        });
        // Sign out if not admin
        await signOut();
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="mt-2 text-gray-600">
            This area is restricted to administrators only
          </p>
        </div>

        <form onSubmit={handleAdminSignIn} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 h-11"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign in as Admin"}
          </Button>
        </form>
        
        <div className="text-center mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Return to main site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
