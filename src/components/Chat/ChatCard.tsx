import { useEffect, useState } from 'react';
import { getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

interface Promotion {
  code: string;
  title: string;
  dateEnd: Timestamp;
}

const ActivePromotionCard = () => {
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);

  // Fetch Active Promotions
  const fetchActivePromotions = async () => {
    try {
      const promotionsSnapshot = await getDocs(collection(db, 'Promotion'));
      const now = Timestamp.now();

      console.log("🔥 Debug: Fetched Promotions from Firestore →", promotionsSnapshot.docs.map(doc => doc.data()));

      const validPromotions: Promotion[] = promotionsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            code: data.code || "N/A",
            title: data.title || "No Title",
            dateEnd: data.dateEnd as Timestamp, // Ensure it's a Firestore timestamp
          };
        })
        .filter(promo => promo.dateEnd) // Check that the date exists
        .filter(promo => promo.dateEnd.toMillis() >= now.toMillis()) // Check if promotion is still active
        .sort((a, b) => a.dateEnd.toMillis() - b.dateEnd.toMillis()); // Sort by closest end date

      console.log("✅ Debug: Active Promotions After Filtering →", validPromotions);

      if (validPromotions.length > 0) {
        setActivePromotions(validPromotions);
      } else {
        console.warn("⚠️ No active promotions found.");
      }
    } catch (error) {
      console.error('❌ Error fetching promotions:', error);
    }
  };

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  return (
    <div className="col-span-12 xl:col-span-4 bg-white shadow-lg rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Promotions</h3>

      {activePromotions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Title</th>
                <th className="px-4 py-2 text-left text-gray-700">Code</th>
                <th className="px-4 py-2 text-left text-gray-700">End Date</th>
              </tr>
            </thead>
            <tbody>
              {activePromotions.map((promo, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{promo.title}</td>
                  <td className="px-4 py-2 font-mono text-blue-600">{promo.code}</td>
                  <td className="px-4 py-2">{promo.dateEnd.toDate().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">No Active Promotions</p>
      )}
    </div>
  );
};

export default ActivePromotionCard;
