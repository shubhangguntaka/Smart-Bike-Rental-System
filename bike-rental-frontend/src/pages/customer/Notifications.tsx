import NotificationBadge from "../../components/notification/NotificationBadge";
import NotificationList from "../../components/notification/NotificationList";
import { useNotification } from "../../hooks/useNotification";

const Notifications = () => {

    const {

        notifications,
        unreadCount,
        loading,
        error

    } = useNotification();

    if (loading)
        return <h2>Loading...</h2>;

    if (error)
        return <h2>{error}</h2>;

    return (

        <div className="max-w-5xl mx-auto p-6">

            <h1 className="text-3xl font-bold mb-6">
                Notifications
            </h1>

            <NotificationBadge unreadCount={unreadCount} />

            <div className="mt-6">

                <NotificationList
                    notifications={notifications}
                />

            </div>

        </div>

    );

};

export default Notifications;