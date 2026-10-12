const STORAGE_KEY = "almacen_historial";

export function obtenerHistorial() {
  const almacenado = localStorage.getItem(STORAGE_KEY);

  if (!almacenado) {
    return [];
  }

  try {
    return JSON.parse(almacenado);
  } catch {
    return [];
  }
}

export function registrarEvento({
  modulo,
  accion,
  descripcion,
  referencia = "",
  usuario = "",
}) {
  const historial = obtenerHistorial();

  const nuevoEvento = {
    id: Date.now(),

    modulo,
    accion,
    descripcion,
    referencia,
    usuario,

    fecha: new Date().toISOString(),
  };

  const actualizado = [
    nuevoEvento,
    ...historial,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(actualizado),
  );

  return nuevoEvento;
}

export function limpiarHistorial() {
  localStorage.removeItem(STORAGE_KEY);
}

