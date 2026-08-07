interface Props {
  unreadCount: number;
}

const NotificationBadge = ({ unreadCount }: Props) => {

  return (

    <div className="bg-red-600 text-white rounded-full px-3 py-1 inline-block">

      🔔 {unreadCount} New Notifications

    </div>

  );

};

export default NotificationBadge;