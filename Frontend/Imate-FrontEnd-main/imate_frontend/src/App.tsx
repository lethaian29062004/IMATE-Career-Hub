import { Routes, Route, useLocation } from "react-router-dom";
import { routeConfig } from "./routes/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./store/Context";
import { AuthProvider } from "./store/AuthContext";
import { SignalRProvider } from "./store/SignalRContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const queryClient = new QueryClient();
  const location = useLocation();

  const hideNotificationCenter = location.pathname.startsWith("/interview-chat");
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AppProvider>
          <AuthProvider>
            <SignalRProvider>
              <Routes>
                {routeConfig.map((route, index) => (
                  <Route key={index} path={route.path} element={route.element}>
                    {route.children?.map((childRoute, idx) => (
                      <Route key={idx} path={childRoute.path} element={childRoute.element} />
                    ))}
                  </Route>
                ))}
              </Routes>
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
              {!hideNotificationCenter && (
                <div className="fixed right-6 bottom-6 z-50">
                </div>
              )}
            </SignalRProvider>
          </AuthProvider>
        </AppProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
