export const filasAlmacen = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

export const columnasAlmacen = [
  "1",
  "2",
  "3",
  "4",
];

export const ubicacionesAlmacen = filasAlmacen.flatMap((fila) =>
  columnasAlmacen.map((columna) => ({
    id: `${fila}-${columna}`,
    fila,
    columna,
    nombre: `${fila}-${columna}`,
  })),
);



