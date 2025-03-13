
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { isAdmin, loading, signOut, user, checkUserRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!loading) {
        // Double-check the role
        if (user) {
          const role = await checkUserRole();
          console.log("Dashboard - current user role:", role);
          console.log("Dashboard - isAdmin state:", isAdmin);
          
          if (role !== 'admin') {
            toast({
              title: "Access Denied",
              description: "You do not have permission to access the admin area",
              variant: "destructive",
            });
            navigate("/shesh/login");
          }
        } else if (!isAdmin) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the admin area",
            variant: "destructive",
          });
          navigate("/shesh/login");
        }
      }
    };
    
    verifyAdmin();
  }, [isAdmin, loading, navigate, toast, user, checkUserRole]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/shesh/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h2>
          <p className="text-gray-600">Manage your application settings and data</p>
          
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <div className="text-sm font-mono">
              <p>Debug Info:</p>
              <p>User ID: {user?.id || 'Not signed in'}</p>
              <p>Email: {user?.email || 'N/A'}</p>
              <p>isAdmin state: {isAdmin ? 'true' : 'false'}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Active accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>Total exchanges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Agents</CardTitle>
                  <CardDescription>Active AI agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">No users found</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure global settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">This section will contain application settings.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
