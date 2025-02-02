import { useEffect, useState } from "react";
import { auth, db } from "../../FirebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

const Profile = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Email & Password Fields
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // Profile Image
  const [profileImage, setProfileImage] = useState<string>("");

  // Default Placeholder Image
  const placeholderImage = "https://via.placeholder.com/150?text=Profile";

  // ✅ Fetch Admin Data & Ensure Auth is Loaded
  useEffect(() => {
    console.log("📢 Fetching admin data...");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ User is authenticated:", user);

        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          console.log("✅ Admin data found in Firestore:", userData);

          setAdminData(userData);
          setProfileImage(userData.photo_url || placeholderImage);

          // Save in localStorage
          localStorage.setItem("authenticatedUser", JSON.stringify(userData));
        } else {
          console.warn("⚠️ No Firestore data found for user.");
          setError("User data not found.");
        }
      } else {
        console.warn("⚠️ No authenticated user found.");
        setError("No authenticated user found.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Upload Profile Picture (Ensuring Authenticated User)
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (!auth.currentUser) {
      setError("You need to be logged in to change the profile picture.");
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // ✅ Update Firestore & LocalStorage
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photo_url: downloadURL });

      const updatedUser = { ...adminData, photo_url: downloadURL };
      setAdminData(updatedUser);
      localStorage.setItem("authenticatedUser", JSON.stringify(updatedUser));

      setProfileImage(downloadURL);
      setSuccessMessage("Profile picture updated successfully!");
    } catch (err) {
      setError("Error uploading profile picture.");
    }
  };

  // ✅ Update Email (Only Authenticated Users)
  const handleUpdateEmail = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!auth.currentUser) {
      setError("No authenticated user found.");
      setLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updateEmail(auth.currentUser, newEmail);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { email: newEmail });

      const updatedUser = { ...adminData, email: newEmail };
      setAdminData(updatedUser);
      localStorage.setItem("authenticatedUser", JSON.stringify(updatedUser));

      setSuccessMessage("Email updated successfully!");
      setShowEmailModal(false);
    } catch (err) {
      setError("An error occurred while updating email.");
    }

    setLoading(false);
  };

  // ✅ Update Password (Only Authenticated Users)
  const handleUpdatePassword = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!auth.currentUser) {
      setError("No authenticated user found.");
      setLoading(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);
      setSuccessMessage("Password updated successfully!");
      setShowPasswordModal(false);
    } catch (err) {
      setError("An error occurred while updating password.");
    }

    setLoading(false);
  };

  if (loading) return <p className="text-center text-gray-600">Loading Profile...</p>;

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="rounded-sm border border-stroke bg-white shadow-md p-6 text-center">
        {/* Profile Image Upload */}
        <div className="relative mx-auto h-32 w-32 rounded-full">
          <img 
            src={profileImage} 
            onError={(e) => (e.currentTarget.src = placeholderImage)}
            alt="Profile" 
            className="rounded-full border w-full h-full object-cover"
          />
          
          {/* Upload Button */}
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer text-white">
            📷
            <input type="file" id="profile-upload" className="hidden" onChange={handleProfilePictureUpload} />
          </label>
        </div>

        {/* User Info */}
        <h3 className="mt-4 text-2xl font-semibold text-gray-800">{adminData?.firstName} {adminData?.secondName || ""}</h3>
        <p className="font-medium text-gray-600">{adminData?.role || "Admin"}</p>

        {/* Edit Buttons */}
        <div className="flex justify-center mt-6 space-x-4">
          <button onClick={() => setShowEmailModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            ✉ Edit Email
          </button>
          <button onClick={() => setShowPasswordModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            🔒 Change Password
          </button>
        </div>
      </div>

      {/* ✅ Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Email</h2>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <button onClick={handleUpdateEmail} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Update Email</button>
            <button onClick={() => setShowEmailModal(false)} className="mt-2 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
