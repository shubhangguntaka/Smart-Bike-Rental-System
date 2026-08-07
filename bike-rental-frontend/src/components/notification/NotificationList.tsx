import type { Notification } from "../../types/notification";
import NotificationCard from "./NotificationCard";

interface Props {
  notifications: Notification[];
}

const NotificationList = ({ notifications }: Props) => {

  return (

    <div className="space-y-4">

      {notifications.map((notification) => (

        <NotificationCard
          key={notification.notificationId}
          notification={notification}
        />

      ))}

    </div>

  );

};

export default NotificationList;