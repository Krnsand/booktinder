import { Suspense, lazy } from "react";
import type { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import { useAuth } from "./context/AuthContext";
import Spinner from "./components/Spinner";
const Browse = lazy(() => import("./pages/Browse"));
const Discover = lazy(() => import("./pages/Discover"));
const Library = lazy(() => import("./pages/Library"));
const Profile = lazy(() => import("./pages/Profile"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Welcome = lazy(() => import("./pages/Welcome"));

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="spinner-container">
            <Spinner label="Loading page..." />
          </div>
        }
      >
        <main role="main">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/welcome"
              element={
                <RequireAuth>
                  <Welcome />
                </RequireAuth>
              }
            />
            <Route
              path="/preferences"
              element={
                <RequireAuth>
                  <Browse />
                </RequireAuth>
              }
            />
            <Route
              path="/discover"
              element={
                <RequireAuth>
                  <Discover />
                </RequireAuth>
              }
            />
            <Route
              path="/library"
              element={
                <RequireAuth>
                  <Library />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/book/:id"
              element={
                <RequireAuth>
                  <BookDetail />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </Suspense>
    </BrowserRouter>
  );
}