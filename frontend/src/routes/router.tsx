import { createBrowserRouter } from 'react-router';

import { NotConfiguredRoute } from '../pages/NotConfiguredRoute';
import { StackReadyPage } from '../pages/StackReadyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StackReadyPage />,
  },
  {
    path: '*',
    element: <NotConfiguredRoute />,
  },
]);
