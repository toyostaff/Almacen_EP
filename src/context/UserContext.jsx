import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

const STORAGE_KEY = "almacen_perfil";

export const PERFILES = {
  ADMIN: "admin",
  ALMACEN: "almacen",
};

export function UserProvider({ children }) {
  const [perfil, setPerfilState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || PERFILES.ADMIN;
  });

  function cambiarPerfil(nuevoPerfil) {
    if (!Object.values(PERFILES).includes(nuevoPerfil)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, nuevoPerfil);
    setPerfilState(nuevoPerfil);
  }

  const esAdministrador = perfil === PERFILES.ADMIN;

  return (
    <UserContext.Provider
      value={{
        perfil,
        cambiarPerfil,
        esAdministrador,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider.");
  }

  return context;
}


