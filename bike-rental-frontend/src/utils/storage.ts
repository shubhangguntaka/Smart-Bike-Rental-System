import env from "../config/env";
import { STORAGE_KEYS } from "./constants";

/* ==========================================
   TEAM STORAGE OBJECT
========================================== */

export const storage = {

    // Token

    setToken(token: string): void {

        localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    },

    getToken(): string | null {

        return localStorage.getItem(STORAGE_KEYS.TOKEN);

    },

    removeToken(): void {

        localStorage.removeItem(STORAGE_KEYS.TOKEN);

    },

    // Refresh Token

    setRefreshToken(token: string): void {

        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);

    },

    getRefreshToken(): string | null {

        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    },

    removeRefreshToken(): void {

        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    },

    // User

    setUser<T>(user: T): void {

        localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(user)
        );

    },

    getUser<T>(): T | null {

        const user = localStorage.getItem(STORAGE_KEYS.USER);

        return user ? JSON.parse(user) : null;

    },

    removeUser(): void {

        localStorage.removeItem(STORAGE_KEYS.USER);

    },

    // Role

    setRole(role: string): void {

        localStorage.setItem(STORAGE_KEYS.ROLE, role);

    },

    getRole(): string | null {

        return localStorage.getItem(STORAGE_KEYS.ROLE);

    },

    removeRole(): void {

        localStorage.removeItem(STORAGE_KEYS.ROLE);

    },

    // Theme

    setTheme(theme: string): void {

        localStorage.setItem(STORAGE_KEYS.THEME, theme);

    },

    getTheme(): string | null {

        return localStorage.getItem(STORAGE_KEYS.THEME);

    },

    removeTheme(): void {

        localStorage.removeItem(STORAGE_KEYS.THEME);

    },

    clear(): void {

        localStorage.clear();

    }

};

/* ==========================================
   AUTH MODULE FUNCTIONS
   (KEEPED FOR BACKWARD COMPATIBILITY)
========================================== */

export const saveToken = (token: string) => {

    localStorage.setItem(env.TOKEN_KEY, token);

};

export const getToken = () => {

    return localStorage.getItem(env.TOKEN_KEY);

};

export const removeToken = () => {

    localStorage.removeItem(env.TOKEN_KEY);

};

export const saveUser = (user: any) => {

    localStorage.setItem(

        env.USER_KEY,

        JSON.stringify(user)

    );

};

export const getUser = () => {

    const user = localStorage.getItem(env.USER_KEY);

    return user ? JSON.parse(user) : null;

};

export const removeUser = () => {

    localStorage.removeItem(env.USER_KEY);

};