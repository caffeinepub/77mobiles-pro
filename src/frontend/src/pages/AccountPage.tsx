import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Account management is handled inside ProfilePage as an inline sub-view.
// This route exists for deep-link compatibility and redirects to the app shell.
export default function AccountPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/app" });
  }, [navigate]);
  return null;
}
