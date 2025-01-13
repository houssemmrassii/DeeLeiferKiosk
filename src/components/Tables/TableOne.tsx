import { useEffect, useState } from 'react';
import { getDocs, collection, getDoc, query, orderBy, limit, DocumentReference } from 'firebase/firestore';
import { db } from '../../FirebaseConfig'; // Adjust to your firebase config

// Define types for the references
interface User {
  userName: string;
}

interface DeliveryMan {
  name: string;
}

interface Product {
  name: string;
}

const TableOne = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]); // Store the recent orders

  // Fetch recent orders from Firestore
  const fetchRecentOrders = async () => {
    try {
      console.log("Fetching recent orders...");

      const ordersQuery = query(collection(db, 'Commande'), orderBy('DatePAssCommande', 'desc'), limit(5));
      const querySnapshot = await getDocs(ordersQuery);
      console.log("Query snapshot fetched:", querySnapshot.docs.length, "documents found.");

      const ordersData: any[] = [];

      // Loop through orders and resolve references
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        console.log("Order data:", data);

        // Resolve the references (user, delivery man, product)
        const userRef = data.user as DocumentReference; // Document reference for user
        const deliveryManRef = data.DelivaryMan as DocumentReference; // Document reference for delivery man
        const productRef = data.Products[0]?.Product as DocumentReference; // Assuming the first product for simplicity

        // Resolve user reference
        let userName = 'Unknown User';
        try {
          const userSnapshot = await getDoc(userRef);
          const userData = userSnapshot.data() as User;
          userName = userData?.userName || 'Unknown User';
          console.log("User resolved:", userName);
        } catch (err) {
          console.error("Error resolving user:", err);
        }

        // Resolve delivery man reference
        let deliveryManName = 'Unknown Delivery Man';
        try {
          const deliveryManSnapshot = await getDoc(deliveryManRef);
          const deliveryManData = deliveryManSnapshot.data() as DeliveryMan;
          deliveryManName = deliveryManData?.name || 'Unknown Delivery Man';
          console.log("Delivery Man resolved:", deliveryManName);
        } catch (err) {
          console.error("Error resolving delivery man:", err);
        }

        // Resolve product reference
        let productName = 'Unknown Product';
        try {
          if (productRef) {
            const productSnapshot = await getDoc(productRef);
            const productData = productSnapshot.data() as Product;
            productName = productData?.name || 'Unknown Product';
            console.log("Product resolved:", productName);
          }
        } catch (err) {
          console.error("Error resolving product:", err);
        }

        // Handle the missing fields and build the order data
        ordersData.push({
          address: data.addresse?.address || 'Unknown Address',
          location: data.addresse?.location || [0, 0], // Default location if missing
          status: data.Status || 'Unknown Status',
          totalAmount: data.TotalAmount || 0,
          userName,
          deliveryManName,
          productName,
        });
      }

      setRecentOrders(ordersData); // Update state with fetched orders
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  useEffect(() => {
    fetchRecentOrders(); // Fetch recent orders when component mounts
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Recent Orders
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">User</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Address</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Total Amount</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Product</h5>
          </div>
        </div>

        {recentOrders.map((order, key) => (
          <div
            className={`grid grid-cols-4 sm:grid-cols-5 ${key === recentOrders.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{order.userName}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{order.address}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{order.status}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">${order.totalAmount.toFixed(2)}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-5">{order.productName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
