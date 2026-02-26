# Shrutibox MKS Realistic — Motor con Bellows Stagger

## Problema: el onset plano del drone digital

En los motores de audio existentes (`SampleAudioManager`, `GrainAudioManager`), al
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

## Parametros configurables

| Parametro | Default | Descripcion |
|-----------|---------|-------------|
| `cycleStart` | 5.0 | Posicion en el sample (segundos) donde arrancan los ciclos de sostenimiento. Debe ser una zona donde el drone ya es estable |
| `crossfadeDuration` | 4.0 | Duracion del fade-in del nuevo player en cada ciclo (segundos) |
| `fadeOutDelay` | 3.0 | Segundos que el viejo player espera antes de iniciar su fade-out, para que el nuevo suba primero |
| `fadeOutDuration` | 2.0 | Duracion del fade-out del viejo player una vez iniciado (segundos) |
| `bellows.msPerSemitone` | 90 | Milisegundos de delay por cada semitono de distancia desde la nota mas grave activa |
| `bellows.fadeInScalePerSemitone` | 0.04 | Factor multiplicador adicional del `initialFadeIn` por semitono (+4% por semitono) |

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

El bellows stagger usa `setTimeout` para arrancar las notas con delay. Si el
usuario detiene el drone antes de que todas las notas hayan arrancado, los
timeouts pendientes se cancelan automaticamente:

- `stopAll()` cancela **todos** los arranques pendientes.
- `stopNote(noteId)` cancela el arranque pendiente de esa nota especifica.
- Los IDs de los timeouts se almacenan en `this.pendingStarts` (un `Map<string, number>`).

## Diferencia con los otros motores

| Motor | Base | Loop | Onset |
|-------|------|------|-------|
| `SampleAudioManager` | Tone.Player | Loop built-in con fadeIn/fadeOut | Todas las notas simultaneas |
| `GrainAudioManager` | Tone.GrainPlayer | Dual player cycling con crossfade simultaneo | Todas las notas simultaneas, initialFadeIn uniforme |
| `RealisticGrainAudioManager` | Tone.GrainPlayer | Dual player cycling con crossfade escalonado (fadeOutDelay) desde cycleStart | Bellows stagger solo al onset + cycling seamless con arranque anticipado del nuevo player |

## Archivo

`src/audio/RealisticGrainAudioManager.js`

Registrado en `src/audio/instruments.js` como:
```javascript
{ id: 'mks-realistic', name: 'Shrutibox MKS Realistic', engine: mksRealisticManager }
```
