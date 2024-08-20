import { createBrowserRouter, Navigate } from "react-router-dom";
import PoolsPage from "../../pages/PoolsPage";
import SwapPage from "../../pages/SwapPage";
import LiquidityPage from "../../pages/LiquidityPage/index.tsx";
import {
  HOME_ROUTE,
  POOLS_ROUTE,
  SWAP_ROUTE,
  ADD_LIQUIDITY,
  ADD_LIQUIDITY_TO_EXISTING,
  REMOVE_LIQUIDITY_FROM_EXISTING,
} from "./routes";
import MainLayout from "../../layout/MainLayout.tsx";
import NotFoundPage from "../../pages/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: HOME_ROUTE,
        element: <Navigate to={SWAP_ROUTE} />,
      },
      {
        path: POOLS_ROUTE,
        children: [
          {
            element: <PoolsPage />,
            index: true,
          },
          {
            path: ADD_LIQUIDITY,
            element: <LiquidityPage />,
            index: true,
          },
          {
            path: ADD_LIQUIDITY_TO_EXISTING,
            element: <LiquidityPage />,
            index: true,
          },
          {
            path: REMOVE_LIQUIDITY_FROM_EXISTING,
            element: <LiquidityPage />,
            index: true,
          },
        ],
      },
      {
        path: SWAP_ROUTE,
        element: <SwapPage />,
      },
    ],
  },
]);

export default router;
