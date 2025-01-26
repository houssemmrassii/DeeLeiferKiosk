import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import { toast } from "react-toastify";
import { TrashIcon } from "@heroicons/react/24/outline";

interface User {
  uid: string;
  firstName: string;
  secondName: string;
  email: string;
  phone_number: string;
  photo_url: string;
  totalSpent?: number;
  blocked?: boolean;
}

interface Command {
  user: string; // user UID
  TotalAmount: number;
}

const ListUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<() => void>(() => {});

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
            blocked: data.blocked || false, // Check if the user is blocked
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

  // Function to block a user with modal confirmation
  const blockUser = async (uid: string) => {
    
  
    try {
      const userRef = doc(db, "users", uid); // Reference to the user document
      console.log("Attempting to block user:", uid); // Log UID
  
      await updateDoc(userRef, { blocked: true }); // Update the 'blocked' field to true
      console.log("User blocked successfully:", uid); // Log success
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, blocked: true } : user
        )
      );
      toast.success("User blocked successfully.");
    } catch (error) {
      console.error("Error blocking user:", error); // Log error
      toast.error("Failed to block user. Check permissions.");
    }
  };
  

  // Function to unblock a user
  const unblockUser = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { blocked: false });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, blocked: false } : user
        )
      );
      toast.success("User unblocked successfully.");
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user.");
    }
  };

  // Show confirmation modal
  const handleAction = (uid: string, isBlocked: boolean) => {
    const message = isBlocked
      ? "Are you sure you want to unblock this user?"
      : "Are you sure you want to block this user? This action cannot be undone.";
    setModalMessage(message);
    setModalAction(() => () => (isBlocked ? unblockUser(uid) : blockUser(uid)));
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-[#0a100d]">
      <Breadcrumb pageName="Clients List" />
      {loading ? (
        <p className="text-center text-gray-700 dark:text-gray-300">Loading...</p>
      ) : (
        <>
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
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className={`border-t ${
                      user.blocked
                        ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300"
                        : "hover:bg-gray-100 dark:hover:bg-[#2a2c2a]"
                    }`}
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
                    <td className="px-4 py-3">
                      {`${user.firstName} ${user.secondName}`}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone_number}</td>
                    <td className="px-4 py-3">${user.totalSpent?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAction(user.uid, user.blocked!)}
                        className={`text-${
                          user.blocked ? "blue-500 hover:text-blue-700" : "red-500 hover:text-red-700"
                        }`}
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-[#1c1f1d] p-6 rounded-lg shadow-lg">
                <p className="text-gray-800 dark:text-gray-200">{modalMessage}</p>
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      modalAction();
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListUsers;
