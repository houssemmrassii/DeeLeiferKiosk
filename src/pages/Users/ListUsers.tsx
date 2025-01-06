import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";

interface User {
  uid: string;
  firstName: string;
  secondName: string;
  email: string;
  phone_number: string;
  photo_url: string;
  totalSpent?: number;
}

interface Command {
  user: string; // user UID
  TotalAmount: number;
}

const ListUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsersAndCommands = async () => {
      setLoading(true);
      try {
        // Fetch all users with role 'Client'
        const userQuery = query(
          collection(db, "users"),
          where("role", "==", "Client")
        );
        const userSnapshot = await getDocs(userQuery);

        const usersData: User[] = userSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            firstName: data.firstName || "",
            secondName: data.secondName || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
            photo_url: data.photo_url || "",
          };
        });

        // Fetch all commands
        const commandSnapshot = await getDocs(collection(db, "Commande"));
        const commandsData: Command[] = commandSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            user: data.user?.path.split("/").pop() || "",
            TotalAmount: data.TotalAmount || 0,
          };
        });

        // Calculate total spent for each user
        const userWithSpending = usersData.map((user) => {
          const totalSpent = commandsData
            .filter((cmd) => cmd.user === user.uid)
            .reduce((acc, cmd) => acc + cmd.TotalAmount, 0);
          return { ...user, totalSpent };
        });

        setUsers(userWithSpending);
      } catch (error) {
        console.error("Error fetching users or commands:", error);
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndCommands();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <Breadcrumb pageName="Clients List" />
      {loading ? (
        <p className="text-center text-gray-700 dark:text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-center">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#1c1f1d]">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Picture
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.uid}
                  className="border-t hover:bg-gray-100 dark:hover:bg-[#2a2c2a]"
                >
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <img
                        src={
                          user.photo_url ||
                          "https://via.placeholder.com/50" // Placeholder for missing photos
                        }
                        alt={user.firstName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-white">
                    {`${user.firstName} ${user.secondName}`}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-white">
                    {user.phone_number}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-white">
                    ${user.totalSpent?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListUsers;
