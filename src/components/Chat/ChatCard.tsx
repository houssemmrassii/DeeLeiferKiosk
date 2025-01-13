import { useEffect, useState } from 'react';
import { getDocs, collection, getDoc } from 'firebase/firestore';
import { db } from '../../FirebaseConfig'; // Adjust to your firebase config

interface User {
  userName: string;
  phoneNumber: string;
  email: string;
}

const ChatCard = () => {
  const [helpMessages, setHelpMessages] = useState<any[]>([]); // Store the fetched help messages
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [messagesPerPage] = useState(5); // Number of messages per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  // Fetch HelpMessages from Firestore
  const fetchHelpMessages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Helpmessage'));

      if (querySnapshot.empty) {
        console.log('No help messages found.');
        return;
      }

      const messagesData: any[] = [];

      // Loop through Firestore documents and fetch user data
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        const userRef = data.user;
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          messagesData.push({
            phoneNumber: data.PhoneNumber,
            email: data.email,
            userName: userData.userName,  // Directly using userName from the user data
            message: data.message,
          });
        } else {
          console.log('No user data found for message:', docSnapshot.id);
        }
      }

      setHelpMessages(messagesData); // Update the state with the fetched messages
      setTotalPages(Math.ceil(messagesData.length / messagesPerPage)); // Set total pages
    } catch (error) {
      console.error('Error fetching HelpMessages:', error);
    }
  };

  // Fetch help messages when component mounts
  useEffect(() => {
    fetchHelpMessages();
  }, []);

  // Logic for displaying messages for the current page
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = helpMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Previous page
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">Help Messages</h4>
      
      <div>
        {currentMessages.length === 0 ? (
          <p>No messages available.</p>
        ) : (
          currentMessages.map((message, key) => (
            <div key={key} className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4">
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {message.userName} {/* Directly displaying userName */}
                  </h5>
                  <p className="text-sm text-black dark:text-white">
                    <strong>Email:</strong> {message.email || 'N/A'}
                  </p>
                  <p className="text-sm text-black dark:text-white">
                    <strong>Phone:</strong> {message.phoneNumber || 'N/A'}
                  </p>
                  <p>
                    <span className="text-sm text-black dark:text-white">
                      <strong>Message:</strong> {message.message || 'No message'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => paginate(1)} 
          disabled={currentPage === 1} 
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300">
          First
        </button>

        <button 
          onClick={previousPage} 
          disabled={currentPage === 1} 
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300">
          Previous
        </button>

        <span className="px-3 py-2 text-black dark:text-white">Page {currentPage} of {totalPages}</span>

        <button 
          onClick={nextPage} 
          disabled={currentPage === totalPages} 
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300">
          Next
        </button>

        <button 
          onClick={() => paginate(totalPages)} 
          disabled={currentPage === totalPages} 
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300">
          Last
        </button>
      </div>
    </div>
  );
};

export default ChatCard;
