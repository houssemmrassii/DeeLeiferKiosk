import { useEffect, useState } from 'react';
import { getDocs, collection, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

// Define types for Firestore references
interface User {
  firstName?: string;
  secondName?: string;
  display_name?: string;
}

interface Product {
  name: string;
}

const TableOne = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Fetch recent orders from Firestore
  const fetchRecentOrders = async () => {
    try {
      const ordersQuery = query(collection(db, 'Commande'), orderBy('DatePAssCommande', 'desc'), limit(5));
      const querySnapshot = await getDocs(ordersQuery);

      const ordersData: any[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        // Resolve user reference
        let userName = 'Unknown User';
        if (data.user) {
          try {
            const userSnapshot = await getDoc(data.user);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data() as User;
              userName = userData?.firstName && userData?.secondName
                ? `${userData.firstName} ${userData.secondName}`
                : userData?.display_name || 'Unknown User';
            } else {
              console.warn("User document does not exist for:", data.user.path);
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        }

        // Resolve product references and count number of items purchased
        let totalProductsPurchased = 0;
        if (Array.isArray(data.Products)) {
          for (const productEntry of data.Products) {
            totalProductsPurchased += productEntry.Quantity || 1;
          }
        }

        // Resolve status
        const orderStatus = data.status || 'Unknown Status';

        // Handle the missing fields and build the order data
        ordersData.push({
          address: data.addresse?.address || 'Unknown Address',
          status: orderStatus,
          totalAmount: data.TotalAmount || 0,
          userName,
          totalProductsPurchased,
        });
      }

      setRecentOrders(ordersData);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  return (
    <div className="rounded-lg border border-stroke bg-white px-5 py-5 shadow-md dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h4>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">User</th>
              <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 w-1/3">Address</th>
              <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">Total</th>
              <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">Items</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-3 py-2 text-gray-900 dark:text-white">{order.userName}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white truncate max-w-xs">{order.address}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-900 dark:text-white">€{order.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{order.totalProductsPurchased} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOne;
