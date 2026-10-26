import { createContext, useContext } from 'react';

// Contextos y hooks en su propio archivo: así los archivos de componentes solo exportan componentes (react-refresh).
export const AuthContext = createContext(null);
export const EnVivoContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const useEnVivo = () => useContext(EnVivoContext);
