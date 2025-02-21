import { Routes, Route } from "react-router-dom";
import EmployeePortal from "./pages/EmployeePortal.tsx";

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/ticket" element={<EmployeePortal />} />
      </Routes>
    </div>
  );
};

export default App;
