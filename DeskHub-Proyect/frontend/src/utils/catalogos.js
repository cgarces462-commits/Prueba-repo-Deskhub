export const TIPOS_ESPACIO = [
  { valor: 'escritorio', etiqueta: 'Escritorio' },
  { valor: 'oficina_privada', etiqueta: 'Oficina privada' },
  { valor: 'sala_reunion', etiqueta: 'Sala de reunión' },
  { valor: 'sala_conferencia', etiqueta: 'Sala de conferencia' },
];

export const ESTADOS_RESERVA = [
  { valor: 'pendiente', etiqueta: 'Pendiente' },
  { valor: 'confirmada', etiqueta: 'Confirmada' },
  { valor: 'cancelada', etiqueta: 'Cancelada' },
  { valor: 'completada', etiqueta: 'Completada' },
];

export function etiquetaTipo(tipo) {
  return TIPOS_ESPACIO.find((t) => t.valor === tipo)?.etiqueta || tipo;
}

export function etiquetaEstado(estado) {
  return ESTADOS_RESERVA.find((e) => e.valor === estado)?.etiqueta || estado;
}

export function formatoFecha(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatoPrecio(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}
