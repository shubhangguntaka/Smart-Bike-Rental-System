import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import { storage } from "../utils/storage";
import { isTokenExpired } from "../utils/authUtils";
import { getProfile } from "../services/userService";
import api from "../api/axios";

export interface UserInfo {
    id?: number;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email: string;
    role: string;
    phoneNumber?: string;
    enabled?: boolean;
    profileImage?: string;
    name?: string;
}

export interface AuthContextType {
    token: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: {
        token: string;
        refreshToken?: string;
        user?: UserInfo;
    }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (userData: UserInfo) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const parseFullName = (fullName?: string) => {
        if (!fullName) return { firstName: "", lastName: "" };
        const parts = fullName.trim().split(/\s+/);
        return {
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || ""
        };
    };

    const processUserData = (userData: UserInfo): UserInfo => {
        const uppercaseRole = userData.role.toUpperCase();
        const nameData = parseFullName(userData.fullName || userData.name);
        return {
            ...userData,
            role: uppercaseRole,
            firstName: userData.firstName || nameData.firstName,
            lastName: userData.lastName || nameData.lastName,
            fullName: userData.fullName || userData.name || `${userData.firstName} ${userData.lastName}`.trim()
        };
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = storage.getToken();
                if (storedToken) {
                    if (isTokenExpired(storedToken)) {
                        storage.removeToken();
                        storage.removeUser();
                        storage.removeRole();
                        storage.removeRefreshToken();
                    } else {
                        setToken(storedToken);
                        // Fetch profile automatically
                        const profileResponse = await getProfile();
                        const profile = (profileResponse.data && profileResponse.data.data) ? profileResponse.data.data : profileResponse.data;
                        const updatedUser = processUserData(profile);
                        
                        storage.setUser(updatedUser);
                        storage.setRole(updatedUser.role);
                        setUser(updatedUser);
                    }
                }
            } catch (error) {
                console.error("Failed to initialize authentication", error);
                storage.removeToken();
                storage.removeUser();
                storage.removeRole();
                storage.removeRefreshToken();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (data: {
        token: string;
        refreshToken?: string;
        user?: UserInfo;
    }) => {
        storage.setToken(data.token);
        if (data.refreshToken) {
            storage.setRefreshToken(data.refreshToken);
        }
        setToken(data.token);

        try {
            const profileResponse = await getProfile();
            const profile = (profileResponse.data && profileResponse.data.data) ? profileResponse.data.data : profileResponse.data;
            const updatedUser = processUserData(profile);

            storage.setUser(updatedUser);
            storage.setRole(updatedUser.role);
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to fetch profile after login", error);
            if (data.user) {
                const updatedUser = processUserData(data.user);
                storage.setUser(updatedUser);
                storage.setRole(updatedUser.role);
                setUser(updatedUser);
            }
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Failed to logout in backend", error);
        } finally {
            storage.removeToken();
            storage.removeUser();
            storage.removeRole();
            storage.removeRefreshToken();
            setToken(null);
            setUser(null);
            window.location.href = "/login";
        }
    };

    const refreshUser = async () => {
        try {
            const profileResponse = await getProfile();
            const profile = (profileResponse.data && profileResponse.data.data) ? profileResponse.data.data : profileResponse.data;
            const updatedUser = processUserData(profile);

            storage.setUser(updatedUser);
            storage.setRole(updatedUser.role);
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to refresh user profile", error);
        }
    };

    const updateUser = (userData: UserInfo) => {
        const updatedUser = processUserData(userData);

        storage.setUser(updatedUser);
        storage.setRole(updatedUser.role);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token,
                loading,
                login,
                logout,
                refreshUser,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};