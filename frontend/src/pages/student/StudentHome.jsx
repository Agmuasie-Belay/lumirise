import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Modules from "./Modules";
import Journal from "./Journal";
import CourseCompletionCertificate from "../../components/utils/CourseCompletion";
import Profile from "./profile/Profile";
import ViewModuleDetails from "../../components/Module/ViewModuleDetails";
import ModulePage from "../../components/Module/ModulePage";
const StudentHome = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />{" "}
      {/* default */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="modules" element={<Modules />} />
      <Route path="journal" element={<Journal />} />
      <Route path="profile" element={<Profile />} />
      <Route path="certifications/:moduleId" element={<CourseCompletionCertificate />} />
      <Route path="module/:id" element={<ViewModuleDetails />} />
      <Route path="modulepage/:id" element={<ModulePage />} />
      {/* <Route path="activity" element={<RecentActivity />} /> */}
    </Routes>
  );
};

export default StudentHome;
