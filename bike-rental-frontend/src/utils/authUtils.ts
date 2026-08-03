import { jwtDecode } from "jwt-decode";
import { ROLES } from "./constants";
import { storage } from "./storage";

interface DecodedToken {
  exp?: number;
  role?: string;
  roles?: string[];
  sub?: string;
}

/**
 * Check whether the token is expired.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token || !token.includes(".")) {
      return false; // Skip decode check for mock/dummy tokens
    }
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
};

/**
 * Extract role from JWT token.
 */
export const getRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.role || decoded.roles?.[0] || null;
  } catch (error) {
    return null;
  }
};

/**
 * Check whether the user is authenticated.
 */
export const isAuthenticated = (): boolean => {
  const token = storage.getToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Get current logged-in user.
 */
export const getCurrentUser = <T>() => {
  return storage.getUser<T>();
};

/**
 * Get current user role.
 */
export const getCurrentRole = (): string | null => {
  const role = storage.getRole();
  if (role) return role;

  const user = storage.getUser<{ role?: string }>();
  if (user?.role) return user.role;

  const token = storage.getToken();
  if (token) return getRoleFromToken(token);

  return null;
};

/**
 * Check whether the user has a specific role.
 */
export const hasRole = (role: string): boolean => {
  const currentRole = getCurrentRole();
  return !!currentRole && currentRole.toUpperCase() === role.toUpperCase();
};

/**
 * Check if current user is Admin.
 */
export const isAdmin = (): boolean => {
  return hasRole(ROLES.ADMIN);
};

/**
 * Check if current user is Owner.
 */
export const isOwner = (): boolean => {
  return hasRole(ROLES.OWNER);
};

/**
 * Check if current user is Customer.
 */
export const isCustomer = (): boolean => {
  return hasRole(ROLES.CUSTOMER);
};

/**
 * Logout current user.
 */
export const logout = (): void => {
  storage.removeToken();
  storage.removeRefreshToken();
  storage.removeUser();
  storage.removeRole();
};