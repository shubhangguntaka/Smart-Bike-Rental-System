import {
    createContext,
    useEffect,
    useState,
    ReactNode
} from "react";

import {

    saveToken,
    getToken,
    removeToken,

    saveUser,
    getUser,
    removeUser

} from "../utils/storage";

import env from "../config/env";

export interface UserInfo {

    id?: number;

    firstName?: string;

    lastName?: string;

    email: string;

    role: string;

}

export interface AuthContextType {

    token: string | null;

    user: UserInfo | null;

    isAuthenticated: boolean;

    login: (data: {
        token: string;
        user: UserInfo;
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

    useEffect(() => {

        const token = getToken();

        const user = getUser();

        if (token) {

            setToken(token);

        }

        if (user) {

            setUser(user);

        }

    }, []);

    const login = (data: {

        token: string;

        user: UserInfo;

    }) => {

        saveToken(data.token);

        saveUser(data.user);

        setToken(data.token);

        setUser(data.user);

    };

    const logout = () => {

    removeToken();

    removeUser();

    setToken(null);

    setUser(null);

};

    return (

        <AuthContext.Provider

            value={{

                token,

                user,

                isAuthenticated: !!token,

                login,

                logout

            }}

        >

            {children}

        </AuthContext.Provider>

    );

};