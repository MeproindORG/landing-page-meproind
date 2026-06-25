/**
 * Banda de contexto bajo el StatBand. Muestra un dato de PlanetGOLD sobre la
 * minería MAPE — introduce el carrusel de abajo (20%/30%/60% ↔ las 3 imágenes
 * "Deja de…"). Antes mostraba 4 trust items; se reemplazó por esta frase.
 */
export default function TrustStrip() {
  return (
    <section className="trust">
      <div className="wrap">
        <p className="planet-stat">
          Según <b>PlanetGOLD</b> el <span className="o">20%</span> de la minería MAPE sigue estancada en el pasado, un <span className="o">30%</span> depende de plantas de concentración y un <span className="o">60%</span> arriesga su capital de trabajo usando mercurio.
        </p>
      </div>
    </section>
  );
}
