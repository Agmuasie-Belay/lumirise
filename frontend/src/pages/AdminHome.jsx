import { Routes, Route, Navigate } from "react-router-dom";
import DashboardStats from "./admin/DashboardStats";
import ModulesManagement from "./admin/ModulesManagement";
import TutorsManagement from "./admin/TutorsManagement";
import StudentsManagement from "./admin/StudentsManagement";
import RecentActivity from "./admin/RecentActivity";
import ReportsAnalytics from "./admin/ReportsAnalytics";

const AdminHome = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} /> {/* default */}
      <Route path="dashboard" element={<DashboardStats />} />
      <Route path="modules" element={<ModulesManagement />} />
      <Route path="tutors" element={<TutorsManagement />} />
      <Route path="students" element={<StudentsManagement />} />
      <Route path="activity" element={<RecentActivity />} />
      <Route path="reports" element={<ReportsAnalytics />} />
    </Routes>
  );
};

export default AdminHome;
