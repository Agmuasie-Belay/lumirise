import { Box, useColorModeValue } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

import CreatePage from "./components/Module/CreatePage";
import EditModule from "./components/Module/EditModule";
import ViewModuleDetails from "./components/Module/ViewModuleDetails";

// Role-specific dashboards
import StudentHome from "./pages/student/StudentHome";
import TutorHome from "./pages/tutor/TutorHome";
import Layout from "./components/layout/Layout";
import AdminHome from "./pages/admin/AdminHome";
import Journal from "./pages/student/Journal";
import ModulePage from "./components/Module/ModulePage";
import About from "./pages/landing/About";

// ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = JSON.parse(localStorage.getItem("role"));
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/about" element={<About />} />
        {/* Module management */}
        <Route path="/create-module" element={<CreatePage />} />
        <Route path="/edit-module/:id" element={<EditModule />} />
        

        {/* Student routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Layout role="student">
                <StudentHome />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Tutor routes */}
        <Route
          path="/tutor/*"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <Layout role="tutor">
                <TutorHome />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout role="admin">
                <AdminHome />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
