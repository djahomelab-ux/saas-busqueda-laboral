// Prueba contra el servicio Prolog real. Se omite si no está en ejecución:
//   swipl prolog/iniciar.pl
const prologClient = require('../../src/ia/prologClient');
const env = require('../../src/config/env');

let disponible = false;
beforeAll(async () => {
  try {
    await fetch(env.prologUrl, { signal: AbortSignal.timeout(1000) });
    disponible = true;
  } catch (_) { disponible = false; }
});

test('el servicio Prolog devuelve 60 % simple y 78 % ponderada para el ejemplo', async () => {
  if (!disponible) return console.warn(`Servicio Prolog no disponible en ${env.prologUrl}: prueba omitida`);
  const r = await prologClient.compatibilidad({
    habilidades: [
      { nombre: 'html', nivel: 'evidenciado' }, { nombre: 'css', nivel: 'evidenciado' },
      { nombre: 'javascript', nivel: 'evidenciado' }, { nombre: 'react', nivel: 'poco' }
    ],
    requisitos: [
      { nombre: 'html', tipo: 'obligatorio' }, { nombre: 'css', tipo: 'obligatorio' },
      { nombre: 'javascript', tipo: 'obligatorio' }, { nombre: 'react', tipo: 'obligatorio' },
      { nombre: 'git', tipo: 'deseable' }
    ]
  });
  expect(r.simple).toBe(60);
  expect(r.ponderada).toBe(78);
  expect(r.detalle.find((d) => d.habilidad === 'git').estado).toBe('no_evidenciado');
});
