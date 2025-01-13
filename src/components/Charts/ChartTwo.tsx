import React, { useState, useEffect } from 'react';
import { db } from '../../FirebaseConfig';  // Assuming you're using Firebase for data fetching
import { collection, getDocs, query, where } from 'firebase/firestore';

interface DeliveryMan {
  uid: string;
  display_name: string;
  photo_url: string;
  ShippingScore: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<DeliveryMan[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch users with role 'Delivery_Man'
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'Delivery_Man')
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const deliveryMenData: DeliveryMan[] = usersSnapshot.docs.map((doc) => {
          const data = doc.data() as DeliveryMan;
          return {
            uid: doc.id,
            display_name: data.display_name,
            photo_url: data.photo_url,
            ShippingScore: data.ShippingScore || 0, // Assuming ShippingScore is in the user's data
          };
        });

        // Sort by ShippingScore in descending order
        const sortedLeaderboard = deliveryMenData
          .sort((a, b) => b.ShippingScore - a.ShippingScore)
          .slice(0, 3); // Get top 3 delivery men

        setLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
        Top 3 Delivery Men
      </h4>

      <div>
        {leaderboard.map((deliveryMan, index) => (
          <div key={deliveryMan.uid} className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src={deliveryMan.photo_url} alt={deliveryMan.display_name} className="w-full h-full object-cover" />
            </div>
            <div className="ml-4">
              <h5 className="text-lg font-semibold">{deliveryMan.display_name}</h5>
              <p className="text-sm text-gray-600">Shipping Score: {deliveryMan.ShippingScore}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
