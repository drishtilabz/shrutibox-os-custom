# Arquitectura — Shrutibox Digital

Replica digital de un shrutibox Monoj Kumar Sardar 440Hz. Construida con React 19, Vite, Tone.js y Zustand.

---

## Stack tecnologico

| Paquete     | Version | Proposito            |
| ----------- | ------- | -------------------- |
| React       | 19.2.0  | Framework de UI      |
| React-DOM   | 19.2.0  | Renderizado DOM      |
| Tone.js     | 15.1.22 | Sintesis y samples   |
| Zustand     | 5.0.11  | Gestion de estado    |
| Tailwind CSS| 4.2.0   | Estilos              |
| Vite        | 7.3.1   | Bundler / dev server |

---

## Estructura de archivos

```
src/
├── main.jsx                      # Punto de entrada (monta <App />)
├── App.jsx                       # Componente raiz (StartScreen / ShrutiboxApp)
├── index.css                     # Tailwind CSS + estilos del shrutibox
│
├── audio/
│   ├── audioEngine.js            # Proxy mutable: delega al motor de audio activo
│   ├── instruments.js            # Registro de instrumentos disponibles
│   ├── AudioManager.js           # Motor de sintesis (PolySynth fatsine)
│   ├── SampleAudioManager.js     # Motor de samples (Tone.Player con loop)
│   ├── GrainAudioManager.js      # Motor granular (dual player cycling con crossfade)
│   └── noteMap.js                # 13 notas cromaticas (Sargam + komal/tivra)
│
├── store/
│   └── useShrutiStore.js         # Store global (Zustand)
│
├── components/
│   ├── Display.jsx               # Panel informativo (nota activa, estado)
│   ├── NoteGrid.jsx              # Panel frontal del shrutibox (13 lengüetas)
│   ├── NoteButton.jsx            # Lengüeta individual (toggle switch)
│   └── Controls.jsx              # Controles: instrumento, Play/Stop, volumen, velocidad
│
├── hooks/
│   └── useKeyboard.js            # Mapeo de teclado fisico (estilo piano, 13 notas)
│
└── config/
    └── featureFlags.js           # Feature flags (teclado, velocidad, instrumentos)
```

---

## Arquitectura de 3 capas

La aplicacion sigue una separacion clara en tres capas:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACION (React)                     │
│                                                                     │
│   Display ◄──────── NoteGrid ◄──────── Controls                    │
│   (estado)      (13 NoteButton)     (Instr/Play/Vol)               │
│                      │                     │                        │
└──────────────────────┼─────────────────────┼────────────────────────┘
                       │ toggleNote()        │ togglePlay()
                       │                     │ setVolume()
                       ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE ESTADO (Zustand)                         │
│                    useShrutiStore.js                                 │
│                                                                     │
│   ┌────────────┬──────────────┬─────────┬─────────┐                │
│   │initialized │ selectedNotes│ playing │ volume  │                │
│   │instrumentId│   string[]   │  bool   │  0-1    │                │
│   │            │              │         │  speed  │                │
│   └────────────┴──────┬───────┴────┬────┴─────────┘                │
│                       │            │                                │
└───────────────────────┼────────────┼────────────────────────────────┘
                        │            │
         playNote()     │ playNotes()│         setVolume()
         stopNote()     │ stopAll()  │         setSpeed()
                        ▼            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    CAPA DE AUDIO (Tone.js)                                    │
│                    audioEngine.js (Proxy mutable)                             │
│                    instruments.js (Registro)                                  │
│                                                                              │
│   ┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐               │
│   │ AudioManager   │ │SampleAudioManager│ │SampleAudioManager│               │
│   │ (Base Sound)   │ │(Shrutibox Proto) │ │ (Shrutibox MKS)  │               │
│   │ PolySynth      │ │ /sounds/         │ │ /sounds-mks/     │               │
│   │ fatsine        │ │ Tone.Player+loop │ │ Tone.Player+loop │               │
│   └───────┬────────┘ └────────┬─────────┘ └────────┬─────────┘               │
│           │                   │                     │                         │
│   ┌───────┴────────────┐ ┌───┴──────────────┐      │                         │
│   │SampleAudioManager  │ │GrainAudioManager │      │                         │
│   │ (MKS Crossfade)    │ │ (MKS Grain)      │      │                         │
│   │ /sounds-mks-xfade/ │ │ /sounds-mks/     │      │                         │
│   │ Tone.Player+loop   │ │ dual player      │      │                         │
│   │ (crossfade baked)  │ │ cycling+crossfade│      │                         │
│   └───────┬────────────┘ └───┬──────────────┘      │                         │
│           └──────┬───────────┴──────────┬───────────┘                         │
│                  ▼                                                            │
│           Tone.Volume   →   Speaker                                           │
│                                                                              │
│   noteMap.js: 13 notas cromaticas (Sa..Ni + komal/tivra + Sa↑)               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1. Presentacion (React)

Componentes que renderizan la UI y capturan interacciones:

- **Display** — muestra la nota seleccionada, estado de reproduccion y cantidad de notas activas.
- **NoteGrid** — panel frontal del shrutibox con 13 lengüetas dispuestas horizontalmente. Fondo con textura de madera.
- **NoteButton** — lengüeta toggle con tres estados visuales: cerrada (no seleccionada), abierta (seleccionada) y vibrando (seleccionada + reproduciendo). Las notas komal/tivra se diferencian visualmente.
- **Controls** — selector de instrumento, Play/Stop, slider de volumen y control de velocidad.

### 2. Estado (Zustand)

Store centralizado con estado reactivo:

| Estado          | Tipo       | Descripcion                          |
| --------------- | ---------- | ------------------------------------ |
| `initialized`   | `boolean`  | Audio context listo                  |
| `instrumentId`  | `string`   | ID del instrumento activo            |
| `selectedNotes` | `string[]` | IDs de notas activas                 |
| `playing`       | `boolean`  | Drone activo                         |
| `volume`        | `number`   | Volumen maestro (0-1)                |
| `speed`         | `number`   | Multiplicador de envelope (0.25-3)   |

Acciones principales: `init()`, `setInstrument(id)`, `toggleNote(noteId)`, `togglePlay()`, `setVolume()`, `setSpeed()`, `reset()`.

### 3. Audio (Tone.js)

La capa de audio ofrece multiples motores intercambiables a traves del proxy mutable `audioEngine.js`:

**Base Sound** (`AudioManager` — sintesis en tiempo real):
- Crea un `PolySynth` con oscilador `fatsine` (spread:12, count:3) por cada nota.
- Envelope configurable: Attack=0.08, Decay=0.3, Sustain=0.9, Release=0.8.
- No requiere archivos de audio externos.

**Shrutibox Prototype** (`SampleAudioManager` — samples interpolados):
- Precarga buffers de audio desde archivos MP3 en `/sounds/`.
- Reproduce con `Tone.Player` en loop continuo (loopStart/loopEnd + fadeIn/fadeOut).
- Los 13 samples se generan por pitch-shifting desde un unico WAV fuente con `scripts/generate-samples.sh`.

**Shrutibox MKS** (`SampleAudioManager` — grabaciones reales):
- Precarga buffers de audio desde archivos MP3 en `/sounds-mks/`.
- Usa la misma clase `SampleAudioManager` con `basePath='/sounds-mks'`.
- Los 13 samples provienen de grabaciones individuales del shrutibox Monoj Kumar Sardar, convertidas con `scripts/generate-mks-samples.sh`.
- Nota: puede producir clicks audibles en los puntos de loop debido a discontinuidades en la forma de onda al saltar de `loopEnd` a `loopStart`. Los instrumentos MKS Crossfade y MKS Grain resuelven este problema con enfoques distintos.

**MKS Crossfade** (`SampleAudioManager` — samples con crossfade pre-procesado):
- Usa la misma clase `SampleAudioManager` con `basePath='/sounds-mks-xfade'` y loop configurado para reproducir el buffer completo (`loopStart: 0`, `loopEnd: null`).
- Los samples se generan con `scripts/generate-mks-xfade-samples.sh`, que aplica un crossfade de 2 segundos entre el final y el inicio de cada archivo, eliminando discontinuidades en el punto de loop.
- Resultado: loop seamless con sonido fiel a la grabacion original.

**MKS Grain** (`GrainAudioManager` — dual player granular con crossfade):
- Motor independiente que usa `Tone.GrainPlayer` con la tecnica de **dual player cycling**.
- NO usa el loop built-in de GrainPlayer (que produce clicks al saltar de `loopEnd` a `loopStart`). En su lugar, cicla manualmente dos GrainPlayers que se alternan con crossfade programatico: antes de que el player activo llegue al final de la region, arranca un segundo player desde el inicio y hace crossfade entre ambos (2 segundos por defecto). El audio nunca alcanza el punto de corte.
- Reproduce el audio en "granos" pequenos (0.5s) con overlap (0.15s) para suavizar la textura.
- Cada player se conecta a un nodo `Tone.Gain` individual para controlar el crossfade y el fade-out al detener notas.
- Al iniciar una nota, aplica un fade-in suave de 2.5 segundos (`initialFadeIn`) para una entrada gradual. Los ciclos posteriores del dual player usan su propio crossfade sin este fade-in adicional.
- Usa los mismos samples originales MKS (`/sounds-mks/`); no requiere pre-procesamiento.
- El caracter sonoro es ligeramente textural/difuso, ideal para drones ambientales.

Todos los motores:
- Exponen la misma interfaz publica: `init()`, `playNote()`, `stopNote()`, `playNotes()`, `stopAll()`, `setVolume()`, `setSpeed()`, `dispose()`.
- Se enrutan a un nodo `Tone.Volume` maestro (-6dB por defecto).
- `AudioManager` es un singleton. `SampleAudioManager` y `GrainAudioManager` exportan clases, y las instancias se crean en `instruments.js` con distintos `basePath` y opciones.

**Registro de instrumentos** (`instruments.js`): define la lista de instrumentos disponibles, cada uno con un `id`, `name` y referencia a su `engine`.

**Proxy mutable** (`audioEngine.js`): envuelve el motor activo y delega todas las llamadas. El store llama `audioEngine.setEngine()` al cambiar de instrumento.

---

## Mapa de notas (sistema Sargam cromatico)

```
┌──┬───┬──┬───┬──┬──┬───┬──┬───┬───┬───┬──┬──┐
│Sa│Re♭│Re│Ga♭│Ga│Ma│Ma♯│Pa│Dha♭│Dha│Ni♭│Ni│Sa│
│C3│Db3│D3│Eb3│E3│F3│F#3│G3│Ab3 │A3 │Bb3│B3│C4│
└──┴───┴──┴───┴──┴──┴───┴──┴───┴───┴───┴──┴──┘
```

13 notas cromaticas: 7 shuddh (naturales) + 4 komal (bemol) + 1 tivra (sostenido) + Sa agudo.

---

## Mapeo de teclado (estilo piano)

El hook `useKeyboard` conecta el teclado fisico con la app:

**Fila inferior (shuddh):**

| Tecla | Nota      |
| ----- | --------- |
| A     | Sa        |
| S     | Re        |
| D     | Ga        |
| F     | Ma        |
| G     | Pa        |
| H     | Dha       |
| J     | Ni        |
| K     | Sa (alto) |

**Fila superior (komal/tivra):**

| Tecla | Nota       |
| ----- | ---------- |
| W     | Re komal   |
| E     | Ga komal   |
| T     | Ma tivra   |
| Y     | Dha komal  |
| U     | Ni komal   |

| Tecla   | Accion    |
| ------- | --------- |
| Espacio | Play/Stop |

---

## Feature flags

`config/featureFlags.js` permite activar/desactivar funcionalidades:

| Flag                  | Default | Descripcion                                      |
| --------------------- | ------- | ------------------------------------------------ |
| keyboard              | on      | Soporte de teclado fisico                        |
| speedControl          | off     | Control de velocidad del envelope (desactivado)  |
| mobileLayout          | on      | Layout optimizado para movil                     |
| instrumentSelector    | on      | Selector de instrumento en la UI                 |

---

## Patrones clave

- **Toggle-then-play**: las notas se seleccionan antes de reproducir; el drone suena con todas las notas seleccionadas simultaneamente.
- **Modificacion en tiempo real**: se pueden agregar o quitar notas durante la reproduccion sin interrumpir el drone.
- **Instrumentos intercambiables**: `audioEngine.js` actua como proxy mutable, delegando al motor del instrumento seleccionado por el usuario.
- **Instancias de audio**: `AudioManager` exporta un singleton. `SampleAudioManager` y `GrainAudioManager` exportan clases para permitir multiples instancias con distintos `basePath` y opciones. Las instancias se crean en `instruments.js`. El proxy `audioEngine` es singleton.
- **Inicializacion por interaccion**: el navegador requiere un gesto del usuario para iniciar el `AudioContext`; el `StartScreen` cumple este requisito.
- **Zustand reactivo**: los componentes se suscriben solo a las porciones del store que necesitan, evitando re-renders innecesarios.

---

## Mejoras de audio pendientes

Se documentan opciones adicionales para resolver clicks en loops de samples que no fueron implementadas pero podrian retomarse a futuro. Ver [docs/audio-improvements.md](audio-improvements.md) para el detalle completo.
