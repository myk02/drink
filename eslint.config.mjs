import coreWebVitals from "eslint-config-next/core-web-vitals"
import typescript from "eslint-config-next/typescript"

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "convex/_generated/**",
      ".vercel/**",
      ".backups/**",
    ],
  },
  {
    // Stock shadcn/ui generated components & hooks — keep diffs minimal,
    // so relax the newer react-hooks v6 compiler rules here only.
    files: ["components/ui/**", "hooks/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]

export default eslintConfig
