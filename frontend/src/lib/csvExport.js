export function exportCSV(rows, filename = 'report.csv') {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv     = [headers.join(','), ...lines].join('\n');
  const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
