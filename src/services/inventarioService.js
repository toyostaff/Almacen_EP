import { inventarioInicial } from "../data/inventarioSeed";

const STORAGE_KEY = "almacen_inventario";

/*
 * GUARDAR INVENTARIO
 */
function guardarInventario(inventario) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(inventario),
  );
}

/*
 * OBTENER INVENTARIO
 */
export function obtenerInventario() {
  const almacenado = localStorage.getItem(STORAGE_KEY);

  if (!almacenado) {
    guardarInventario(inventarioInicial);
    return inventarioInicial;
  }

  try {
    return JSON.parse(almacenado);
  } catch {
    guardarInventario(inventarioInicial);
    return inventarioInicial;
  }
}

/*
 * CREAR NUEVA ASOCIACIÓN
 */
export function crearRegistroInventario(datos) {
  const inventario = obtenerInventario();

  /*
   * VALIDAR MATERIAL
   */
  if (!datos.skuId) {
    throw new Error(
      "Debes seleccionar un material del Catálogo Maestro.",
    );
  }

  /*
   * VALIDAR CÓDIGO
   */
  const codigo = datos.codigo?.trim();

  if (!codigo) {
    throw new Error(
      "El código es obligatorio.",
    );
  }

  /*
   * VALIDAR CANTIDAD
   */
  if (
    datos.cantidad === "" ||
    datos.cantidad === null ||
    datos.cantidad === undefined ||
    Number.isNaN(Number(datos.cantidad)) ||
    Number(datos.cantidad) < 0
  ) {
    throw new Error(
      "Ingresa una cantidad válida.",
    );
  }

  /*
   * VALIDAR UNIDAD
   */
  if (!datos.unidadMedida) {
    throw new Error(
      "Selecciona una unidad de medida.",
    );
  }

  /*
   * VALIDAR UBICACIÓN
   */
  if (!datos.ubicacion) {
    throw new Error(
      "Selecciona una ubicación.",
    );
  }

  /*
   * EVITAR CÓDIGOS DUPLICADOS
   */
  const codigoNormalizado =
    codigo.toLowerCase();

  const codigoDuplicado = inventario.some(
    (registro) =>
      registro.codigo
        ?.trim()
        .toLowerCase() === codigoNormalizado,
  );

  if (codigoDuplicado) {
    throw new Error(
      "Ya existe un registro con este código.",
    );
  }

  /*
   * CREAR REGISTRO
   */
  const nuevoRegistro = {
    id: Date.now(),

    skuId: datos.skuId,
    sku: datos.sku,
    descripcion: datos.descripcion,

    codigo,

    codigoReemplazo:
      datos.codigoReemplazo?.trim() || "",

    cantidad: Number(datos.cantidad),

    medida:
      datos.medida?.trim() || "",

    unidadMedida:
      datos.unidadMedida,

    ubicacion:
      datos.ubicacion,

    observacion:
      datos.observacion?.trim() || "",

    estado: "Activo",

    fechaCreacion:
      new Date()
        .toISOString()
        .split("T")[0],

    fechaActualizacion: null,
  };

  const actualizado = [
    ...inventario,
    nuevoRegistro,
  ];

  guardarInventario(actualizado);

  return nuevoRegistro;
}

/*
 * EDITAR ASOCIACIÓN
 */
export function editarRegistroInventario(
  id,
  datos,
) {
  const inventario = obtenerInventario();

  /*
   * COMPROBAR QUE EL REGISTRO EXISTE
   */
  const registroExistente = inventario.find(
    (registro) => registro.id === id,
  );

  if (!registroExistente) {
    throw new Error(
      "No se encontró el registro que deseas editar.",
    );
  }

  /*
   * VALIDAR CÓDIGO
   */
  const codigo = datos.codigo?.trim();

  if (!codigo) {
    throw new Error(
      "El código es obligatorio.",
    );
  }

  /*
   * VALIDAR CANTIDAD
   */
  if (
    datos.cantidad === "" ||
    datos.cantidad === null ||
    datos.cantidad === undefined ||
    Number.isNaN(Number(datos.cantidad)) ||
    Number(datos.cantidad) < 0
  ) {
    throw new Error(
      "Ingresa una cantidad válida.",
    );
  }

  /*
   * VALIDAR UNIDAD
   */
  if (!datos.unidadMedida) {
    throw new Error(
      "Selecciona una unidad de medida.",
    );
  }

  /*
   * VALIDAR UBICACIÓN
   */
  if (!datos.ubicacion) {
    throw new Error(
      "Selecciona una ubicación.",
    );
  }

  /*
   * EVITAR QUE OTRO REGISTRO
   * TENGA EL MISMO CÓDIGO
   */
  const codigoNormalizado =
    codigo.toLowerCase();

  const codigoDuplicado = inventario.some(
    (registro) =>
      registro.id !== id &&
      registro.codigo
        ?.trim()
        .toLowerCase() === codigoNormalizado,
  );

  if (codigoDuplicado) {
    throw new Error(
      "Ya existe otro registro con este código.",
    );
  }

  /*
   * ACTUALIZAR REGISTRO
   *
   * No permitimos modificar SKU ni descripción
   * desde Inventario.
   */
  const actualizado = inventario.map(
    (registro) =>
      registro.id === id
        ? {
            ...registro,

            codigo,

            codigoReemplazo:
              datos.codigoReemplazo?.trim() || "",

            cantidad:
              Number(datos.cantidad),

            medida:
              datos.medida?.trim() || "",

            unidadMedida:
              datos.unidadMedida,

            ubicacion:
              datos.ubicacion,

            observacion:
              datos.observacion?.trim() || "",

            fechaActualizacion:
              new Date()
                .toISOString()
                .split("T")[0],
          }
        : registro,
  );

  guardarInventario(actualizado);

  return actualizado;
}

/*
 * ACTIVAR / DESACTIVAR REGISTRO
 */
export function cambiarEstadoRegistro(id) {
  const inventario = obtenerInventario();

  const registroExistente = inventario.find(
    (registro) => registro.id === id,
  );

  if (!registroExistente) {
    throw new Error(
      "No se encontró el registro.",
    );
  }

  const actualizado = inventario.map(
    (registro) =>
      registro.id === id
        ? {
            ...registro,

            estado:
              registro.estado === "Activo"
                ? "Inactivo"
                : "Activo",

            fechaActualizacion:
              new Date()
                .toISOString()
                .split("T")[0],
          }
        : registro,
  );

  guardarInventario(actualizado);

  return actualizado;
}


