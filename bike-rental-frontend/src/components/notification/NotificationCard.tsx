import type { Notification } from "../../types/notification";
import { Bike, CreditCard, ShieldAlert, Navigation, Bell, Trash2, CheckCircle2 } from "lucide-react";
import { useNotification } from "../../hooks/useNotification";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Props {
  notification: Notification;
}

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "just now";
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
};

const NotificationCard = ({ notification }: Props) => {
  const { user } = useAuth();
  const { markAsRead, deleteNotification } = useNotification();
  const navigate = useNavigate();

  const handleCardClick = async () => {
    if (!user || !notification.notificationId) return;

    if (!notification.isRead) {
      try {
        await markAsRead(notification.notificationId, Number(user.id));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    // Determine route based on notification type and title
    const type = (notification.notificationType || "").toUpperCase();
    const title = (notification.title || "").toUpperCase();
    const role = (user.role || "CUSTOMER").toUpperCase();

    if (type === "BOOKING" || title.includes("BOOKING")) {
      if (role === "OWNER") {
        navigate("/owner/bookings");
      } else {
        navigate("/customer/bookings");
      }
    } else if (type === "PAYMENT" || title.includes("PAYMENT")) {
      if (role === "OWNER") {
        navigate("/owner/payments");
      } else {
        navigate("/customer/bookings");
      }
    } else if (
      type === "VERIFICATION" ||
      type === "BIKE_RC" ||
      title.includes("VERIFICATION") ||
      title.includes("RC")
    ) {
      if (role === "OWNER") {
        navigate("/owner/profile");
      } else {
        navigate("/customer/profile");
      }
    } else if (type === "RIDE" || title.includes("RIDE")) {
      if (role === "OWNER") {
        navigate("/owner/bookings");
      } else {
        navigate("/customer/bookings");
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !notification.notificationId) return;
    try {
      await deleteNotification(notification.notificationId, Number(user.id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getNotificationIconAndStyle = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t === "BOOKING") {
      return {
        icon: <Bike className="h-5 w-5" />,
        style: "bg-green-500/10 text-green-500",
      };
    }
    if (t === "PAYMENT") {
      return {
        icon: <CreditCard className="h-5 w-5" />,
        style: "bg-blue-500/10 text-blue-500",
      };
    }
    if (t === "VERIFICATION" || t === "BIKE_RC") {
      return {
        icon: <ShieldAlert className="h-5 w-5" />,
        style: "bg-rose-500/10 text-rose-500",
      };
    }
    if (t === "RIDE") {
      return {
        icon: <Navigation className="h-5 w-5" />,
        style: "bg-amber-500/10 text-amber-500",
      };
    }
    return {
      icon: <Bell className="h-5 w-5" />,
      style: "bg-primary/10 text-primary",
    };
  };

  const { icon, style } = getNotificationIconAndStyle(notification.notificationType);

  return (
    <div
      onClick={handleCardClick}
      className={`flex items-start justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
        !notification.isRead ? "border-primary/40 bg-primary/2" : ""
      }`}
    >
      <div className="flex gap-4 items-start">
        <div className={`p-2.5 rounded-xl ${style} shrink-0`}>
          {icon}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-sm font-bold text-foreground ${!notification.isRead ? "text-primary" : ""}`}>
              {notification.title}
            </h3>
            {!notification.isRead && (
              <span className="inline-flex items-center rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">
                Unread
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {notification.message}
          </p>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-1">
            Category: {notification.notificationType}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={async (e) => {
              e.stopPropagation();
              if (user && notification.notificationId) {
                await markAsRead(notification.notificationId, Number(user.id));
              }
            }}
            className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent/40 cursor-pointer transition"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          title="Delete Notification"
          onClick={handleDelete}
          className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 cursor-pointer transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;