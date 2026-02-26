import { Routes, Route, Navigate } from "react-router-dom";
import TutorDashboard from "./TutorDashboard";
import ModuleStudent from "./ModuleStudents";

import MyModules from "./ModuleListTable";
import TutorAllStudents from "./TutorAllStudents";
import TutorTaskReview from "./TutorTaskReview";
const TutorHome = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} /> {/* default */}
      <Route path="dashboard" element={<TutorDashboard />} />
      <Route path="modules" element={<MyModules />} />
      <Route path="all-students" element={<TutorAllStudents />} />
      <Route path="enrollment/:enrollmentId" element={<TutorTaskReview />} />
     {/* <Route path="activity" element={<RecentActivity />} /> */}
    </Routes>
  );
};

export default TutorHome;
