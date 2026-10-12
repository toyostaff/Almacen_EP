import { useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  PackageSearch,
  Boxes,
  RefreshCw,
  Plus,
  Pencil,
  Power,
} from "lucide-react";

import {
  obtenerHistorial,
} from "../../services/historialService";

function HistorialPage() {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modulo, setModulo] = useState("Todos");

  useEffect(() => {
    setHistorial(obtenerHistorial());
  }, []);

  const historialFiltrado = useMemo(() => {
    const termino = busqueda
      .trim()
      .toLowerCase();

    return historial.filter((evento) => {
      const coincideModulo =
        modulo === "Todos" ||
        evento.modulo === modulo;

      const coincideBusqueda =
        !termino ||
        evento.descripcion
          ?.toLowerCase()
          .includes(termino) ||
        evento.referencia
          ?.toLowerCase()
          .includes(termino) ||
        evento.accion
          ?.toLowerCase()
          .includes(termino) ||
        evento.usuario
          ?.toLowerCase()
          .includes(termino);

      return (
        coincideModulo &&
        coincideBusqueda
      );
    });
  }, [historial, busqueda, modulo]);

  const totalCatalogo = historial.filter(
    (evento) =>
      evento.modulo === "Catálogo Maestro",
  ).length;

  const totalInventario = historial.filter(
    (evento) =>
      evento.modulo === "Inventario",
  ).length;

  function formatearFecha(fecha) {
    if (!fecha) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(new Date(fecha));
  }

  function obtenerIconoModulo(nombreModulo) {
    if (nombreModulo === "Catálogo Maestro") {
      return <PackageSearch size={18} />;
    }

    if (nombreModulo === "Inventario") {
      return <Boxes size={18} />;
    }

    return <History size={18} />;
  }

  function obtenerIconoAccion(accion) {
    if (accion === "Creación") {
      return <Plus size={15} />;
    }

    if (accion === "Edición") {
      return <Pencil size={15} />;
    }

    if (
      accion === "Activación" ||
      accion === "Desactivación"
    ) {
      return <Power size={15} />;
    }

    return <RefreshCw size={15} />;
  }

  return (
    <section className="historial-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            TRAZABILIDAD
          </span>

          <h1>Historial</h1>

          <p>
            Consulta las acciones realizadas sobre
            los registros del sistema.
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>Eventos</span>

          <strong>
            {historial.length}
          </strong>

          <small>
            Acciones registradas
          </small>
        </article>

        <article className="summary-card">
          <span>Catálogo Maestro</span>

          <strong>
            {totalCatalogo}
          </strong>

          <small>
            Cambios del catálogo
          </small>
        </article>

        <article className="summary-card">
          <span>Inventario</span>

          <strong>
            {totalInventario}
          </strong>

          <small>
            Cambios operativos
          </small>
        </article>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>
              Registro de actividad
            </h2>

            <p>
              Los eventos más recientes aparecen primero.
            </p>
          </div>

          <div className="history-filters">
            <select
              value={modulo}
              onChange={(event) =>
                setModulo(event.target.value)
              }
            >
              <option value="Todos">
                Todos los módulos
              </option>

              <option value="Catálogo Maestro">
                Catálogo Maestro
              </option>

              <option value="Inventario">
                Inventario
              </option>
            </select>

            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                value={busqueda}
                placeholder="Buscar en historial..."
                onChange={(event) =>
                  setBusqueda(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table history-table">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Módulo</th>
                <th>Acción</th>
                <th>Referencia</th>
                <th>Descripción</th>
                <th>Perfil</th>
              </tr>
            </thead>

            <tbody>
              {historialFiltrado.map(
                (evento) => (
                  <tr key={evento.id}>
                    <td className="history-date">
                      {formatearFecha(
                        evento.fecha,
                      )}
                    </td>

                    <td>
                      <div className="history-module">
                        <span className="history-module-icon">
                          {obtenerIconoModulo(
                            evento.modulo,
                          )}
                        </span>

                        <span>
                          {evento.modulo}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="history-action">
                        {obtenerIconoAccion(
                          evento.accion,
                        )}

                        {evento.accion}
                      </span>
                    </td>

                    <td>
                      {evento.referencia ? (
                        <span className="sku-code">
                          {evento.referencia}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="history-description">
                      {evento.descripcion}
                    </td>

                    <td>
                      {evento.usuario || "—"}
                    </td>
                  </tr>
                ),
              )}

              {historialFiltrado.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-table">
                      <History size={38} />

                      <strong>
                        No hay eventos registrados
                      </strong>

                      <span>
                        Las próximas acciones del sistema
                        aparecerán aquí.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default HistorialPage;

