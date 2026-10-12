import { useEffect, useMemo, useState } from "react";
import { Boxes, Plus, Search, Pencil, Power, X } from "lucide-react";

import { obtenerCatalogo } from "../../services/catalogoService";

import {
  obtenerInventario,
  crearRegistroInventario,
  editarRegistroInventario,
  cambiarEstadoRegistro,
} from "../../services/inventarioService";

import { ubicacionesAlmacen } from "../../data/ubicaciones";

const formularioInicial = {
  skuId: "",
  sku: "",
  descripcion: "",
  codigo: "",
  codigoReemplazo: "",
  cantidad: "",
  medida: "",
  unidadMedida: "",
  ubicacion: "",
  observacion: "",
};

const unidadesMedida = [
  "Unidad",
  "Metro",
  "Rollo",
  "Caja",
  "Paquete",
  "Bolsa",
  "Kilogramo",
  "Litro",
  "Juego",
];

function InventarioPage() {
  const [inventario, setInventario] = useState([]);
  const [catalogo, setCatalogo] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState("");

  useEffect(() => {
    setInventario(obtenerInventario());

    const materialesActivos = obtenerCatalogo().filter(
      (material) => material.estado === "Activo",
    );

    setCatalogo(materialesActivos);
  }, []);

  /*
   * BUSCADOR PRINCIPAL DEL INVENTARIO
   */
  const inventarioFiltrado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return inventario;
    }

    return inventario.filter((registro) => {
      return (
        registro.sku?.toLowerCase().includes(termino) ||
        registro.descripcion?.toLowerCase().includes(termino) ||
        registro.codigo?.toLowerCase().includes(termino) ||
        registro.codigoReemplazo?.toLowerCase().includes(termino) ||
        registro.ubicacion?.toLowerCase().includes(termino)
      );
    });
  }, [inventario, busqueda]);

  /*
   * AUTOCOMPLETADO DEL CATÁLOGO MAESTRO
   *
   * Permite buscar principalmente por descripción,
   * pero también acepta SKU.
   */
const materialesFiltrados = useMemo(() => {
  const termino = busquedaMaterial
    .trim()
    .toLowerCase();

  // No buscar con menos de 2 caracteres
  if (termino.length < 2) {
    return [];
  }

  const palabras = termino
    .split(/\s+/)
    .filter(Boolean);

  return catalogo
    .filter((material) => {
      const descripcion =
        material.descripcion?.toLowerCase() || "";

      const sku =
        material.sku?.toLowerCase() || "";

      return palabras.every(
        (palabra) =>
          descripcion.includes(palabra) ||
          sku.includes(palabra),
      );
    })
    .sort((a, b) => {
      const descripcionA =
        a.descripcion?.toLowerCase() || "";

      const descripcionB =
        b.descripcion?.toLowerCase() || "";

      const empiezaA =
        descripcionA.startsWith(termino);

      const empiezaB =
        descripcionB.startsWith(termino);

      if (empiezaA && !empiezaB) {
        return -1;
      }

      if (!empiezaA && empiezaB) {
        return 1;
      }

      return descripcionA.localeCompare(
        descripcionB,
        "es",
      );
    })
    .slice(0, 8);
}, [catalogo, busquedaMaterial]);




  const totalActivos = inventario.filter(
    (registro) => registro.estado === "Activo",
  ).length;

  const totalInactivos = inventario.filter(
    (registro) => registro.estado === "Inactivo",
  ).length;

  /*
   * NUEVA ASOCIACIÓN
   */
  function abrirNuevoRegistro() {
    setRegistroEditando(null);
    setFormulario(formularioInicial);

    setBusquedaMaterial("");
    setMostrarResultados(false);

    setError("");
    setModalAbierto(true);
  }

  /*
   * EDITAR ASOCIACIÓN
   */
  function abrirEdicion(registro) {
    setRegistroEditando(registro);

    setFormulario({
      skuId: registro.skuId,
      sku: registro.sku,
      descripcion: registro.descripcion,
      codigo: registro.codigo,
      codigoReemplazo: registro.codigoReemplazo || "",
      cantidad: registro.cantidad,
      medida: registro.medida || "",
      unidadMedida: registro.unidadMedida,
      ubicacion: registro.ubicacion,
      observacion: registro.observacion || "",
    });

    setBusquedaMaterial(registro.descripcion);

    setMostrarResultados(false);
    setError("");
    setModalAbierto(true);
  }

  /*
   * CERRAR FORMULARIO
   */
  function cerrarModal() {
    setModalAbierto(false);

    setRegistroEditando(null);

    setFormulario(formularioInicial);

    setBusquedaMaterial("");
    setMostrarResultados(false);

    setError("");
  }

  /*
   * ACTUALIZAR CAMPOS DEL FORMULARIO
   */
  function actualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  /*
   * SELECCIONAR MATERIAL DEL CATÁLOGO MAESTRO
   */
  function seleccionarMaterial(material) {
    setFormulario((actual) => ({
      ...actual,

      skuId: material.id,
      sku: material.sku,
      descripcion: material.descripcion,
    }));

    setBusquedaMaterial(material.descripcion);
    setMostrarResultados(false);
    setError("");
  }

  /*
   * CAMBIAR TEXTO DEL BUSCADOR DE MATERIAL
   */
  function cambiarBusquedaMaterial(event) {
    const valor = event.target.value;

    setBusquedaMaterial(valor);
    setMostrarResultados(true);

    /*
     * Si el usuario modifica el texto después
     * de seleccionar un material, se elimina
     * temporalmente la asociación anterior.
     *
     * Debe volver a seleccionar un resultado.
     */
    setFormulario((actual) => ({
      ...actual,

      skuId: "",
      sku: "",
      descripcion: "",
    }));
  }

  /*
   * GUARDAR
   */
  function guardarRegistro(event) {
    event.preventDefault();

    try {
      if (registroEditando) {
        const actualizado = editarRegistroInventario(
          registroEditando.id,
          formulario,
        );

        setInventario(actualizado);
      } else {
        crearRegistroInventario(formulario);

        setInventario(obtenerInventario());
      }

      cerrarModal();
    } catch (err) {
      setError(err.message || "No se pudo guardar el registro.");
    }
  }

  /*
   * ACTIVAR / DESACTIVAR
   */
  function cambiarEstado(id) {
    const actualizado = cambiarEstadoRegistro(id);

    setInventario(actualizado);
  }

  return (
    <section className="inventario-page">
      {/* ===================================================
          ENCABEZADO
          =================================================== */}

      <div className="page-heading">
        <div>
          <span className="page-eyebrow">CONTROL OPERATIVO</span>

          <h1>Inventario</h1>

          <p>
            Asocia los códigos utilizados en almacén con los materiales
            registrados en el Catálogo Maestro.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={abrirNuevoRegistro}
        >
          <Plus size={19} />
          Nueva asociación
        </button>
      </div>

      {/* ===================================================
          INDICADORES
          =================================================== */}

      <div className="summary-grid">
        <article className="summary-card">
          <span>Asociaciones</span>

          <strong>{inventario.length}</strong>

          <small>Registros totales</small>
        </article>

        <article className="summary-card">
          <span>Activos</span>

          <strong>{totalActivos}</strong>

          <small>Registros disponibles</small>
        </article>

        <article className="summary-card">
          <span>Inactivos</span>

          <strong>{totalInactivos}</strong>

          <small>Registros deshabilitados</small>
        </article>
      </div>

      {/* ===================================================
          TABLA DE INVENTARIO
          =================================================== */}

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Inventario registrado</h2>

            <p>Relación entre SKU maestro y códigos del almacén.</p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar material, SKU, código o ubicación..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Material</th>
                <th>Código</th>
                <th>Reemplazo</th>
                <th>Cantidad</th>
                <th>Medida</th>
                <th>Unidad</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {inventarioFiltrado.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    <span className="sku-code">{registro.sku}</span>
                  </td>

                  <td>
                    <strong>{registro.descripcion}</strong>
                  </td>

                  <td>
                    <span className="external-code">{registro.codigo}</span>
                  </td>

                  <td>{registro.codigoReemplazo || "—"}</td>

                  <td>{registro.cantidad}</td>

                  <td>{registro.medida || "—"}</td>

                  <td>{registro.unidadMedida}</td>

                  <td>
                    <span className="location-badge">{registro.ubicacion}</span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        registro.estado === "Activo"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {registro.estado}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-action"
                        title="Editar asociación"
                        onClick={() => abrirEdicion(registro)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="icon-action"
                        title={
                          registro.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"
                        }
                        onClick={() => cambiarEstado(registro.id)}
                      >
                        <Power size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {inventarioFiltrado.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <div className="empty-table">
                      <Boxes size={38} />

                      <strong>No hay asociaciones registradas</strong>

                      <span>Registra el primer material del inventario.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          MODAL
          =================================================== */}

      {modalAbierto && (
        <div className="modal-backdrop">
          <div className="modal-card inventory-modal">
            {/* CABECERA DEL MODAL */}

            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  {registroEditando ? "EDITAR ASOCIACIÓN" : "NUEVA ASOCIACIÓN"}
                </span>

                <h2>
                  {registroEditando
                    ? registroEditando.sku
                    : "Registrar material en inventario"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModal}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarRegistro}>
              {/* ===========================================
                  BUSCADOR DEL CATÁLOGO MAESTRO
                  =========================================== */}

              {!registroEditando && (
                <div className="form-group form-full material-search-container">
                  <label htmlFor="materialSearch">
                    Material del Catálogo Maestro *
                  </label>

                  <div className="material-search-input">
                    <Search size={18} />

                    <input
                      id="materialSearch"
                      type="text"
                      value={busquedaMaterial}
                      placeholder="Buscar material por nombre..."
                      autoComplete="off"
                      onFocus={() => setMostrarResultados(true)}
                      onChange={cambiarBusquedaMaterial}
                    />
                  </div>

                  {mostrarResultados &&
  busquedaMaterial.trim().length >= 2 && (

                    <div className="material-search-results">
                      {materialesFiltrados.length > 0 ? (
                        materialesFiltrados.map((material) => (
                          <button
                            key={material.id}
                            type="button"
                            className="material-search-option"
                            onClick={() => seleccionarMaterial(material)}
                          >
                            <div>
                              <strong>{material.descripcion}</strong>

                              <span>{material.sku}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="material-search-empty">
                          No se encontraron materiales.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===========================================
                  MATERIAL SELECCIONADO
                  =========================================== */}

              {formulario.sku && (
                <div className="selected-material">
                  <span>Material asociado</span>

                  <div>
                    <strong>{formulario.sku}</strong>

                    <p>{formulario.descripcion}</p>
                  </div>
                </div>
              )}

              {/* ===========================================
                  DATOS DE LA ASOCIACIÓN
                  =========================================== */}

              <div className="inventory-form-grid">
                {/* CÓDIGO */}

                <div className="form-group">
                  <label htmlFor="codigo">Código *</label>

                  <input
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={formulario.codigo}
                    onChange={actualizarCampo}
                    placeholder="Ej. 45872"
                  />

                  <small>Código utilizado por el almacén.</small>
                </div>

                {/* CÓDIGO DE REEMPLAZO */}

                <div className="form-group">
                  <label htmlFor="codigoReemplazo">Código de reemplazo</label>

                  <input
                    id="codigoReemplazo"
                    name="codigoReemplazo"
                    type="text"
                    value={formulario.codigoReemplazo}
                    onChange={actualizarCampo}
                    placeholder="Opcional"
                  />

                  <small>Solo si existe un código alternativo.</small>
                </div>

                {/* CANTIDAD */}

<div className="form-group">
  <label htmlFor="cantidad">
    Cantidad *
  </label>

  <input
    id="cantidad"
    name="cantidad"
    type="number"
    min="0"
    step="any"
    value={formulario.cantidad}
    onChange={actualizarCampo}
    placeholder="Ej. 10"
  />

  <small>
    Número de unidades físicas disponibles.
  </small>
</div>



                {/* MEDIDA */}

<div className="form-group">
  <label htmlFor="medida">
    Medida / metraje
  </label>

  <input
    id="medida"
    name="medida"
    type="text"
    value={formulario.medida}
    onChange={actualizarCampo}
    placeholder="Ej. 50"
  />

  <small>
    Medida por unidad, cuando corresponda.
  </small>
</div>



                {/* UNIDAD */}

                <div className="form-group">
                  <label htmlFor="unidadMedida">Unidad de medida *</label>

                  <select
                    id="unidadMedida"
                    name="unidadMedida"
                    value={formulario.unidadMedida}
                    onChange={actualizarCampo}
                  >
                    <option value="">Seleccionar</option>

                    {unidadesMedida.map((unidad) => (
                      <option key={unidad} value={unidad}>
                        {unidad}
                      </option>
                    ))}
                  </select>
                </div>

                {/* UBICACIÓN */}

                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación *</label>

                  <select
                    id="ubicacion"
                    name="ubicacion"
                    value={formulario.ubicacion}
                    onChange={actualizarCampo}
                  >
                    <option value="">Seleccionar</option>

                    {ubicacionesAlmacen.map((ubicacion) => (
                      <option key={ubicacion.id} value={ubicacion.nombre}>
                        {ubicacion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ===========================================
                  OBSERVACIÓN
                  =========================================== */}

              <div className="form-group form-full">
                <label htmlFor="observacion">Observación</label>

                <textarea
                  id="observacion"
                  name="observacion"
                  rows="3"
                  value={formulario.observacion}
                  onChange={actualizarCampo}
                  placeholder="Información adicional del material..."
                />
              </div>

              {/* ERROR */}

              {error && <div className="form-error">{error}</div>}

              {/* ACCIONES */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="button button-primary">
                  {registroEditando ? "Guardar cambios" : "Guardar asociación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default InventarioPage;
