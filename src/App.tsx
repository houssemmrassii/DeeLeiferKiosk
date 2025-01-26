import { useEffect, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

import Loader from "./common/Loader";
import PageTitle from "./components/PageTitle";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";

import ECommerce from "./pages/Dashboard/ECommerce";

import DefaultLayout from "./layout/DefaultLayout";
import AddDeliveryman from "./pages/Delivery_man/AddDeveryman";
import ListDeliveryman from "./pages/Delivery_man/ListDeleveryman";
import ListTypes from "./pages/Type/ListTypes";
import ListCategories from "./pages/Category/ListCategory";
import AddCategoryModal from "./pages/Category/AddCategoryModal";
import AddProductPage from "./pages/Product/AddProduct";
import ListProduct from "./pages/Product/ListProduct";
import EditProduct from "./pages/Product/ModifierProduct";
import DetailsProduct from "./pages/Product/DetailsProduct";
import AddPromotion from "./pages/Promotion/AddPromotion";
import ListPromotion from "./pages/Promotion/ListPromotion";
import EditPromotion from "./pages/Promotion/UpdatePromotion";
import CommandTable from "./pages/Command/ListCommand";
import CommandDetail from "./pages/Command/CommandDetail";
import ListUsers from "./pages/Users/ListUsers";
import AddZone from "./pages/Zone/AddZone";
import ListZones from "./pages/Zone/ListZone";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null); // State for the current user
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    // Retrieve authenticated user from localStorage
    const authenticatedUser = localStorage.getItem("authenticatedUser");
    if (authenticatedUser) {
      setCurrentUser(JSON.parse(authenticatedUser));
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Function to protect routes
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!currentUser) {
      return <Navigate to="/auth/signin" replace />;
    }
    return children;
  };

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      {/* Auth Routes without DefaultLayout */}
      <Route
        path="/auth/signin"
        element={
          <>
            <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignIn setCurrentUser={setCurrentUser} />
          </>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <>
            <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
            <SignUp />
          </>
        }
      />

      {/* Protected Routes within DefaultLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DefaultLayout>
              <Routes>
                <Route
                  index
                  element={
                    <>
                      <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ECommerce />
                    </>
                  }
                />
                <Route
                  path="/AddDeliveryman"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <AddDeliveryman />
                    </>
                  }
                />
                <Route
                  path="/ListDeliveryman"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListDeliveryman />
                    </>
                  }
                />
                <Route
                  path="/ListTypes"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListTypes />
                    </>
                  }
                />
                <Route
                  path="/ListUsers"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListUsers />
                    </>
                  }
                />
                <Route
                  path="/ListCategories"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListCategories />
                    </>
                  }
                />
                <Route
                  path="/AddCategoryModal"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <AddCategoryModal
                        onClose={function (): void {
                          throw new Error("Function not implemented.");
                        }}
                        onSuccess={function (): void {
                          throw new Error("Function not implemented.");
                        }}
                      />
                    </>
                  }
                />
                <Route
                  path="/AddProductPage"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <AddProductPage />
                    </>
                  }
                />
                <Route
                  path="/ListProduct"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListProduct />
                    </>
                  }
                />
                <Route
                  path="/EditProduct/:id"
                  element={
                    <>
                      <PageTitle title="Edit Product | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <EditProduct />
                    </>
                  }
                />
                <Route
                  path="/ProductDetails/:id"
                  element={
                    <>
                      <PageTitle title="Product Details | Your App Name" />
                      <DetailsProduct />
                    </>
                  }
                />
                <Route
                  path="/AddPromotion"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <AddPromotion />
                    </>
                  }
                />
                <Route
                  path="/ListPromotion"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListPromotion />
                    </>
                  }
                />
                <Route path="/EditPromotion/:id" element={<EditPromotion />} />
                <Route path="/CommandDetail/:id" element={<CommandDetail />} />
                <Route
                  path="/CommandTable"
                  element={
                    <>
                      <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <CommandTable />
                    </>
                  }
                />
                <Route
                  path="/AddZone"
                  element={
                    <>
                      <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <AddZone />
                    </>
                  }
                />
                <Route
                  path="/ListZones"
                  element={
                    <>
                      <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ListZones />
                    </>
                  }
                />
              </Routes>
            </DefaultLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
