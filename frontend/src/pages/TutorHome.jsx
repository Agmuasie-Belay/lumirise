import { Routes, Route, Navigate } from "react-router-dom";
import TutorDashboard from "./tutor/TutorDashboard";
import Student from "./tutor/Students";

import MyModules from "./tutor/MyModules";
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
