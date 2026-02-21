# Arquitectura — Shrutibox Digital

Réplica digital de un shrutibox Monoj Kumar Sardar 440Hz. Construida con React 19, Vite, Tone.js y Zustand.

---

## Stack tecnológico

| Paquete     | Versión | Propósito            |
| ----------- | ------- | -------------------- |
| React       | 19.2.0  | Framework de UI      |
| React-DOM   | 19.2.0  | Renderizado DOM      |
| Tone.js     | 15.1.22 | Síntesis y samples   |
| Zustand     | 5.0.11  | Gestión de estado    |
| Tailwind CSS| 4.2.0   | Estilos              |
| Vite        | 7.3.1   | Bundler / dev server |

---

## Estructura de archivos

```
src/
├── main.jsx                      # Punto de entrada (monta <App />)
├── App.jsx                       # Componente raíz (StartScreen / ShrutiboxApp)
├── index.css                     # Import de Tailwind CSS
│
├── audio/
│   ├── audioEngine.js            # Proxy mutable: delega al motor de audio activo
│   ├── instruments.js            # Registro de instrumentos disponibles
│   ├── AudioManager.js           # Motor de síntesis (PolySynth fatsine)
│   ├── SampleAudioManager.js     # Motor de samples (Tone.Player con loop)
│   └── noteMap.js                # Definiciones de notas (sistema Sargam, frecuencias)
│
├── store/
│   └── useShrutiStore.js         # Store global (Zustand)
│
├── components/
│   ├── Display.jsx               # Panel informativo (nota activa, estado, octava)
│   ├── NoteGrid.jsx              # Layout de notas por octava
│   ├── NoteButton.jsx            # Botón toggle individual de nota
│   └── Controls.jsx              # Controles: instrumento, Play/Stop, volumen, octava, velocidad
│
├── hooks/
│   └── useKeyboard.js            # Mapeo de teclado físico (A-J, Espacio)
│
└── config/
    └── featureFlags.js           # Feature flags (teclado, octava, velocidad, instrumentos)
```

---

## Arquitectura de 3 capas

La aplicación sigue una separación clara en tres capas:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN (React)                     │
│                                                                     │
│   Display ◄──────── NoteGrid ◄──────── Controls                    │
│   (estado)      (NoteButton[])      (Instr/Play/Vol/Oct/Speed)     │
│                      │                     │                        │
└──────────────────────┼─────────────────────┼────────────────────────┘
                       │ toggleNote()        │ togglePlay()
                       │                     │ setVolume()
                       ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE ESTADO (Zustand)                         │
│                    useShrutiStore.js                                 │
│                                                                     │
│   ┌────────────┬──────────────┬─────────┬─────────┬──────────┐     │
│   │initialized │ selectedNotes│ playing │ volume  │  speed   │     │
│   │   mode     │   string[]   │  bool   │  0-1    │ 0.25-3   │     │
│   │instrumentId│              │         │         │          │     │
│   └────────────┴──────┬───────┴────┬────┴────┬────┴──────────┘     │
│                       │            │         │                      │
└───────────────────────┼────────────┼─────────┼──────────────────────┘
                        │            │         │
         playNote()     │ playNotes()│         │ setVolume()
         stopNote()     │ stopAll()  │         │ setSpeed()
                        ▼            ▼         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE AUDIO (Tone.js)                          │
│                    audioEngine.js (Proxy mutable)                   │
│                    instruments.js (Registro)                        │
│                                                                     │
│   ┌───────────────────────────┐  ┌────────────────────────────┐    │
│   │ Base Sound (AudioManager) │  │ Shrutibox Prototype        │    │
│   │ Map<noteId, PolySynth>    │  │ (SampleAudioManager)       │    │
│   │ fatsine, spread:12        │  │ Map<noteId, Player> + loop │    │
│   └─────────────┬─────────────┘  └──────────────┬─────────────┘    │
│                 └──────────┬────────────────────┘                  │
│                            ▼                                        │
│                     Tone.Volume   →   Speaker                       │
│                                                                     │
│   noteMap.js: Sa Re Ga Ma Pa Dha Ni × 3 octavas + Sa_6             │
└─────────────────────────────────────────────────────────────────────┘
```

### 1. Presentación (React)

Componentes que renderizan la UI y capturan interacciones:

- **Display** — muestra la nota seleccionada, estado de reproducción, indicadores de octava y cantidad de notas activas.
- **NoteGrid** — organiza las notas por octava y renderiza un `NoteButton` por cada nota disponible.
- **NoteButton** — botón toggle con tres estados visuales: no seleccionado, seleccionado (sin reproducir) y seleccionado + reproduciendo (con animación de pulso).
- **Controls** — selector de instrumento, Play/Stop, slider de volumen, selector de octava (modo 3 octavas) y control de velocidad.

### 2. Estado (Zustand)

Store centralizado con estado reactivo:

| Estado          | Tipo       | Descripción                          |
| --------------- | ---------- | ------------------------------------ |
| `initialized`   | `boolean`  | Audio context listo                  |
| `mode`          | `string`   | `'1oct'` o `'3oct'`                  |
| `instrumentId`  | `string`   | ID del instrumento activo            |
| `selectedNotes` | `string[]` | IDs de notas activas                 |
| `playing`       | `boolean`  | Drone activo                         |
| `volume`        | `number`   | Volumen maestro (0-1)                |
| `octave`        | `number`   | Octava del teclado (3, 4 o 5)       |
| `speed`         | `number`   | Multiplicador de envelope (0.25-3)   |

Acciones principales: `init(mode)`, `setInstrument(id)`, `toggleNote(noteId)`, `togglePlay()`, `setVolume()`, `setOctave()`, `setSpeed()`, `reset()`.

### 3. Audio (Tone.js)

La capa de audio ofrece múltiples motores intercambiables a través del proxy mutable `audioEngine.js`:

**Base Sound** (`AudioManager` — síntesis en tiempo real):
- Crea un `PolySynth` con oscilador `fatsine` (spread:12, count:3) por cada nota.
- Envelope configurable: Attack=0.08, Decay=0.3, Sustain=0.9, Release=0.8.
- No requiere archivos de audio externos.

**Shrutibox Prototype** (`SampleAudioManager` — samples pregrabados):
- Precarga buffers de audio desde archivos MP3 (`noteMap.js` → propiedad `file`).
- Reproduce con `Tone.Player` en loop continuo (loopStart/loopEnd + fadeIn/fadeOut).
- Los samples se generan con `scripts/generate-samples.sh` desde un WAV fuente.

Todos los motores:
- Exponen la misma interfaz pública: `init()`, `playNote()`, `stopNote()`, `playNotes()`, `stopAll()`, `setVolume()`, `setSpeed()`, `dispose()`.
- Se enrutan a un nodo `Tone.Volume` maestro (-6dB por defecto).
- Son singletons exportados como instancia única.

**Registro de instrumentos** (`instruments.js`): define la lista de instrumentos disponibles, cada uno con un `id`, `name` y referencia a su `engine`. Agregar un nuevo instrumento requiere solo añadir una entrada al array `INSTRUMENTS`.

**Proxy mutable** (`audioEngine.js`): envuelve el motor activo y delega todas las llamadas. El store llama `audioEngine.setEngine()` al cambiar de instrumento, lo que permite la transición en caliente sin reiniciar la aplicación. Si el drone está sonando, el cambio detiene las notas en el motor anterior, inicializa el nuevo si es necesario, y re-reproduce las notas seleccionadas.

---

## Flujo de navegación

```
main.jsx
  │
  └─► App.jsx
        │
        ├── ¿initialized? ── NO ──► StartScreen
        │                              │
        │                              ├── Botón "1 Octava" ──► init('1oct')
        │                              └── Botón "3 Octavas" ──► init('3oct')
        │                                         │
        │                                         ▼
        │                              audioEngine.init()
        │                              Tone.start()
        │                                         │
        └── ¿initialized? ── SÍ ──► ShrutiboxApp ◄┘
                                       │
                                       ├── Display
                                       ├── NoteGrid → NoteButton[]
                                       └── Controls
```

No hay enrutamiento (single-page). La app tiene dos vistas controladas por el flag `initialized` del store.

---

## Flujo de interacción del usuario

### Seleccionar / deseleccionar nota

```
Usuario click en NoteButton  (o tecla A-J)
  │
  ▼
toggleNote(noteId)
  │
  ├── ¿playing === true?
  │     │
  │     ├── SÍ: nota estaba seleccionada? → stopNote() + quitar de selectedNotes
  │     │       nota no estaba?           → playNote() + agregar a selectedNotes
  │     │
  │     └── NO: solo toggle en selectedNotes (cambio visual)
  │
  └── Re-render del NoteButton (nuevo estado visual)
```

### Reproducir / detener drone

```
Usuario click en Play  (o tecla Espacio)
  │
  ▼
togglePlay()
  │
  ├── playing === false → playing = true
  │     │
  │     └── audioEngine.playNotes(selectedNotes)
  │           Síntesis: crea un PolySynth por nota, trigger attack
  │           Samples: inicia Tone.Player con loop por nota
  │
  └── playing === true → playing = false
        │
        └── audioEngine.stopAll()
              Síntesis: release + dispose de synths
              Samples: stop + dispose de players
```

### Cambiar instrumento en vivo

```
Usuario selecciona instrumento en Controls
  │
  ▼
setInstrument(instrumentId)
  │
  ├── ¿playing === true?
  │     │
  │     └── SÍ: audioEngine.stopAll() (detener motor anterior)
  │
  ├── Inicializar nuevo motor si no estaba listo (await engine.init())
  ├── audioEngine.setEngine(nuevoMotor)
  ├── Restaurar volumen y velocidad
  │
  ├── ¿playing === true?
  │     │
  │     └── SÍ: audioEngine.playNotes(selectedNotes) (re-reproducir)
  │
  └── set({ instrumentId })
```

---

## Mapa de notas (sistema Sargam)

```
Octava 3 (Mandra ×0.5)   Octava 4 (Madhya ×1.0)   Octava 5 (Tara ×2.0)
┌──┬──┬──┬──┬──┬───┬──┐  ┌──┬──┬──┬──┬──┬───┬──┐  ┌──┬──┬──┬──┬──┬───┬──┐  ┌──┐
│Sa│Re│Ga│Ma│Pa│Dha│Ni│  │Sa│Re│Ga│Ma│Pa│Dha│Ni│  │Sa│Re│Ga│Ma│Pa│Dha│Ni│  │Sa│
│C3│D3│E3│F3│G3│A3 │B3│  │C4│D4│E4│F4│G4│A4 │B4│  │C5│D5│E5│F5│G5│A5 │B5│  │C6│
└──┴──┴──┴──┴──┴───┴──┘  └──┴──┴──┴──┴──┴───┴──┘  └──┴──┴──┴──┴──┴───┴──┘  └──┘
         7 notas                   7 notas                   7 notas         Sa_6
```

- **Modo 1 octava**: solo octava 3 (7 notas).
- **Modo 3 octavas**: octavas 3, 4, 5 + Sa_6 (22 notas).

---

## Mapeo de teclado

El hook `useKeyboard` conecta el teclado físico con la app:

| Tecla   | Acción                                      |
| ------- | ------------------------------------------- |
| A       | Toggle Sa de la octava activa               |
| S       | Toggle Re de la octava activa               |
| D       | Toggle Ga de la octava activa               |
| F       | Toggle Ma de la octava activa               |
| G (key) | Toggle Pa de la octava activa               |
| H       | Toggle Dha de la octava activa              |
| J       | Toggle Ni de la octava activa               |
| Espacio | Toggle Play/Stop                            |

En modo 3 octavas, el selector de octava determina a qué octava se aplican las teclas.

---

## Feature flags

`config/featureFlags.js` permite activar/desactivar funcionalidades:

| Flag                  | Descripción                                      |
| --------------------- | ------------------------------------------------ |
| keyboard              | Soporte de teclado físico                        |
| octaveSelector        | Selector de octava (modo 3 oct)                  |
| speedControl          | Control de velocidad del envelope                |
| mobileLayout          | Layout optimizado para móvil                     |
| instrumentSelector    | Selector de instrumento en la UI                 |

---

## Patrones clave

- **Toggle-then-play**: las notas se seleccionan antes de reproducir; el drone suena con todas las notas seleccionadas simultáneamente.
- **Modificación en tiempo real**: se pueden agregar o quitar notas durante la reproducción sin interrumpir el drone.
- **Instrumentos intercambiables**: `audioEngine.js` actúa como proxy mutable, delegando al motor del instrumento seleccionado por el usuario. `instruments.js` define el registro de instrumentos disponibles. Agregar uno nuevo requiere solo crear su motor y registrarlo.
- **Singleton de audio**: tanto `AudioManager` como `SampleAudioManager` exportan una instancia singleton. El proxy `audioEngine` también es singleton.
- **Inicialización por interacción**: el navegador requiere un gesto del usuario para iniciar el `AudioContext`; el `StartScreen` cumple este requisito.
- **Zustand reactivo**: los componentes se suscriben solo a las porciones del store que necesitan, evitando re-renders innecesarios.
