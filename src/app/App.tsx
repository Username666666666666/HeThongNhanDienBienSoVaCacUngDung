import { RouterProvider } from "react-router-dom";
import { router } from "./routes.tsx";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.tsx";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;