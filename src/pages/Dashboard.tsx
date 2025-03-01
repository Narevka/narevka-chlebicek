import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();

  // Pokaż komunikat ładowania, gdy sprawdzamy stan sesji
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <p className="text-lg">Ładowanie...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            Log out
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}!</h2>
            <p className="text-gray-600">You are now logged in to your dashboard.</p>
            <p className="text-gray-600 mt-2">
              This is a protected page that only authenticated users can access.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;