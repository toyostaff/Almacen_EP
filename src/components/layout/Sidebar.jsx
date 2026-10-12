import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";

import {
  LayoutDashboard,
  PackageSearch,
  Boxes,
  MapPinned,
  History,
  Warehouse,
} from "lucide-react";

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/catalogo",
    label: "Catálogo Maestro",
    icon: PackageSearch,
  },
  {
    path: "/inventario",
    label: "Inventario",
    icon: Boxes,
  },
  {
    path: "/ubicaciones",
    label: "Ubicaciones",
    icon: MapPinned,
  },
  {
    path: "/historial",
    label: "Historial",
    icon: History,
  },
];

function Sidebar() {
  const { esAdministrador } = useUser();

  // El Catálogo Maestro solamente es visible
  // para el perfil Administrador.
  const menuVisible = menuItems.filter(
    (item) => item.path !== "/catalogo" || esAdministrador,
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Warehouse size={24} />
        </div>

        <div className="sidebar-brand-text">
          <strong>Control de Almacén</strong>
          <span>Gestión de inventario</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-title">
          MENÚ PRINCIPAL
        </span>

        {menuVisible.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Control de Almacén</span>
        <small>Versión 1.0 · Demo</small>
      </div>
    </aside>
  );
}

export default Sidebar;

