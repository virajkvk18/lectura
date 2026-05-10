Action: file_editor create /app/frontend/src/pages/Login.jsx --file-text "import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import { toast } from \"sonner\";
import { Sparkles, Mail, Lock, ArrowRight } from \"lucide-react\";

import Aurora from \"@/components/Aurora\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { useAuth } from \"@/lib/auth.jsx\";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success(\"Welcome back\");
      nav(\"/dashboard\");
    } catch (err) {
      toast.error(err?.response?.data?.detail || \"Login failed\");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className=\"relative min-h-screen flex items-center justify-center px-4\">
      <Aurora />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className=\"relative w-full max-w-md glass rounded-3xl p-8\"
      >
        <Link to=\"/\" className=\"inline-flex items-center gap-2 mb-8\">
          <div className=\"size-8 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 grid place-items-center\">
            <Sparkles className=\"size-4 text-black\" />
          </div>
          <span className=\"font-display font-extrabold\">Lumen<span className=\"aurora-text\">.ai</span></span>
        </Link>
        <h1 className=\"font-display text-3xl font-black tracking-tight\">Welcome back</h1>
        <p className=\"mt-1 text-sm text-zinc-400\">Sign in to continue learning</p>

        <form onSubmit={submit} className=\"mt-8 space-y-4\">
          <div className=\"space-y-2\">
            <Label htmlFor=\"email\" className=\"text-zinc-300\">Email</Label>
            <div className=\"relative\">
              <Mail className=\"absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500\" />
              <Input
                id=\"email\"
                type=\"email\"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=\"you@school.edu\"
                className=\"pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500\"
                data-testid=\"login-email-input\"
              />
            </div>
          </div>
          <div className=\"space-y-2\">
            <Label htmlFor=\"password\" className=\"text-zinc-300\">Password</Label>
            <div className=\"relative\">
              <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500\" />
              <Input
                id=\"password\"
                type=\"password\"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=\"••••••••\"
                className=\"pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500\"
                data-testid=\"login-password-input\"
              />
            </div>
          </div>
          <Button type=\"submit\" disabled={busy} className=\"w-full rounded-full bg-white text-black hover:bg-zinc-200 h-11\" data-testid=\"login-submit-btn\">
            {busy ? \"Signing in...\" : (<>Sign in <ArrowRight className=\"size-4 ml-2\" /></>)}
          </Button>
        </form>
        <div className=\"mt-6 text-center text-sm text-zinc-400\">
          New here?{\" \"}
          <Link to=\"/signup\" className=\"text-amber-400 hover:text-amber-300\" data-testid=\"login-to-signup-link\">Create an account</Link>
        </div>
      </motion.div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Login.jsx