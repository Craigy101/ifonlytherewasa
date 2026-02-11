import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // React 19 hooks plugin rules — downgrade from error to warn
      // These flag valid patterns (resetting state on dependency change,
      // reading localStorage in effects) that don't cause real bugs.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
