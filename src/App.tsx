import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { LearnerDashboard } from './pages/learner/LearnerDashboard';
import { ReadingListPage } from './pages/learner/ReadingListPage';
import { RequestFormPage } from './pages/learner/RequestFormPage';
import { RequestDetailsPage } from './pages/learner/RequestDetailsPage';
import { DeliveryReviewPage } from './pages/learner/DeliveryReviewPage';
import { EditorDashboard } from './pages/editor/EditorDashboard';
import { ConversionQueuePage } from './pages/editor/ConversionQueuePage';
import { TaskDetailPage } from './pages/editor/TaskDetailPage';
import { ActivityTimelinePage } from './pages/ActivityTimelinePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { AboutProjectPage } from './pages/AboutProjectPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { RoleGuard } from './components/common/RoleGuard';

const RootRedirect: React.FC = () => {
  const { currentUser } = useSimulation();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return currentUser.role === 'LEARNER' ? (
    <Navigate to="/learner/dashboard" replace />
  ) : (
    <Navigate to="/editor/dashboard" replace />
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Core Authenticated / Simulated App Shell */}
          <Route element={<AppLayout />}>
            {/* Learner Routes guarded by RoleGuard */}
            <Route
              path="/learner/dashboard"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <LearnerDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/readings"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <ReadingListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/request"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <RequestFormPage />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/request/:readingId"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <RequestFormPage />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/requests/:id"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <RequestDetailsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/review"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <DeliveryReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/learner/review/:readingId"
              element={
                <RoleGuard allowedRole="LEARNER">
                  <DeliveryReviewPage />
                </RoleGuard>
              }
            />

            {/* Editor Routes guarded by RoleGuard */}
            <Route
              path="/editor/dashboard"
              element={
                <RoleGuard allowedRole="EDITOR">
                  <EditorDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/editor/queue"
              element={
                <RoleGuard allowedRole="EDITOR">
                  <ConversionQueuePage />
                </RoleGuard>
              }
            />
            <Route
              path="/editor/task/:taskId"
              element={
                <RoleGuard allowedRole="EDITOR">
                  <TaskDetailPage />
                </RoleGuard>
              }
            />

            {/* Cross-Cutting & Educational Routes (Accessible to both personas) */}
            <Route path="/notifications" element={<ActivityTimelinePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/about" element={<AboutProjectPage />} />

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}
