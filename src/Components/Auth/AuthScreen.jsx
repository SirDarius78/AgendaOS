import { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");

  if (mode === "signup") {
    return <SignupPage onGoToLogin={() => setMode("login")} />;
  }

  return <LoginPage onGoToSignup={() => setMode("signup")} />;
}
