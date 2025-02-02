import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';
import ClickOutside from '../ClickOutside';

interface Notification {
  id: string;
  message: string;
  date: Timestamp;
  type: 'user' | 'command';
  seen: boolean;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const notificationsQuery = query(collection(db, 'Notifications'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const fetchedNotifications: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(fetchedNotifications);
      setUnseenCount(fetchedNotifications.filter((notif) => !notif.seen).length);
    });

    return () => unsubscribe();
  }, []);

  const markNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, seen: true })));
    setUnseenCount(0);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <button
          onClick={() => {
            markNotificationsAsRead();
            setDropdownOpen(!dropdownOpen);
          }}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          {/* Notification Indicator */}
          {unseenCount > 0 && (
            <span className="absolute -top-0.5 right-0 z-1 h-4 w-4 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
              {unseenCount}
            </span>
          )}

          {/* Bell Icon */}
          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
              fill=""
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 flex h-auto max-h-80 w-80 flex-col rounded-sm border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark sm:right-0">
            <div className="px-4.5 py-3 border-b border-stroke dark:border-strokedark">
              <h5 className="text-sm font-medium text-bodydark2">Notifications</h5>
            </div>

            <ul className="flex flex-col overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li key={notif.id}>
                    <Link
                      className="flex flex-col gap-2.5 border-b border-stroke px-4.5 py-3 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-gray-800"
                      to="#"
                    >
                      <p className="text-sm">
                        <span className="text-black dark:text-white">
                          {notif.type === 'user' ? 'New User Added' : 'New Order Received'}
                        </span>{' '}
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(notif.date.toMillis()).toLocaleString()}</p>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-sm text-gray-500">No new notifications</li>
              )}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
