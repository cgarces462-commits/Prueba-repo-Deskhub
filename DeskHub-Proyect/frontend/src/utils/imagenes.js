const IMAGENES = [
  '/images/espacio-1.svg',
  '/images/espacio-2.svg',
  '/images/espacio-3.svg',
  '/images/espacio-4.svg',
  '/images/espacio-5.svg',
  '/images/espacio-6.svg',
  '/images/espacio-7.svg',
  '/images/espacio-8.svg',
];

const POR_TIPO = {
  escritorio: [0, 1],
  oficina_privada: [2, 3],
  sala_reunion: [4, 5],
  sala_conferencia: [6, 7],
};

export function imagenesDeEspacio(espacio) {
  const personalizadas = (espacio?.imagenes || [])
    .filter((im) => im && im.url)
    .map((im) => im.url);
  if (personalizadas.length > 0) return personalizadas;

  const base = POR_TIPO[espacio?.tipo] || [0, 1];
  const giro = (espacio?.id || 1) % IMAGENES.length;
  const outro = (giro + 2) % IMAGENES.length;

  const ids = [];
  for (let i = 0; i < 4; i += 1) {
    ids.push(IMAGENES[base[i % base.length]]);
    const extra = (base[0] + outro + i) % IMAGENES.length;
    if (!ids.includes(IMAGENES[extra])) ids.push(IMAGENES[extra]);
  }
  return ids.slice(0, 5);
}