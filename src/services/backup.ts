import axios from 'axios';

export type BackupFormat = 'json' | 'csv';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function triggerDownload(response: any, fallbackName: string) {
  const contentType = response.headers?.['content-type'] || 'application/octet-stream';
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportBackup(format: BackupFormat) {
  const suffix = format === 'csv' ? '/csv' : '';
  const response = await axios.get(`${BASE_URL}/backup/export${suffix}`, {
    headers: getAuthHeaders(),
    responseType: 'blob',
  });

  const disposition = response.headers?.['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `backup.${format}`;

  triggerDownload(response, filename);
}

export async function importBackup(format: BackupFormat, file: File) {
  const suffix = format === 'csv' ? '/csv' : '';
  const formData = new FormData();
  formData.append('file', file);

  await axios.post(`${BASE_URL}/backup/import${suffix}`, formData, {
    headers: {
      ...getAuthHeaders(),
    },
  });
}
