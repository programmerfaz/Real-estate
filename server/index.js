import { createAuthApp } from "./authApp.js";

const PORT = process.env.AUTH_PORT || 3001;
createAuthApp().listen(PORT, () => {
  console.log(`Auth server running at http://localhost:${PORT}`);
});
