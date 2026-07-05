import { describe, expect, it } from 'vitest';
import { buildCreateCitaPayload, normalizeCitasPayload } from './useCitas';

describe('normalizeCitasPayload', () => {
  it('unwraps paginated payloads from the backend', () => {
    expect(normalizeCitasPayload({ data: [{ id: 1, estado_cita: 'agendada' }] })).toEqual([
      { id: 1, estado_cita: 'agendada' },
    ]);
  });

  it('unwraps nested cita collections from the backend', () => {
    expect(normalizeCitasPayload({ citas: [{ id: 2, estado_cita: 'atendida' }] })).toEqual([
      { id: 2, estado_cita: 'atendida' },
    ]);
  });

  it('returns an empty array when the payload has no usable rows', () => {
    expect(normalizeCitasPayload(undefined)).toEqual([]);
  });

  it('builds a cita payload with the required foreign keys', () => {
    expect(buildCreateCitaPayload({
      pacienteId: 7,
      sesionId: 12,
      motivoId: 3,
      fecha: '2026-07-10',
      hora: '09:00',
      tipoCita: 'control',
      estadoCita: 'agendada',
      estadoCaso: 'nuevo',
      remitido: false,
    })).toEqual({
      fk_ps_b001_num_paciente: 7,
      fk_cm_b005_num_sesion: 12,
      fk_cm_b004_num_motivo_consulta: 3,
      estado_cita: 'agendada',
      fecha: '2026-07-10',
      hora: '09:00',
      tipo_cita: 'control',
      estado_caso: 'nuevo',
      remitido: false,
    });
  });
});
