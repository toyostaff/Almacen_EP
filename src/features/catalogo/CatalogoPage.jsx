import { useEffect, useMemo, useState } from "react";
import {
  PackagePlus,
  Search,
  Pencil,
  Power,
  PackageSearch,
  X,
} from "lucide-react";

import {
  obtenerCatalogo,
  crearMaterial,
  editarMaterial,
  cambiarEstadoMaterial,
} from "../../services/catalogoService";

function CatalogoPage() {
  const [catalogo, setCatalogo] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [materialEditando, setMaterialEditando] = useState(null);
  const [descripcion, setDescripcion] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    setCatalogo(obtenerCatalogo());
  }, []);

  const catalogoFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return catalogo;
    }

    return catalogo.filter(
      (item) =>
        item.sku.toLowerCase().includes(termino) ||
        item.descripcion.toLowerCase().includes(termino),
    );
  }, [catalogo, busqueda]);

  const totalActivos = catalogo.filter(
    (item) => item.estado === "Activo",
  ).length;

  const totalInactivos = catalogo.filter(
    (item) => item.estado === "Inactivo",
  ).length;

  function abrirNuevoMaterial() {
    setMaterialEditando(null);
    setDescripcion("");
    setError("");
    setModalAbierto(true);
  }

  function abrirEdicion(material) {
    setMaterialEditando(material);
    setDescripcion(material.descripcion);
    setError("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setMaterialEditando(null);
    setDescripcion("");
    setError("");
  }

  function guardarMaterial(event) {
    event.preventDefault();

    try {
      if (materialEditando) {
        const actualizado = editarMaterial(
          materialEditando.id,
          descripcion,
        );

        setCatalogo(actualizado);
      } else {
        crearMaterial(descripcion);
        setCatalogo(obtenerCatalogo());
      }

      cerrarModal();
    } catch (err) {
      setError(err.message);
    }
  }

  function cambiarEstado(id) {
    const actualizado = cambiarEstadoMaterial(id);
    setCatalogo(actualizado);
  }

  return (
    <section className="catalogo-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">CATÁLOGO BASE</span>
          <h1>Catálogo Maestro</h1>
          <p>
            Registra las descripciones principales. El sistema asignará
            automáticamente un SKU único.
          </p>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={abrirNuevoMaterial}
        >
          <PackagePlus size={19} />
          Nuevo material
        </button>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>Total de SKU</span>
          <strong>{catalogo.length}</strong>
          <small>Materiales registrados</small>
        </article>

        <article className="summary-card">
          <span>Activos</span>
          <strong>{totalActivos}</strong>
          <small>Disponibles para asociación</small>
        </article>

        <article className="summary-card">
          <span>Inactivos</span>
          <strong>{totalInactivos}</strong>
          <small>No disponibles para nuevas asociaciones</small>
        </article>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Materiales registrados</h2>
            <p>Listado maestro de SKU y descripciones.</p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar SKU o descripción..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Estado</th>
                <th className="table-actions-title">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {catalogoFiltrado.map((material) => (
                <tr key={material.id}>
                  <td>
                    <span className="sku-code">{material.sku}</span>
                  </td>

                  <td>
                    <strong>{material.descripcion}</strong>
                  </td>

                  <td>{material.fechaCreacion}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        material.estado === "Activo"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {material.estado}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-action"
                        title="Editar descripción"
                        onClick={() => abrirEdicion(material)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="icon-action"
                        title={
                          material.estado === "Activo"
                            ? "Desactivar material"
                            : "Activar material"
                        }
                        onClick={() => cambiarEstado(material.id)}
                      >
                        <Power size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {catalogoFiltrado.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="empty-table">
                      <PackageSearch size={35} />
                      <strong>No encontramos materiales</strong>
                      <span>
                        Prueba otra búsqueda o registra un nuevo material.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  {materialEditando ? "EDITAR MATERIAL" : "NUEVO MATERIAL"}
                </span>

                <h2>
                  {materialEditando
                    ? materialEditando.sku
                    : "Crear material maestro"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarMaterial}>
              {!materialEditando && (
                <div className="sku-preview">
                  <span>SKU</span>
                  <strong>Se generará automáticamente</strong>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="descripcion">
                  Descripción del material
                </label>

                <input
                  id="descripcion"
                  type="text"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Ej. Clavos"
                  autoFocus
                />

                <small>
                  Utiliza una descripción general. Los códigos, medidas y
                  cantidades se asociarán posteriormente.
                </small>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  className="button button-primary"
                  type="submit"
                >
                  {materialEditando ? "Guardar cambios" : "Crear material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CatalogoPage;
