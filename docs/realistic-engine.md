# MKS Realistic — Motor con Bellows Stagger

## Problema: el onset plano del drone digital

En los motores de audio anteriores (`SampleAudioManager`, `GrainAudioManager` / MKS Drone), al
presionar Play todas las notas seleccionadas arrancan simultaneamente con el mismo
fade-in. Esto produce un drone que "aparece" de golpe, algo que un shrutibox
analogico real nunca hace.

## El fenomeno fisico

En un shrutibox real, las lenguetas metalicas tienen distintos tamanos y grosores
segun su afinacion. Al accionar el fuelle:

1. El aire entra al canal comun y comienza a presurizar la camara.
2. Las lenguetas **graves** (mas grandes, menor frecuencia de resonancia) necesitan
   menos presion para comenzar a vibrar, asi que suenan primero.
3. Conforme la presion del fuelle aumenta, las lenguetas **agudas** (mas pequenas,
   mayor rigidez) empiezan a vibrar progresivamente.
4. Tras un momento, todas las lenguetas activas suenan juntas a volumen pleno.

El resultado es un onset escalonado de grave a agudo que le da al instrumento un
caracter organico y vivo que lo distingue de un simple drone electronico.

## Solucion: bellows stagger

`RealisticGrainAudioManager` replica este efecto con dos mecanismos:

### 1. Delay escalonado por semitonos (`playNotes`)

Al iniciar multiples notas, el motor:

- Ordena las notas seleccionadas de grave a agudo por su indice cromatico.
- La nota mas grave arranca inmediatamente.
- Cada nota sucesiva recibe un delay calculado como:
  `delay = (semitonos_desde_la_mas_grave) * msPerSemitone`

Ejemplo con Sa (semitono 0) y Pa (semitono 7) a 90 ms/semitono:
- Sa arranca al instante (0 ms).
- Pa arranca a los 630 ms.

### 2. Fade-in escalado por pitch (`playNote`)

El `initialFadeIn` base (2.5 s) se multiplica por un factor que crece con la
posicion cromatica:

```
fadeIn = initialFadeIn * (1 + indiceCromatico * fadeInScalePerSemitone)
```

Ejemplo con `fadeInScalePerSemitone = 0.04`:
- Sa (indice 0): 2.5 s * 1.00 = 2.50 s
- Pa (indice 7): 2.5 s * 1.28 = 3.20 s
- Sa alto (indice 12): 2.5 s * 1.48 = 3.70 s

Combinado con el delay de arranque, las notas agudas no solo empiezan mas tarde
sino que tambien tardan un poco mas en alcanzar volumen pleno.

### 3. Drone constante tras el onset (`cycleStart` + crossfade escalonado)

Una vez que el drone esta establecido, los ciclos de sostenimiento deben ser
completamente imperceptibles. Para lograrlo, el motor combina dos tecnicas:

#### a) Punto de inicio diferenciado

- **`loopStart`** (1.0s): solo lo usa `playNote()` para el onset inicial. Esta
  posicion tiene el caracter natural del reed comenzando a vibrar.
- **`cycleStart`** (5.0s): lo usa `_cyclePlayer()` para los ciclos de sostenimiento.
  En esta posicion el drone ya es estable y homogeneo, sin caracter de onset.

#### b) Crossfade escalonado con `fadeOutDelay` (solucion del desarrollador)

El desarrollador identifico que la causa principal de la transicion perceptible
era que el fade-in del nuevo player y el fade-out del viejo arrancaban en el
**mismo instante**. Con un crossfade lineal simultaneo, se produce un dip de
~3dB en el punto medio (la percepcion de volumen es logaritmica), amplificado
por las micro-variaciones del GrainPlayer.

**La solucion** fue desacoplar los dos ramps: el nuevo player arranca y sube a
volumen pleno **antes** de que el viejo comience su fade-out. Asi, cuando el
viejo empieza a bajar, el nuevo ya esta casi al 100% y no se percibe ningun
hueco.

```
Crossfade ANTERIOR (simultaneo, se percibia dip):

  t=0s        t=1s        t=2s        t=3s        t=4s
   |           |           |           |           |
  Old  ███████▓▓▓▓▓▓▒▒▒▒▒▒░░░░░░░
  gain: 1.0    0.75   0.50↓   0.25    0.0     ← dip perceptible
  New        ░░░░░░░▒▒▒▒▒▒▓▓▓▓▓▓▓███████          en el medio
  gain: 0.0    0.25   0.50↑   0.75    1.0


Crossfade ACTUAL (escalonado, transicion imperceptible):

  t=0s        t=1s        t=2s        t=3s        t=4s        t=5s
   |           |           |           |           |           |
  New  ░░░░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓████████████████████████████████
  gain: 0.0    0.25        0.50        0.75        1.0         1.0
       ├──────── fade-in (crossfadeDuration: 4.0s) ──────────┤

  Old  ███████████████████████████████████████▓▓▓▓▓▓▓▒▒▒▒▒░░░░░░░
  gain: 1.0    1.0         1.0         1.0   │ 0.66   0.33   0.0
                                              ├─ fadeOutDuration ─┤
                                              ↑
                                         fadeOutDelay (3.0s)
```

La clave: el viejo player **se mantiene a volumen pleno** durante 3 segundos
mientras el nuevo sube. Recien cuando el nuevo esta al ~75%, el viejo inicia
un fade-out corto de 2 segundos. Nunca hay un momento donde ambos esten bajos.

El efecto realista (bellows stagger + fade-in escalado) aplica **unicamente al
onset inicial**. Los ciclos de sostenimiento producen un drone constante y fluido,
replicando a un buen ejecutor de shrutibox que mantiene el flujo de aire estable.

## Bellows Release (apagado escalonado)

El motor implementa tambien el efecto espejo al detener el drone (boton stop o
cambio de instrumento): las lengüetas agudas dejan de vibrar primero y las
graves se apagan con un retraso progresivo, replicando el vaciado natural del
fuelle donde la presion de aire cae y las lenguetas pequeñas (de mayor rigidez)
son las primeras en detenerse.

### 1. Delay escalonado inverso (`stopNotes`)

Al detener multiples notas, el motor:

- Ordena las notas seleccionadas de agudo a grave por su indice cromatico.
- La nota mas aguda inicia su fade-out inmediatamente.
- Cada nota sucesiva recibe un delay calculado como:
  `delay = (semitonos_desde_la_mas_aguda) * msPerSemitone`

Ejemplo con Sa (semitono 0) y Pa (semitono 7) a 90 ms/semitono:
- Pa inicia el fade-out al instante (0 ms).
- Sa inicia el fade-out a los 630 ms.

### 2. Fade-out escalado por pitch (`_scaledFadeOut`)

El fade-out de cada nota se escala con la posicion cromatica invertida, de modo
que las notas graves (mayor inercia mecanica de la lengueta) se apagan mas
lentamente:

```
fadeOut = initialFadeIn * (1 + (12 - indiceCromatico) * fadeInScalePerSemitone)
```

Ejemplo con `fadeInScalePerSemitone = 0.04`:
- Sa alto (indice 12): 2.5 s * 1.00 = 2.50 s
- Pa (indice 7):        2.5 s * 1.20 = 3.00 s
- Sa grave (indice 0):  2.5 s * 1.48 = 3.70 s

### Timeline completo: onset + release

```
ONSET (Play) — grave a agudo:        RELEASE (Stop) — agudo a grave:

Sa  ░░▒▒▓▓████████████████           Sa  ████████████████████▓▓▒▒░░
     |                                                    | delay 630ms
     t=0                                                  t=630ms → fade 3.7s

Pa     ░░▒▒▓▓████████████            Pa  ████████████▓▓▓▒▒░░
       |                                  |
       t=630ms                            t=0 → fade 3.0s
```

### Interaccion con el bellows onset

Si el usuario presiona Play mientras un release escalonado esta en curso:
- `playNote()` cancela el stop pendiente de esa nota individual.
- `playNotes()` cancela todos los stops pendientes antes de iniciar el nuevo onset.

Esto garantiza que un Play rapido despues de Stop no deje timeouts huerfanos.

### Alcance del efecto

| Accion | Comportamiento |
|--------|---------------|
| Boton Stop (todas las notas) | Release escalonado agudo → grave |
| Cambio de instrumento | Release escalonado agudo → grave |
| Deseleccionar una nota individual | Fade-out rapido (80 ms), sin escalonado |

## Parametros configurables

| Parametro | Default | Descripcion |
|-----------|---------|-------------|
| `cycleStart` | 5.0 | Posicion en el sample (segundos) donde arrancan los ciclos de sostenimiento. Debe ser una zona donde el drone ya es estable |
| `crossfadeDuration` | 4.0 | Duracion del fade-in del nuevo player en cada ciclo (segundos) |
| `fadeOutDelay` | 3.0 | Segundos que el viejo player espera antes de iniciar su fade-out, para que el nuevo suba primero |
| `fadeOutDuration` | 2.0 | Duracion del fade-out del viejo player una vez iniciado (segundos) |
| `bellows.msPerSemitone` | 90 | Milisegundos de delay por cada semitono de distancia. Aplica tanto al onset (grave→agudo) como al release (agudo→grave) |
| `bellows.fadeInScalePerSemitone` | 0.04 | Factor multiplicador adicional por semitono (+4% por semitono). Aplica al fade-in del onset (escala hacia agudos) y al fade-out del release (escala hacia graves, con indice invertido) |

Se pasan como opciones al constructor:

```javascript
new RealisticGrainAudioManager('/sounds-mks', {
  cycleStart: 5.0,
  crossfadeDuration: 4.0,
  fadeOutDelay: 3.0,
  fadeOutDuration: 2.0,
  bellows: {
    msPerSemitone: 120,
    fadeInScalePerSemitone: 0.06,
  },
});
```

## Limpieza de timeouts

El bellows stagger y el bellows release usan `setTimeout` para arrancar y detener
las notas con delay. Los timeouts se cancelan automaticamente en los siguientes casos:

**Arranques pendientes (`pendingStarts`):**
- `stopAll()` cancela **todos** los arranques pendientes antes del release.
- `stopNote(noteId)` cancela el arranque pendiente de esa nota especifica.

**Paradas pendientes (`pendingStops`):**
- `playNote(noteId)` cancela la parada pendiente de esa nota (re-play durante release).
- `playNotes()` cancela **todas** las paradas pendientes antes del nuevo onset.
- `dispose()` cancela todos los pendingStops restantes.

Los IDs de los timeouts se almacenan en `this.pendingStarts` y `this.pendingStops`
(ambos `Map<string, number>`).

## Diferencia con los otros motores

| Motor | Instrumento UI | Base | Loop | Onset | Release |
|-------|----------------|------|------|-------|---------|
| `SampleAudioManager` | Shrutibox MKS (oculto) | Tone.Player | Loop built-in con fadeIn/fadeOut | Todas las notas simultaneas | Fade-out rapido uniforme |
| `GrainAudioManager` | MKS Drone | Tone.GrainPlayer | Dual player cycling con crossfade simultaneo | Todas las notas simultaneas, initialFadeIn uniforme | Fade-out rapido uniforme |
| `RealisticGrainAudioManager` | MKS Realistic | Tone.GrainPlayer | Dual player cycling con crossfade escalonado (fadeOutDelay) desde cycleStart | Bellows stagger: grave→agudo con delay y fade-in escalado | Bellows release: agudo→grave con delay y fade-out escalado |

## Archivo

`src/audio/RealisticGrainAudioManager.js`

Registrado en `src/audio/instruments.js` como:
```javascript
{ id: 'mks-realistic', name: 'MKS Realistic', engine: mksRealisticManager }
```

---

Desarrollado por [Lucas Paiva](https://github.com/lucaspaiva-dev).
