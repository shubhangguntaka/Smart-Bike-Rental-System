import { ROLES } from "./constants";
import { storage } from "./storage";

/**
 * Check whether the user is authenticated.
 */
export const isAuthenticated = (): boolean => {
  return !!storage.getToken();
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
  return storage.getRole();
};

/**
 * Check whether the user has a specific role.
 */
export const hasRole = (role: string): boolean => {
  return storage.getRole() === role;
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