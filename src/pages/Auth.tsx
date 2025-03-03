import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { HighlightedPasswordDisplay } from "@/components/ui/HighlightedPasswordDisplay";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/dashboard");
      } else {
        // For registration, ensure passwords match
        if (!passwordsMatch) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }
        
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Check your email for a confirmation link.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // No need to navigate, the OAuth redirect will handle this
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred with Google sign in",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{isLogin ? "Log in" : "Sign up"}</h1>
          <p className="mt-2 text-gray-600">
            {isLogin
              ? "Welcome back! Please log in to your account."
              : "Create a new account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              {isLogin ? (
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
              ) : (
                <HighlightedPasswordDisplay
                  password={password}
                  confirmPassword={confirmPassword}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const match = e.target.value === password;
                    setPasswordsMatch(match);
                    setConfirmPassword(e.target.value);
                  }}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (!isLogin && !passwordsMatch)}
          >
            {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
          </Button>
        </form>

        <div className="text-center my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <span className="px-2 text-sm text-gray-500 bg-white relative z-10 inline-block">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032
              s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2
              C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
