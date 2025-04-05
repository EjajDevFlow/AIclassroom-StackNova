import React from "react";
import { Routes, Route } from "react-router-dom";
import Body from "./Components/Body";
import Home from "./Components/Home";
import Classroom from "./Components/Classroom";
import ClassHome from "./Components/ClassHome";
import CreateClass from "./Components/createClass";
import Settings from "./Components/Settings";
import Login from "./Components/Login";
import { useSelector } from "react-redux";
import JoinClassroom from "./Components/JoinClassroom";
import CreateAssignment from "./Components/CreateAssignments";
import AssignmentList from "./Components/AssignmentList";
import AssignmentDetails from "./Components/AssignmentDetails";
import MainSection from "./Components/MainSection";
import AssignmentMain from "./Components/AssignmentMain";
import PeopleSection from "./Components/PeopleSection";
import AttendanceMain from "./Components/Attendance/AttendanceMain";
import Attendance from "./Components/Attendance/Attendance";
import MonthlyAttendance from "./Components/Attendance/MonthlyAttendance";

function App() {
  const user = useSelector((store) => store.appSlice.user);
  if (!user) {
    return <Login />;
  }
  return (
    <Routes>
      <Route path="/" element={<Body />}>
        <Route index element={<Home />} />
        <Route path="classroom" element={<Classroom />} />
        <Route path="classroom/:classId" element={<ClassHome />}>
          <Route index element={<MainSection />} />
          {/* Assignment related routes */}
          <Route path="assignments" element={<AssignmentMain />}>
            <Route index element={<AssignmentList />} />
            <Route path=":assignmentId" element={<AssignmentDetails />} />
            <Route path="create-assignment" element={<CreateAssignment />} />
          </Route>

          {/* People related routes */}
          <Route path="people" element={<PeopleSection />} />
          {/* Attendance related routes */}
          <Route path="attendance" element={<AttendanceMain />} />
          <Route path="attendance/:date" element={<Attendance />} />
          <Route
            path="attendance/monthly/:month"
            element={<MonthlyAttendance />}
          />
        </Route>
        <Route path="createClass" element={<CreateClass />} />
        <Route path="joinClass" element={<JoinClassroom />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
