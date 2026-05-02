import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { router } from "./routes.tsx";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.tsx";
import { LoadingFallback } from "./components/LoadingFallback.tsx";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;