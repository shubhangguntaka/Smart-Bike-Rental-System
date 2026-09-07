export interface Notification {
  notificationId?: number;
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  createdAt?: string;
}

export interface NotificationDTO {
  notificationId?: number;
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
}

export type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "VERIFICATION"
  | "BIKE_RC"
  | "BIKE"
  | "RIDE"
  | "REVIEW"
  | "SYSTEM";