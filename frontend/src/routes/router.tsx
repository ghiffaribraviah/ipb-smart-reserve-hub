import { createBrowserRouter, type RouteObject } from 'react-router';

import { LoginPage } from '../features/auth/LoginPage';
import { NotConfiguredRoute } from '../pages/NotConfiguredRoute';
import { RoleLandingPage } from '../pages/RoleLandingPage';
import { StackReadyPage } from '../pages/StackReadyPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <StackReadyPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/student',
    element: <RoleLandingPage role="student" title="Student Dashboard" />,
  },
  {
    path: '/staff',
    element: <RoleLandingPage role="staff" title="Staff Dashboard" />,
  },
  {
    path: '/admin',
    element: <RoleLandingPage role="super_admin" title="Admin Dashboard" />,
  },
  {
    path: '*',
    element: <NotConfiguredRoute />,
  },
];

export const router = createBrowserRouter(routes);
