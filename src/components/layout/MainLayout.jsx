//contenedor de todas las pantallas


import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Header />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;


