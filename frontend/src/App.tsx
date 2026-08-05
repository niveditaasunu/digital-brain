import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Brain from "./pages/Brain";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/brain" element={<Brain />} />
      </Routes>
    </BrowserRouter>
  );
}
