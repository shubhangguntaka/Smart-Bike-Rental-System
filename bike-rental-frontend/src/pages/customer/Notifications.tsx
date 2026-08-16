import { useNotification } from "../../hooks/useNotification";
import NotificationCard from "../../components/notification/NotificationCard";
import { Bell, Loader2, RefreshCw } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead
  } = useNotification();

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unreadList = notifications.filter((n) => !n.isRead);
    for (const n of unreadList) {
      if (n.notificationId) {
        await markAsRead(n.notificationId, Number(user.id));
      }
    }
  };

  const handleRefresh = () => {
    if (user) {
      refreshNotifications(Number(user.id));
    }
  };

  return (
    <div className="space-y-6 text-foreground min-h-screen pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Notification History</h2>
            <p className="text-xs text-muted-foreground mt-1">
              View and manage all past alerts, booking requests, and updates.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex-1 sm:flex-initial px-4 py-2 border border-border bg-card text-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/30"
            >
              Clear All Badges
            </button>
          )}
        </div>
      </div>

      {/* Main notifications container */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm min-h-[50vh]">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">Loading notification logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-sm text-destructive font-semibold">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl hover:opacity-90 active:scale-95 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notificationId}
                notification={notification}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <Bell className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">All Clear!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              No notifications found in your account history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;