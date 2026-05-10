Action: file_editor create /app/frontend/src/pages/Signup.jsx --file-text "import { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import { toast } from \"sonner\";
import { Sparkles, Mail, Lock, User, ArrowRight } from \"lucide-react\";

import Aurora from \"@/components/Aurora\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { useAuth } from \"@/lib/auth.jsx\";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(\"\");
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error(\"Password must be at least 6 chars\");
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      toast.success(\"Account created\");
      nav(\"/dashboard\");
    } catch (err) {
      toast.error(err?.response?.data?.detail || \"Signup failed\");
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
        <h1 className=\"font-display text-3xl font-black tracking-tight\">Create your account</h1>
        <p className=\"mt-1 text-sm text-zinc-400\">Three sample lectures included</p>

        <form onSubmit={submit} className=\"mt-8 space-y-4\">
          <div className=\"space-y-2\">
            <Label className=\"text-zinc-300\" htmlFor=\"name\">Name</Label>
            <div className=\"relative\">
              <User className=\"absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500\" />
              <Input id=\"name\" required value={name} onChange={(e) => setName(e.target.value)} placeholder=\"Ada Lovelace\"
                className=\"pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500\" data-testid=\"signup-name-input\" />
            </div>
          </div>
          <div className=\"space-y-2\">
            <Label className=\"text-zinc-300\" htmlFor=\"email\">Email</Label>
            <div className=\"relative\">
              <Mail className=\"absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500\" />
              <Input id=\"email\" type=\"email\" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder=\"you@school.edu\"
                className=\"pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500\" data-testid=\"signup-email-input\" />
            </div>
          </div>
          <div className=\"space-y-2\">
            <Label className=\"text-zinc-300\" htmlFor=\"password\">Password</Label>
            <div className=\"relative\">
              <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500\" />
              <Input id=\"password\" type=\"password\" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder=\"At least 6 characters\"
                className=\"pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-amber-500\" data-testid=\"signup-password-input\" />
            </div>
          </div>
          <Button type=\"submit\" disabled={busy} className=\"w-full rounded-full bg-white text-black hover:bg-zinc-200 h-11\" data-testid=\"signup-submit-btn\">
            {busy ? \"Creating...\" : (<>Create account <ArrowRight className=\"size-4 ml-2\" /></>)}
          </Button>
        </form>
        <div className=\"mt-6 text-center text-sm text-zinc-400\">
          Already have an account?{\" \"}
          <Link to=\"/login\" className=\"text-amber-400 hover:text-amber-300\" data-testid=\"signup-to-login-link\">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/pages/Signup.jsx