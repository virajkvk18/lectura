Now let me create the App, Layout, Aurora, and Page components:
Action: file_editor create /app/frontend/src/App.js --file-text "import \"@/App.css\";
import \"@/index.css\";
import { BrowserRouter, Routes, Route, Navigate } from \"react-router-dom\";
import { Toaster } from \"sonner\";

import { AuthProvider, useAuth } from \"@/lib/auth.jsx\";
import Landing from \"@/pages/Landing\";
import Login from \"@/pages/Login\";
import Signup from \"@/pages/Signup\";
import Dashboard from \"@/pages/Dashboard\";
import VideoLearning from \"@/pages/VideoLearning\";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className=\"min-h-screen grid place-items-center bg-background text-foreground\">
        <div className=\"size-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin\" />
      </div>
    );
  }
  if (!user) return <Navigate to=\"/login\" replace />;
  return children;
}

export default function App() {
  return (
    <div className=\"min-h-screen bg-background text-foreground\">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path=\"/\" element={<Landing />} />
            <Route path=\"/login\" element={<Login />} />
            <Route path=\"/signup\" element={<Signup />} />
            <Route path=\"/dashboard\" element={<Protected><Dashboard /></Protected>} />
            <Route path=\"/learn/:lectureId\" element={<Protected><VideoLearning /></Protected>} />
          </Routes>
          <Toaster
            position=\"bottom-right\"
            theme=\"dark\"
            toastOptions={{
              style: { background: \"#0A0A0A\", border: \"1px solid #27272A\", color: \"#fff\" },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
"
Observation: Overwrite successful: /app/frontend/src/App.js