# Mejoras de audio — Clicks en loops de samples

Este documento describe el problema de clicks/pops en la reproduccion de samples grabados con loop, las soluciones implementadas, y opciones alternativas que podrian retomarse a futuro.

---

## El problema

Los samples grabados del shrutibox MKS (~25 segundos cada uno) producen clicks audibles al reproducirse en loop continuo. El click ocurre en el **punto de loop**: cuando `Tone.Player` salta de `loopEnd` a `loopStart`, la forma de onda en ambos puntos no coincide, generando una discontinuidad audible.

Las propiedades `fadeIn` y `fadeOut` de `Tone.Player` solo aplican al inicio y fin de la reproduccion general (`.start()` / `.stop()`), **no** en los puntos de loop. Por lo tanto, cada salto de loop es un corte abrupto.

Este problema no afecta al instrumento sintetizado (Base Sound) porque genera la onda en tiempo real con osciladores continuos, ni al Shrutibox Prototype cuyos samples interpolados tienen mejor coincidencia en los puntos de corte.

---

## Soluciones implementadas

### MKS Crossfade (pre-procesamiento de samples)

**Enfoque**: eliminar la discontinuidad directamente en los archivos de audio.

El script `scripts/generate-mks-xfade-samples.sh` procesa cada grabacion WAV:

1. Extrae la region estable (1.0s a 23.0s, descartando transientes de inicio/fin).
2. Superpone los ultimos 2 segundos (con fade-out) sobre los primeros 2 segundos (con fade-in).
3. Recorta el resultado a 20 segundos, de modo que el final del archivo conecta suavemente con su inicio.

El motor usa `SampleAudioManager` con `loopStart: 0` y `loopEnd: null` (duracion completa del buffer), ya que el crossfade esta "baked-in" en el archivo.

**Ventajas**: sonido fiel a la grabacion original, sin artefactos de procesamiento en tiempo real.

**Desventajas**: requiere re-generar los samples si se cambian los parametros de crossfade.

**Refinamiento aplicado**: la primera version producia un click al iniciar la reproduccion por primera vez. Se corrigio con dos ajustes:
1. El script ahora aplica un fade-in de 50ms al inicio del body (`afade=t=in:d=0.05`) para que el archivo arranque desde silencio.
2. `SampleAudioManager.playNote()` inicia la reproduccion con un offset de 10ms (`player.start(undefined, 0.01)`) cuando `loopStart` es 0, para saltar el padding que el decoder MP3 introduce al inicio del archivo.

### MKS Drone (dual player granular con crossfade)

**Enfoque**: reproduccion granular con ciclo manual de dos players alternados via crossfade programatico.

El motor `GrainAudioManager` usa `Tone.GrainPlayer` con granos de 0.5 segundos y overlap de 0.15 segundos, pero **sin el loop built-in** de GrainPlayer. En su lugar, implementa la tecnica de **dual player cycling**:

```
Player A:  [====1s========~21s]───fade out───(dispose)
                               │
Player B:            [====1s========~21s]───fade out───(dispose)
                     │                   │
                  arranca con          Player C: [====1s====...
                  fade-in              arranca con fade-in
```

1. Un GrainPlayer se crea con `loop: false` y reproduce desde `loopStart` (1s)
2. Un timer se programa para `playDuration - crossfadeDuration` segundos (20s por defecto)
3. Antes de que el player alcance `loopEnd`, se crea un segundo GrainPlayer desde `loopStart`
4. Durante `crossfadeDuration` (2s) el viejo hace fade-out y el nuevo fade-in, usando nodos `Tone.Gain` individuales
5. El player viejo se destruye tras completar el crossfade
6. Se programa el siguiente ciclo con el nuevo player

El audio **nunca alcanza el punto de loop problematico**, eliminando completamente el click.

Al iniciar una nota, se aplica un fade-in suave de 2.5 segundos (`initialFadeIn`) para una entrada gradual tipo drone. Los ciclos posteriores usan su propio crossfade sin este fade-in adicional.

Usa los mismos samples originales MKS sin pre-procesamiento. Esta tecnica es la base de los dos instrumentos activos: **MKS Drone** (`GrainAudioManager`) y **MKS Realistic** (`RealisticGrainAudioManager`), que la extiende con bellows stagger.

**Ventajas**: no requiere archivos procesados, loop absolutamente transparente, sonido fiel al original, parametros ajustables.

**Desventajas**: caracter sonoro ligeramente textural/difuso por la granulacion, mayor uso de CPU.

**Historial de refinamientos**:

1. **Click al apagar notas** (resuelto): `Tone.GrainPlayer.stop()` cortaba los granos abruptamente. Se intercalo un nodo `Tone.Gain` individual por cada player. Al detener una nota, el gain se rampa a 0 durante `fadeOutTime` antes de stop/dispose.

2. **Click en el punto de loop** (resuelto): con `loop: true`, GrainPlayer saltaba abruptamente de `loopEnd` a `loopStart` cada ~22 segundos. Se evaluo usar samples crossfadeados y parametros de grano agresivos, pero ambas estrategias empeoraron el resultado. La solucion definitiva fue reemplazar el loop built-in por el ciclo manual de dual players con crossfade descrito arriba.

---

## Soluciones no implementadas (futuras)

Las siguientes opciones fueron evaluadas pero no implementadas. Se documentan para referencia en caso de querer explorarlas.

### Zero-crossing detection

**Concepto**: analizar la forma de onda de cada sample para encontrar puntos donde la amplitud cruza por cero (zero-crossings) y usarlos como `loopStart` y `loopEnd`. Si la onda esta en cero en ambos extremos del loop, la transicion es suave.

**Implementacion estimada**:
- Agregar un paso de analisis en el script de generacion (o en el init del motor) que recorra el buffer buscando zero-crossings cercanos a los puntos de loop deseados.
- Ajustar `loopStart` y `loopEnd` al zero-crossing mas cercano.
- Opcionalmente, buscar pares de zero-crossings donde la pendiente (derivada) tambien coincida para mayor suavidad.

**Ventajas**: no requiere procesamiento del archivo ni cambio en la tecnica de reproduccion.

**Desventajas**: no garantiza un loop seamless (la envolvente de amplitud puede diferir aunque la onda pase por cero), funciona mejor con ondas simples que con grabaciones complejas, requiere analisis adicional por sample.

**Cuando considerarla**: como optimizacion complementaria a las otras tecnicas, para afinar los puntos de loop del `SampleAudioManager` original.
