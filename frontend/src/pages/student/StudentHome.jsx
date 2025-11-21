import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Modules from "./Modules";
import Journal from "./Journal";

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
