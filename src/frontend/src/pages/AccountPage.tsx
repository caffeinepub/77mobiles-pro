import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AccountPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/app" });
  }, [navigate]);
  return null;
}
