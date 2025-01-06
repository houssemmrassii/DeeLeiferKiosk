import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../FirebaseConfig"; // Ensure FirebaseConfig has auth and db exports
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "Admin", // Default role
        createdAt: new Date(),
      });

      setLoading(false);
      navigate("/auth/signin"); // Redirect to Sign In page
    } catch (error: any) {
      setLoading(false);
      setError(error.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="w-full">
        <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Sign Up
          </h2>

          <form onSubmit={handleSignUp}>
            {error && <p className="mb-4 text-red-500">{error}</p>}

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p>
                Already have an account?{" "}
                <Link to="/auth/signin" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
