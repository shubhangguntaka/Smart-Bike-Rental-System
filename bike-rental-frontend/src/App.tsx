import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: "smartbike-toast",
          duration: 4000,
          style: {
            maxWidth: "420px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );

}

export default App;