export interface Notification {
  notificationId?: number;
  id?: number;
  userId: number;
  title: string;
  message: string;
  type?: "BOOKING" | "PAYMENT" | "VERIFICATION" | "REVIEW" | "SYSTEM" | string;
  isRead: boolean;
  referenceId?: number;
  createdAt: string;
}
