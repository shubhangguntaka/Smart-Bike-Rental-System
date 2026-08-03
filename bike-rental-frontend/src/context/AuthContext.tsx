import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import { storage } from "../utils/storage";
import { isTokenExpired } from "../utils/authUtils";

export interface UserInfo {
    id?: number;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    phoneNumber?: string;
}

export interface AuthContextType {
    token: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: {
        token: string;
        user: UserInfo;
        refreshToken?: string;
    }) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = storage.getToken();
                const storedUser = storage.getUser<UserInfo>();

                if (storedToken && storedUser) {
                    if (isTokenExpired(storedToken)) {
                        storage.removeToken();
                        storage.removeUser();
                        storage.removeRole();
                        storage.removeRefreshToken();
                    } else {
                        setToken(storedToken);
                        setUser(storedUser);
                    }
                }
            } catch (error) {
                console.error("Failed to initialize authentication", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (data: {
        token: string;
        user: UserInfo;
        refreshToken?: string;
    }) => {
        const uppercaseRole = data.user.role.toUpperCase();
        const updatedUser = { ...data.user, role: uppercaseRole };
        
        storage.setToken(data.token);
        storage.setUser(updatedUser);
        storage.setRole(uppercaseRole);
        if (data.refreshToken) {
            storage.setRefreshToken(data.refreshToken);
        }
        setToken(data.token);
        setUser(updatedUser);
    };

    const logout = () => {
        storage.removeToken();
        storage.removeUser();
        storage.removeRole();
        storage.removeRefreshToken();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};