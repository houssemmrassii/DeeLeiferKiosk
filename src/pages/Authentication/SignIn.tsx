import React, { useState } from 'react';
import { db } from '../../FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

// Define props type
interface SignInProps {
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>; // Update type as necessary
}

const SignIn: React.FC<SignInProps> = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading

    console.log('Attempting to sign in with email:', email);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      console.log('Query Snapshot:', querySnapshot);

      if (querySnapshot.empty) {
        console.log('No user found with the provided email.');
        setError('Invalid email or password.');
        toast.error('Invalid email or password.', { position: toast.POSITION.TOP_CENTER });
        setLoading(false); // Stop loading
        return;
      }

      const user = querySnapshot.docs[0].data();
      console.log('User data retrieved:', user);

      if (user.role === 'Admin' && user.password === password) {
        console.log('User authenticated successfully:', user);

        // Set the authenticated user
        setCurrentUser(user);

        // Save user data to localStorage
        localStorage.setItem('authenticatedUser', JSON.stringify(user));

        toast.success(`Welcome, ${user.firstName} ${user.secondName || ''}!`, {
          position: toast.POSITION.TOP_CENTER,
        });
        navigate('/'); // Redirect admin to dashboard
      } else {
        console.log(
          'Access denied. Role mismatch or invalid password.',
          `Role: ${user.role}, Password Match: ${user.password === password}`
        );
        toast.error(
          user.role !== 'Admin'
            ? 'Access denied. Only admin users can log in.'
            : 'Invalid email or password.',
          { position: toast.POSITION.TOP_CENTER }
        );
      }
    } catch (error: any) {
      console.error('Error during sign in:', error);
      setError('An error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f0e5' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-black">Sign In</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
              required
              disabled={loading} // Disable input during loading
            />
          </div>

          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary"
              required
              disabled={loading} // Disable input during loading
            />
          </div>

          <div className="mb-5">
            <button
              type="submit"
              className={`w-full cursor-pointer rounded-lg p-4 text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-opacity-90'
              }`}
              disabled={loading} // Disable button during loading
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p>
            Don’t have an account?{' '}
            <Link to="/auth/signup" className="text-primary">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
