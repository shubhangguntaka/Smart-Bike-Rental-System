export type NotificationType =
  | "SYSTEM"
  | "BOOKING"
  | "PAYMENT"
  | "BIKE"
  | "VERIFICATION"
  | "RIDE";

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationDTO {
  userId: number;
  title: string;
  message: string;
  notificationType: NotificationType;
}
