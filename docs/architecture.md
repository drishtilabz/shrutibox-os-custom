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
├── App.jsx                       # Componente raiz (StartScreen / ShrutiboxApp + footer)
├── index.css                     # Tailwind CSS + estilos del shrutibox
│
├── audio/
│   ├── audioEngine.js            # Proxy mutable: delega al motor de audio activo
│   ├── instruments.js            # Registro de instrumentos disponibles (MKS Drone, MKS Realistic)
│   ├── AudioManager.js           # Motor de sintesis (PolySynth fatsine) — oculto
│   ├── SampleAudioManager.js     # Motor de samples (Tone.Player con loop) — oculto
│   ├── GrainAudioManager.js      # Motor granular (dual player cycling con crossfade) — MKS Drone
│   ├── RealisticGrainAudioManager.js  # GrainAudioManager + bellows stagger — MKS Realistic
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
    └── featureFlags.js           # Feature flags (teclado, velocidad, instrumentos, version)
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
│                    instruments.js (Registro: MKS Drone, MKS Realistic)        │
│                                                                              │
│   ┌─────────────────────────────┐ ┌──────────────────────────────────┐       │
│   │   GrainAudioManager         │ │   RealisticGrainAudioManager      │       │
│   │   (MKS Drone — activo)      │ │   (MKS Realistic — activo)        │       │
│   │   /sounds-mks/              │ │   /sounds-mks/                    │       │
│   │   Tone.GrainPlayer          │ │   Tone.GrainPlayer                │       │
│   │   dual player cycling       │ │   dual player cycling             │       │
│   │   crossfade 2.0s            │ │   + bellows stagger (90ms/semi)   │       │
│   └──────────────┬──────────────┘ └──────────────────┬───────────────┘       │
│                  └─────────────────────┬──────────────┘                       │
│                                        ▼                                      │
│                                 Tone.Volume   →   Speaker                     │
│                                                                              │
│   noteMap.js: 13 notas cromaticas (Sa..Ni + komal/tivra + Sa↑)               │
│                                                                              │
│   Ocultos en instruments.js: AudioManager (Base Sound),                      │
│   SampleAudioManager (Shrutibox Prototype, Shrutibox MKS, MKS Crossfade)     │
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

La capa de audio ofrece dos motores activos e intercambiables a traves del proxy mutable `audioEngine.js`:

**MKS Drone** (`GrainAudioManager` — dual player granular con crossfade):
- Motor activo por defecto (ID: `mks-grain`).
- Usa `Tone.GrainPlayer` con la tecnica de **dual player cycling**.
- NO usa el loop built-in de GrainPlayer (que produce clicks). En su lugar, cicla manualmente dos GrainPlayers que se alternan con crossfade programatico de 2s. El audio nunca alcanza el punto de corte.
- Reproduce el audio en "granos" pequenos (0.5s) con overlap (0.15s) para un timbre difuso y envolvente.
- Cada player se conecta a un nodo `Tone.Gain` individual para control de crossfade y fade-out.
- Al iniciar una nota aplica un fade-in suave de 2.5s. Usa los samples originales MKS sin pre-procesamiento.

**MKS Realistic** (`RealisticGrainAudioManager` — dual player granular + bellows stagger):
- Motor activo (ID: `mks-realistic`). Extiende `GrainAudioManager`.
- Simula el comportamiento fisico del fuelle: al activar multiples notas, las graves suenan primero y las agudas entran con delay progresivo (90ms/semitono), replicando como el aire del fuelle tarda mas en hacer vibrar lengüetas mas pequenas.
- Fade-in escalado: las notas agudas tardan ligeramente mas en alcanzar volumen pleno (+4%/semitono).
- Ciclos de sostenimiento con `cycleStart: 5.0s` (zona estable del drone) y crossfade asimetrico de 4.0s.
- Bellows release: al detener el drone, las notas agudas se apagan primero.
- Ver [`docs/realistic-engine.md`](realistic-engine.md) para documentacion detallada.

Todos los motores activos:
- Exponen la misma interfaz publica: `init()`, `playNote()`, `stopNote()`, `playNotes()`, `stopAll()`, `setVolume()`, `setSpeed()`, `dispose()`.
- Se enrutan a un nodo `Tone.Volume` maestro (-6dB por defecto).
- Las instancias se crean en `instruments.js` con `basePath='/sounds-mks'`.

**Motores ocultos** (disponibles en codigo, no registrados en la UI):
- `AudioManager` (Base Sound): sintesis PolySynth fatsine, sin samples.
- `SampleAudioManager` con `/sounds/`: Shrutibox Prototype, samples interpolados.
- `SampleAudioManager` con `/sounds-mks/`: Shrutibox MKS, loop directo con click audible.
- `SampleAudioManager` con `/sounds-mks-xfade/`: MKS Crossfade, samples con crossfade baked-in.

**Registro de instrumentos** (`instruments.js`): define la lista de instrumentos activos, cada uno con un `id`, `name` y referencia a su `engine`. Instrumentos inactivos estan comentados en el mismo archivo.

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

`config/featureFlags.js` permite activar/desactivar funcionalidades sin modificar los componentes:

| Flag                     | Default | Descripcion                                                        |
| ------------------------ | ------- | ------------------------------------------------------------------ |
| `ENABLE_KEYBOARD`        | on      | Soporte de teclado fisico                                          |
| `ENABLE_SPEED_CONTROL`   | off     | Control de velocidad del envelope (desactivado por defecto)        |
| `ENABLE_MOBILE_LAYOUT`   | on      | Layout optimizado para movil                                       |
| `ENABLE_INSTRUMENT_SELECTOR` | on  | Selector de instrumento en la UI                                   |
| `SHOW_VERSION`           | off     | Muestra la version del release en el footer (placeholder hasta v1.0.0) |

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

---

## Autor

Desarrollado por [Lucas Paiva](https://github.com/lucaspaiva-dev).

Basado en el instrumento fisico Monoj Kumar Sardar 440Hz.
