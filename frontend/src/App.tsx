import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import SubmissionsList from './pages/SubmissionsList';
import NewSubmission from './pages/NewSubmission';
import SubmissionDetail from './pages/SubmissionDetail';
import CrmPipeline from './pages/CrmPipeline';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="submissions" element={<SubmissionsList />} />
          <Route path="submissions/new" element={<NewSubmission />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="pipeline" element={<CrmPipeline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
