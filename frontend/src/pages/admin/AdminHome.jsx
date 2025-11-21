import { Routes, Route, Navigate } from "react-router-dom";
import DashboardStats from "./DashboardStats";
import ModulesManagement from "./ModulesManagement";
import TutorsManagement from "./TutorsManagement";
import StudentsManagement from "./StudentsManagement";
import RecentActivity from "./RecentActivity";
import ReportsAnalytics from "./ReportsAnalytics";

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
