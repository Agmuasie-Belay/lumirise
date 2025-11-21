import { Routes, Route, Navigate } from "react-router-dom";
import TutorDashboard from "./TutorDashboard";
import Student from "./Students";

import MyModules from "./MyModules";
const TutorHome = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} /> {/* default */}
      <Route path="dashboard" element={<TutorDashboard />} />
      <Route path="modules" element={<MyModules />} />
      <Route path="students" element={<Student />} />
     {/* <Route path="activity" element={<RecentActivity />} /> */}
    </Routes>
  );
};

export default TutorHome;
