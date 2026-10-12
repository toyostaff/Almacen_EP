import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ChevronDown,
  ShieldCheck,
  Warehouse,
} from "lucide-react";

import { PERFILES, useUser } from "../../context/UserContext";

function Header() {
  const { perfil, cambiarPerfil, esAdministrador } = useUser();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const selectorRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  /*
   * Cierra el menú de perfiles cuando
   * se hace clic fuera del selector.
   */
  useEffect(() => {
    function cerrarAlHacerClickFuera(event) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target)
      ) {
        setMenuAbierto(false);
      }
    }

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera,
      );
    };
  }, []);

  /*
   * Cambia el perfil simulado.
   *
   * Si el administrador está dentro del
   * Catálogo Maestro y cambia al perfil
   * Personal de almacén, se redirige
   * automáticamente al Dashboard.
   */
  function seleccionarPerfil(nuevoPerfil) {
    cambiarPerfil(nuevoPerfil);

    setMenuAbierto(false);

    if (
      nuevoPerfil === PERFILES.ALMACEN &&
      location.pathname.startsWith("/catalogo")
    ) {
      navigate("/", {
        replace: true,
      });
    }
  }

  return (
    <header className="header">
      {/* TÍTULO DEL SISTEMA */}

      <div className="header-title">
        <span>Sistema de Control</span>

        <strong>Gestión de Almacén</strong>
      </div>

      {/* SELECTOR DE PERFIL */}

      <div
        className="profile-selector"
        ref={selectorRef}
      >
        <button
          type="button"
          className="profile-button"
          onClick={() =>
            setMenuAbierto((actual) => !actual)
          }
          aria-expanded={menuAbierto}
        >
          {/* ICONO DEL PERFIL */}

          <div className="profile-avatar">
            {esAdministrador ? (
              <ShieldCheck size={20} />
            ) : (
              <Warehouse size={20} />
            )}
          </div>

          {/* INFORMACIÓN DEL PERFIL ACTUAL */}

          <div className="profile-current-info">
            <strong>
              {esAdministrador
                ? "Administrador"
                : "Personal de almacén"}
            </strong>

            <span>
              {esAdministrador
                ? "Gestión completa"
                : "Operación de inventario"}
            </span>
          </div>

          {/* FLECHA */}

          <ChevronDown
            size={17}
            className={
              menuAbierto
                ? "profile-chevron open"
                : "profile-chevron"
            }
          />
        </button>

        {/* MENÚ DESPLEGABLE */}

        {menuAbierto && (
          <div className="profile-dropdown">

            {/* CABECERA */}

            <div className="profile-dropdown-header">
              <span>Cambiar vista</span>

              <small>Modo demostración</small>
            </div>

            {/* OPCIÓN ADMINISTRADOR */}

            <button
              type="button"
              className={`profile-dropdown-option ${
                perfil === PERFILES.ADMIN
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                seleccionarPerfil(PERFILES.ADMIN)
              }
            >
              <div className="profile-option-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>
                  Administrador
                </strong>

                <span>
                  Acceso al Catálogo Maestro y operación
                </span>
              </div>

              {perfil === PERFILES.ADMIN && (
                <span className="profile-selected-dot" />
              )}
            </button>

            {/* OPCIÓN PERSONAL DE ALMACÉN */}

            <button
              type="button"
              className={`profile-dropdown-option ${
                perfil === PERFILES.ALMACEN
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                seleccionarPerfil(PERFILES.ALMACEN)
              }
            >
              <div className="profile-option-icon">
                <Warehouse size={19} />
              </div>

              <div>
                <strong>
                  Personal de almacén
                </strong>

                <span>
                  Inventario, ubicaciones e historial
                </span>
              </div>

              {perfil === PERFILES.ALMACEN && (
                <span className="profile-selected-dot" />
              )}
            </button>

            {/* MENSAJE DEMO */}

            <div className="profile-dropdown-footer">
              Los perfiles son simulados en esta versión.
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

