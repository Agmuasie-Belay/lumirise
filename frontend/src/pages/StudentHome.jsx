import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./student/Dashboard";
import Modules from "./student/Modules";
import Journal from "./student/Journal";

const StudentHome = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} /> {/* default */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="modules" element={<Modules />} />
      <Route path="journal" element={<Journal />} />
     {/* <Route path="activity" element={<RecentActivity />} /> */}
    </Routes>
  );
};

export default StudentHome;
