import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Brain from "./pages/Brain";
import Timeline from "./pages/Timeline";
import Insights from "./pages/Insights";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Digital brain */}
        <Route
          path="/brain"
          element={<Brain />}
        />

        {/* Brain timeline */}
        <Route
          path="/timeline"
          element={<Timeline />}
        />

        {/* Brain insights */}
        <Route
          path="/insights"
          element={<Insights />}
        />

      </Routes>

    </BrowserRouter>
  );
}