import type { Notification } from "../../types/notification";

interface Props {
  notification: Notification;
}

const NotificationCard = ({ notification }: Props) => {

  return (

    <div className="border rounded p-4 shadow">

      <h2 className="font-semibold">
        {notification.title}
      </h2>

      <p>{notification.message}</p>

      <p className="text-sm text-gray-500">
        {notification.notificationType}
      </p>

      <p className="text-sm">
        {notification.isRead ? "Read" : "Unread"}
      </p>

    </div>

  );

};

export default NotificationCard;