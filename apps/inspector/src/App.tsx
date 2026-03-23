import { Routes, Route } from "react-router";

import { useWebSocket } from "~/hooks/useWebSocket";
import Layout from "~/components/Layout";
import Dashboard from "~/pages/Dashboard";
import RequestDetail from "~/pages/RequestDetail";
import MockPage from "~/pages/MockPage";
import DiffPage from "~/pages/DiffPage";

export default function App() {
  // Connect to the inspector WebSocket for live updates.
  useWebSocket();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="mock" element={<MockPage />} />
        <Route path="diff" element={<DiffPage />} />
      </Route>
    </Routes>
  );
}
