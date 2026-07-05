import { useDemoStore, type Usuario as StoreUsuario, type Rol as StoreRol, type EstadoUsuario as StoreEstado } from '@/store/useDemoStore';

export type Usuario = StoreUsuario;
export type Rol = StoreRol;
export type EstadoUsuario = StoreEstado;

export const useUsuarios = () => useDemoStore(s => s.usuarios);

// Legacy proxy so existing `usuariosMock` reads stay dynamic.
export const usuariosMock: Usuario[] = new Proxy([] as Usuario[], {
  get(_t, prop) {
    const arr = useDemoStore.getState().usuarios;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (arr as any)[prop];
  },
});
