Action: file_editor create /app/frontend/src/components/Aurora.jsx --file-text "import { motion } from \"framer-motion\";

/** Sunset Aurora background blob - obsidian black + rose/amber/emerald orbs. */
export default function Aurora({ className = \"\" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.div
        className=\"absolute -top-32 -left-32 size-[520px] rounded-full bg-rose-500/30 blur-[120px]\"
        animate={{ x: [0, 40, -10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: \"easeInOut\" }}
      />
      <motion.div
        className=\"absolute top-1/3 -right-40 size-[600px] rounded-full bg-amber-500/30 blur-[140px]\"
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: \"easeInOut\" }}
      />
      <motion.div
        className=\"absolute -bottom-40 left-1/3 size-[560px] rounded-full bg-emerald-500/25 blur-[140px]\"
        animate={{ x: [0, 30, -20, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: \"easeInOut\" }}
      />
      <div className=\"absolute inset-0 grid-bg opacity-60\" />
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/Aurora.jsx