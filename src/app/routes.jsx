import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import CatalogoPage from "../features/catalogo/CatalogoPage";
import InventarioPage from "../features/inventario/InventarioPage";
import UbicacionesPage from "../features/ubicaciones/UbicacionesPage";
import HistorialPage from "../features/historial/HistorialPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "catalogo",
        element: <CatalogoPage />,
      },
      {
        path: "inventario",
        element: <InventarioPage />,
      },
      {
        path: "ubicaciones",
        element: <UbicacionesPage />,
      },
      {
        path: "historial",
        element: <HistorialPage />,
      },
    ],
  },
]);


