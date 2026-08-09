import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BookingProvider } from "./context/BookingContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

ReactDOM.createRoot(
    document.getElementById("root")!
).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <BookingProvider>
                            <App />
                        </BookingProvider>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);