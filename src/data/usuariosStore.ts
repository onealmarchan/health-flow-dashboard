export type Rol = 'Administrador' | 'Auxiliar Administrativo';
export type EstadoUsuario = 'Activo' | 'Inhabilitado';

export interface Usuario {
  num: number;
  email: string;
  nombreCompleto: string;
  rol: Rol;
  miembroDesde: string;      // ISO datetime
  ultimaActualizacion: string;
  estado: EstadoUsuario;
}

export const usuariosMock: Usuario[] = [
  { num: 1, email: 'rgarcia@medicitas.com',  nombreCompleto: 'Roberto García',   rol: 'Administrador',           miembroDesde: '2022-03-15 09:14', ultimaActualizacion: '2024-01-20 16:42', estado: 'Activo' },
  { num: 2, email: 'cruiz@medicitas.com',    nombreCompleto: 'Carmen Ruiz',      rol: 'Auxiliar Administrativo', miembroDesde: '2021-08-20 11:05', ultimaActualizacion: '2024-01-18 10:21', estado: 'Activo' },
  { num: 3, email: 'mtorres@medicitas.com',  nombreCompleto: 'Miguel Torres',    rol: 'Administrador',           miembroDesde: '2020-01-10 08:30', ultimaActualizacion: '2024-01-15 14:55', estado: 'Activo' },
  { num: 4, email: 'plopez@medicitas.com',   nombreCompleto: 'Patricia López',   rol: 'Auxiliar Administrativo', miembroDesde: '2019-05-22 13:18', ultimaActualizacion: '2023-12-01 09:00', estado: 'Inhabilitado' },
  { num: 5, email: 'fdiaz@medicitas.com',    nombreCompleto: 'Fernando Díaz',    rol: 'Auxiliar Administrativo', miembroDesde: '2023-02-01 07:45', ultimaActualizacion: '2024-01-22 18:10', estado: 'Activo' },
  { num: 6, email: 'smoreno@medicitas.com',  nombreCompleto: 'Sandra Moreno',    rol: 'Auxiliar Administrativo', miembroDesde: '2022-11-30 12:20', ultimaActualizacion: '2024-01-10 15:30', estado: 'Activo' },
];
