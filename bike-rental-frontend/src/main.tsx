import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BookingProvider } from "./context/BookingContext";
import { LocationProvider } from "./context/LocationContext";
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
                            <LocationProvider>
                                <App />
                            </LocationProvider>
                        </BookingProvider>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);