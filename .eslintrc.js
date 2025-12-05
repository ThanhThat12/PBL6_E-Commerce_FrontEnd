module.exports = {
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    // Allow unused variables that start with underscore
    "no-unused-vars": [
      "error", 
      { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true 
      }
    ],
    // Allow useless escape in regex patterns
    "no-useless-escape": "off",
    // Relax jsx-a11y img alt rules
    "jsx-a11y/img-redundant-alt": "off",
    // Allow exhaustive deps warnings to be suppressed with comments
    "react-hooks/exhaustive-deps": "warn"
  }
};