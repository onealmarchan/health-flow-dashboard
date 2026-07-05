import { describe, expect, it } from 'vitest';
import { buildCreateSesionPayload, normalizeCollectionPayload, normalizeDiaSemana, normalizeTurno } from './useJornadas';

describe('jornadas payload helpers', () => {
  it('normalizes weekday names as expected by the API', () => {
    expect(normalizeDiaSemana('mié')).toBe('Miercoles');
    expect(normalizeDiaSemana('sábado')).toBe('Sabado');
  });

  it('normalizes turnos to the API shape', () => {
    expect(normalizeTurno('TARDE')).toBe('tarde');
    expect(normalizeTurno('noche')).toBe('noche');
    expect(normalizeTurno('mañana')).toBe('mañana');
  });

  it('unwraps wrapped session collections', () => {
    expect(normalizeCollectionPayload({ sesiones: [{ id: 99 }] })).toEqual([{ id: 99 }]);
  });

  it('builds a session payload with the right fields', () => {
    expect(buildCreateSesionPayload({
      medicoId: 10,
      turno: 'Mañana',
      diaSemana: 'jueves',
      horaInicio: '08:00',
      horaFin: '12:00',
    })).toEqual({
      fk_cm_b001_num_medico_ministerio_salud: 10,
      turno: 'mañana',
      dias_semana: 'Jueves',
      hora_inicio: '08:00',
      hora_fin: '12:00',
    });
  });
});
