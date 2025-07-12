import { Route, Routes } from "react-router-dom";
import ARWrapper from "./components/ARWrapper";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/ar/:id" element={<ARWrapper />} />
      </Routes>
    </>
  );
}
