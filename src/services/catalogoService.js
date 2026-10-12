import { catalogoInicial } from "../data/catalogoSeed";

const STORAGE_KEY = "almacen_catalogo";

function guardarCatalogo(catalogo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogo));
}

export function obtenerCatalogo() {
  const almacenado = localStorage.getItem(STORAGE_KEY);

  if (!almacenado) {
    guardarCatalogo(catalogoInicial);
    return catalogoInicial;
  }

  try {
    return JSON.parse(almacenado);
  } catch {
    guardarCatalogo(catalogoInicial);
    return catalogoInicial;
  }
}

function obtenerSiguienteSku(catalogo) {
  const numeros = catalogo
    .map((item) => {
      const numero = Number(item.sku?.replace("SKU-", ""));
      return Number.isNaN(numero) ? 0 : numero;
    });

  const mayor = numeros.length > 0 ? Math.max(...numeros) : 0;
  const siguiente = mayor + 1;

  return `SKU-${String(siguiente).padStart(4, "0")}`;
}

export function crearMaterial(descripcion) {
  const catalogo = obtenerCatalogo();

  const descripcionLimpia = descripcion.trim();

  if (!descripcionLimpia) {
    throw new Error("La descripción es obligatoria.");
  }

  const duplicado = catalogo.some(
    (item) =>
      item.descripcion.trim().toLowerCase() ===
      descripcionLimpia.toLowerCase(),
  );

  if (duplicado) {
    throw new Error("Ya existe un material con esta descripción.");
  }

  const nuevoMaterial = {
    id: Date.now(),
    sku: obtenerSiguienteSku(catalogo),
    descripcion: descripcionLimpia,
    fechaCreacion: new Date().toISOString().split("T")[0],
    estado: "Activo",
  };

  const actualizado = [...catalogo, nuevoMaterial];

  guardarCatalogo(actualizado);

  return nuevoMaterial;
}

export function editarMaterial(id, descripcion) {
  const catalogo = obtenerCatalogo();

  const descripcionLimpia = descripcion.trim();

  if (!descripcionLimpia) {
    throw new Error("La descripción es obligatoria.");
  }

  const duplicado = catalogo.some(
    (item) =>
      item.id !== id &&
      item.descripcion.trim().toLowerCase() ===
        descripcionLimpia.toLowerCase(),
  );

  if (duplicado) {
    throw new Error("Ya existe otro material con esta descripción.");
  }

  const actualizado = catalogo.map((item) =>
    item.id === id
      ? {
          ...item,
          descripcion: descripcionLimpia,
        }
      : item,
  );

  guardarCatalogo(actualizado);

  return actualizado;
}

export function cambiarEstadoMaterial(id) {
  const catalogo = obtenerCatalogo();

  const actualizado = catalogo.map((item) =>
    item.id === id
      ? {
          ...item,
          estado: item.estado === "Activo" ? "Inactivo" : "Activo",
        }
      : item,
  );

  guardarCatalogo(actualizado);

  return actualizado;
}


