import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import { UserProvider } from "./context/UserContext";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);