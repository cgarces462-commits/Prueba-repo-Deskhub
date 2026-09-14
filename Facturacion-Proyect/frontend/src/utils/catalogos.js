export const ESTADOS_FACTURA = [
  { valor: 'emitida', etiqueta: 'Emitida' },
  { valor: 'pagada', etiqueta: 'Pagada' },
  { valor: 'vencida', etiqueta: 'Vencida' },
  { valor: 'anulada', etiqueta: 'Anulada' },
];

export const TIPOS_CLIENTE = [
  { valor: 'residencial', etiqueta: 'Residencial' },
  { valor: 'comercial', etiqueta: 'Comercial' },
  { valor: 'oficial', etiqueta: 'Oficial' },
];

export const METODOS_PAGO = [
  { valor: 'caja', etiqueta: 'Caja' },
  { valor: 'banco', etiqueta: 'Banco' },
  { valor: 'movil', etiqueta: 'Móvil' },
];

export function etiquetaEstado(estado) {
  return ESTADOS_FACTURA.find((e) => e.valor === estado)?.etiqueta || estado;
}

export function etiquetaTipo(tipo) {
  return TIPOS_CLIENTE.find((t) => t.valor === tipo)?.etiqueta || tipo;
}

export function formatoFecha(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatoCOP(valor) {
  const numero = Number(valor || 0);
  return '$' + numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
