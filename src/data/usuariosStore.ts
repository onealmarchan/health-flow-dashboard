import { useDemoStore, type Usuario as StoreUsuario, type Rol as StoreRol, type EstadoUsuario as StoreEstado } from '@/store/useDemoStore';

export type Usuario = StoreUsuario;
export type Rol = StoreRol;
export type EstadoUsuario = StoreEstado;

// Back-compat named export (still consumed as `usuariosMock` in a few places).
export const usuariosMock: Usuario[] = [];
Object.defineProperty(exports, 'usuariosMock', {
  get() { return useDemoStore.getState().usuarios; },
});

export const useUsuarios = () => useDemoStore(s => s.usuarios);
