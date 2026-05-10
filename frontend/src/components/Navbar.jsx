Action: file_editor create /app/frontend/src/components/Navbar.jsx --file-text "import { Link, useNavigate } from \"react-router-dom\";
import { Sparkles, LogOut, LayoutDashboard, GraduationCap } from \"lucide-react\";
import { useAuth } from \"@/lib/auth.jsx\";
import { Button } from \"@/components/ui/button\";

export default function Navbar({ variant = \"default\" }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className=\"sticky top-0 z-50 w-full\">
      <div className=\"mx-auto max-w-7xl px-4 md:px-8 pt-4\">
        <div className=\"glass rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between\" data-testid=\"nav-bar\">
          <Link to=\"/\" className=\"flex items-center gap-2 group\" data-testid=\"nav-logo\">
            <div className=\"relative size-8 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 grid place-items-center shadow-lg shadow-amber-500/20\">
              <Sparkles className=\"size-4 text-black\" />
            </div>
            <span className=\"font-display font-extrabold tracking-tight text-lg\">
              Lumen<span className=\"aurora-text\">.ai</span>
            </span>
          </Link>
          <nav className=\"hidden md:flex items-center gap-6 text-sm text-zinc-400\">
            <a href=\"#features\" className=\"hover:text-white transition-colors\">Features</a>
            <a href=\"#how\" className=\"hover:text-white transition-colors\">How it works</a>
            <a href=\"#pricing\" className=\"hover:text-white transition-colors\">Pricing</a>
          </nav>
          <div className=\"flex items-center gap-2\">
            {user ? (
              <>
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => nav(\"/dashboard\")}
                  className=\"hidden sm:inline-flex text-zinc-300 hover:text-white\"
                  data-testid=\"nav-dashboard-btn\"
                >
                  <LayoutDashboard className=\"size-4 mr-2\" /> Dashboard
                </Button>
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => { logout(); nav(\"/\"); }}
                  data-testid=\"nav-logout-btn\"
                  className=\"text-zinc-400 hover:text-white\"
                >
                  <LogOut className=\"size-4 mr-2\" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => nav(\"/login\")}
                  className=\"text-zinc-300 hover:text-white\"
                  data-testid=\"nav-login-btn\"
                >
                  Login
                </Button>
                <Button
                  size=\"sm\"
                  onClick={() => nav(\"/signup\")}
                  className=\"rounded-full bg-white text-black hover:bg-zinc-200\"
                  data-testid=\"nav-signup-btn\"
                >
                  <GraduationCap className=\"size-4 mr-2\" /> Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
"
Observation: Create successful: /app/frontend/src/components/Navbar.jsx