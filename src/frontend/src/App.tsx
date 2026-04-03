import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from "@tanstack/react-router";
import IOSInstallGuide from "./components/IOSInstallGuide";
import { router } from "./router";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
      <IOSInstallGuide />
    </>
  );
}
