import { useEffect, useMemo, useState } from "react";
import {
  MapPinned,
  PackageOpen,
  X,
  Search,
} from "lucide-react";

import { ubicacionesAlmacen } from "../../data/ubicaciones";
import { obtenerInventario } from "../../services/inventarioService";

function UbicacionesPage() {
  const [inventario, setInventario] = useState([]);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] =
    useState(null);

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setInventario(obtenerInventario());
  }, []);

  const ubicacionesConDatos = useMemo(() => {
    return ubicacionesAlmacen.map((ubicacion) => {
      const registros = inventario.filter(
        (registro) =>
          registro.ubicacion === ubicacion.nombre &&
          registro.estado === "Activo",
      );

      return {
        ...ubicacion,
        registros,
        cantidadRegistros: registros.length,
      };
    });
  }, [inventario]);

  const materialesUbicacion = useMemo(() => {
    if (!ubicacionSeleccionada) {
      return [];
    }

    const termino = busqueda
      .trim()
      .toLowerCase();

    const registros = inventario.filter(
      (registro) =>
        registro.ubicacion ===
          ubicacionSeleccionada.nombre &&
        registro.estado === "Activo",
    );

    if (!termino) {
      return registros;
    }

    return registros.filter((registro) => {
      return (
        registro.descripcion
          ?.toLowerCase()
          .includes(termino) ||
        registro.sku
          ?.toLowerCase()
          .includes(termino) ||
        registro.codigo
          ?.toLowerCase()
          .includes(termino)
      );
    });
  }, [
    inventario,
    ubicacionSeleccionada,
    busqueda,
  ]);

  const ubicacionesOcupadas =
    ubicacionesConDatos.filter(
      (ubicacion) =>
        ubicacion.cantidadRegistros > 0,
    ).length;

  const ubicacionesVacias =
    ubicacionesConDatos.length -
    ubicacionesOcupadas;

  function abrirUbicacion(ubicacion) {
    setUbicacionSeleccionada(ubicacion);
    setBusqueda("");
  }

  function cerrarUbicacion() {
    setUbicacionSeleccionada(null);
    setBusqueda("");
  }

  return (
    <section className="ubicaciones-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            DISTRIBUCIÓN FÍSICA
          </span>

          <h1>Ubicaciones</h1>

          <p>
            Consulta la distribución de los materiales
            registrados dentro del almacén.
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>Ubicaciones</span>

          <strong>
            {ubicacionesConDatos.length}
          </strong>

          <small>
            Posiciones registradas
          </small>
        </article>

        <article className="summary-card">
          <span>Ocupadas</span>

          <strong>
            {ubicacionesOcupadas}
          </strong>

          <small>
            Con materiales activos
          </small>
        </article>

        <article className="summary-card">
          <span>Disponibles</span>

          <strong>
            {ubicacionesVacias}
          </strong>

          <small>
            Sin materiales registrados
          </small>
        </article>
      </div>

      <div className="content-card">
        <div className="locations-heading">
          <div>
            <h2>
              Mapa del almacén
            </h2>

            <p>
              Selecciona una ubicación para consultar
              los materiales almacenados.
            </p>
          </div>

          <div className="locations-legend">
            <div>
              <span className="legend-dot occupied" />
              Ocupada
            </div>

            <div>
              <span className="legend-dot available" />
              Disponible
            </div>
          </div>
        </div>

        <div className="warehouse-map">
          <div className="warehouse-columns">
            <span />

            {["1", "2", "3", "4"].map(
              (columna) => (
                <strong key={columna}>
                  {columna}
                </strong>
              ),
            )}
          </div>

          {["A", "B", "C", "D", "E", "F"].map(
            (fila) => (
              <div
                className="warehouse-row"
                key={fila}
              >
                <strong className="warehouse-row-label">
                  {fila}
                </strong>

                {ubicacionesConDatos
                  .filter(
                    (ubicacion) =>
                      ubicacion.fila === fila,
                  )
                  .map((ubicacion) => {
                    const ocupada =
                      ubicacion.cantidadRegistros > 0;

                    return (
                      <button
                        type="button"
                        key={ubicacion.id}
                        className={`warehouse-location ${
                          ocupada
                            ? "occupied"
                            : "available"
                        }`}
                        onClick={() =>
                          abrirUbicacion(
                            ubicacion,
                          )
                        }
                      >
                        <div className="warehouse-location-icon">
                          {ocupada ? (
                            <PackageOpen
                              size={21}
                            />
                          ) : (
                            <MapPinned
                              size={21}
                            />
                          )}
                        </div>

                        <strong>
                          {ubicacion.nombre}
                        </strong>

                        <span>
                          {ocupada
                            ? `${
                                ubicacion
                                  .cantidadRegistros
                              } ${
                                ubicacion
                                  .cantidadRegistros ===
                                1
                                  ? "registro"
                                  : "registros"
                              }`
                            : "Disponible"}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ),
          )}
        </div>
      </div>

      {ubicacionSeleccionada && (
        <div className="modal-backdrop">
          <div className="modal-card location-modal">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  UBICACIÓN
                </span>

                <h2>
                  {
                    ubicacionSeleccionada.nombre
                  }
                </h2>

                <p>
                  Materiales actualmente registrados
                  en esta posición.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarUbicacion}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="location-search">
              <Search size={18} />

              <input
                type="search"
                value={busqueda}
                placeholder="Buscar material o código..."
                onChange={(event) =>
                  setBusqueda(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="location-material-list">
              {materialesUbicacion.length >
              0 ? (
                materialesUbicacion.map(
                  (registro) => (
                    <article
                      className="location-material-card"
                      key={registro.id}
                    >
                      <div className="location-material-main">
                        <span className="sku-code">
                          {registro.sku}
                        </span>

                        <strong>
                          {
                            registro.descripcion
                          }
                        </strong>

                        <small>
                          Código:{" "}
                          {registro.codigo}
                        </small>
                      </div>

                      <div className="location-material-stock">
                        <strong>
                          {registro.cantidad}
                        </strong>

                        <span>
                          {registro.unidadMedida}
                        </span>

                        {registro.medida && (
                          <small>
                            Medida:{" "}
                            {registro.medida}
                          </small>
                        )}
                      </div>
                    </article>
                  ),
                )
              ) : (
                <div className="location-empty">
                  <MapPinned size={38} />

                  <strong>
                    Ubicación disponible
                  </strong>

                  <span>
                    No existen materiales activos
                    registrados en{" "}
                    {
                      ubicacionSeleccionada.nombre
                    }.
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={cerrarUbicacion}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default UbicacionesPage;

