export const Role = {
  CUSTOMER: "CUSTOMER",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;

export type Role = typeof Role[keyof typeof Role];