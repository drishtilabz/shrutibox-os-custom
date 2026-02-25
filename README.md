# Shrutibox Digital

Replica digital de un shrutibox acustico **Monoj Kumar Sardar 440Hz**, construida como aplicacion web con multiples motores de audio: sintesis en tiempo real y reproduccion de samples pregrabados.

El instrumento simula la experiencia de un shrutibox real: 13 lengüetas cromaticas en una sola octava, con variantes komal (bemol) y tivra (sostenido). Primero se seleccionan las notas (como abrir las lengüetas del instrumento), luego se activa la reproduccion (como bombear el fuelle) para generar el drone continuo.

## Caracteristicas

- **13 notas cromaticas**: Sa, Re♭, Re, Ga♭, Ga, Ma, Ma♯, Pa, Dha♭, Dha, Ni♭, Ni, Sa (agudo)
- **Selector de instrumentos**: elige entre Base Sound, Shrutibox Prototype, Shrutibox MKS, MKS Crossfade y MKS Grain
- **UI tipo shrutibox**: panel frontal con 13 lengüetas/switches dispuestas horizontalmente
- **Sistema Sargam**: notacion india con variantes shuddh, komal y tivra
- **Toggle + Play/Stop**: selecciona notas con click, luego activa el drone con Play
- **Modificacion en tiempo real**: agrega o quita notas mientras el drone suena
- **Control de volumen**: ajuste de 0% a 100%
- **Teclado fisico**: mapeo estilo piano para las 13 notas + barra espaciadora para Play/Stop

## Stack tecnologico

| Tecnologia   | Version | Uso                              |
| ------------ | ------- | -------------------------------- |
| React        | 19.2.0  | UI con componentes funcionales   |
| Vite         | 7.3.1   | Bundler y servidor de desarrollo |
| Tone.js      | 15.1.22 | Sintesis y reproduccion de audio |
| Zustand      | 5.0.11  | Estado global reactivo           |
| Tailwind CSS | 4.2.0   | Estilos utility-first            |

## Estructura del proyecto

```
shrutibox-os-custom/
├── public/
│   ├── original-sounds/        # Audio fuente para generar samples
│   │   ├── 95345__iluppai__shruti-box.wav
│   │   └── shrutibox-MKS-first-samplers/  # Grabaciones reales del shrutibox MKS
│   ├── sounds/                 # Samples interpolados - Shrutibox Prototype (gitignored)
│   ├── sounds-mks/             # Samples reales - Shrutibox MKS y MKS Grain (gitignored)
│   └── sounds-mks-xfade/       # Samples con crossfade baked-in - MKS Crossfade (gitignored)
├── scripts/
│   ├── generate-samples.sh     # Genera 13 samples MP3 por pitch-shifting (Prototype)
│   ├── generate-mks-samples.sh # Convierte 13 WAV a MP3 (MKS)
│   ├── generate-mks-xfade-samples.sh # Genera MP3 con crossfade baked-in (MKS Crossfade)
│   ├── generate-tones.sh       # Genera tonos sinusoidales placeholder
│   └── install.sh              # Script de instalacion automatizada
├── docs/
│   ├── architecture.md         # Documentacion completa de la arquitectura
│   └── getting-started.md      # Guia de inicio rapido
├── src/
│   ├── main.jsx                # Punto de entrada de React
│   ├── App.jsx                 # Componente raiz (StartScreen + ShrutiboxApp)
│   ├── index.css               # Tailwind CSS + estilos del shrutibox
│   ├── audio/
│   │   ├── audioEngine.js      # Proxy mutable: delega al motor de audio activo
│   │   ├── instruments.js      # Registro de instrumentos disponibles
│   │   ├── AudioManager.js     # Motor de sintesis (PolySynth fatsine)
│   │   ├── SampleAudioManager.js # Motor de samples (Tone.Player con loop)
│   │   ├── GrainAudioManager.js  # Motor granular con dual player cycling
│   │   └── noteMap.js          # 13 notas cromaticas (Sargam + komal/tivra)
│   ├── store/
│   │   └── useShrutiStore.js   # Store Zustand (estado + acciones)
│   ├── components/
│   │   ├── Display.jsx         # Panel informativo (nota activa, estado)
│   │   ├── NoteGrid.jsx        # Panel frontal del shrutibox (13 lengüetas)
│   │   ├── NoteButton.jsx      # Lengüeta individual (toggle switch)
│   │   └── Controls.jsx        # Instrumento, Play/Stop, volumen, velocidad
│   ├── hooks/
│   │   └── useKeyboard.js      # Mapeo de teclado fisico (estilo piano)
│   └── config/
│       └── featureFlags.js     # Flags para habilitar/deshabilitar funciones
├── index.html                  # HTML base (punto de montaje)
├── vite.config.js              # Configuracion de Vite
├── eslint.config.js            # Configuracion de ESLint
└── package.json                # Dependencias y scripts
```

## Arquitectura

La aplicacion sigue una arquitectura de **3 capas** con separacion clara de responsabilidades:

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
                        ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE AUDIO (Tone.js)                          │
│                    audioEngine.js (Fachada)                         │
│                                                                     │
│   ┌────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│   │ AudioManager   │ │SampleAudioManager│ │SampleAudioManager│   │
│   │ (Base Sound)   │ │(Shrutibox Proto) │ │ (Shrutibox MKS)  │   │
│   │ PolySynth      │ │ /sounds/         │ │ /sounds-mks/     │   │
│   │ fatsine        │ │ Tone.Player+loop │ │ Tone.Player+loop │   │
│   └───────┬────────┘ └────────┬─────────┘ └────────┬─────────┘   │
│           │   ┌───────────────────┐ ┌───────────────────┐        │
│           │   │SampleAudioManager │ │GrainAudioManager  │        │
│           │   │(MKS Crossfade)    │ │(MKS Grain)        │        │
│           │   │/sounds-mks-xfade/ │ │/sounds-mks/       │        │
│           │   │xfade baked-in     │ │dual player cycling│        │
│           │   └─────────┬─────────┘ └─────────┬─────────┘        │
│           └──────┬──────┴──────────┬──────────┘                  │
│                  ▼                                                │
│           Tone.Volume   →   Speaker                              │
│                                                                   │
│   noteMap.js: 13 notas cromaticas (Sa..Ni + komal/tivra + Sa↑)   │
└───────────────────────────────────────────────────────────────────┘
```

> Para documentacion detallada de la arquitectura, ver [`docs/architecture.md`](docs/architecture.md).

## Instalacion

```bash
npm install
```

O usando el script de instalacion automatizada:

```bash
bash scripts/install.sh
```

## Desarrollo

```bash
npm run dev
```

Abre **http://localhost:5173** en el navegador.

## Build de produccion

```bash
npm run build
```

## Generar samples de audio

Los instrumentos basados en samples requieren generar archivos MP3 antes de usarlos. Ambos scripts necesitan **ffmpeg** instalado.

### Shrutibox Prototype (samples interpolados)

```bash
bash scripts/generate-samples.sh
```

Toma `public/original-sounds/95345__iluppai__shruti-box.wav` y genera las 13 notas cromaticas por pitch-shifting. Los archivos se crean en `public/sounds/`.

### Shrutibox MKS (samples reales)

```bash
bash scripts/generate-mks-samples.sh
```

Toma las 13 grabaciones individuales de `public/original-sounds/shrutibox-MKS-first-samplers/` (7 shuddh + 4 komal + 1 tivra + Sa agudo) y las convierte a MP3. Los archivos se crean en `public/sounds-mks/`.

### MKS Crossfade (samples con crossfade baked-in)

```bash
bash scripts/generate-mks-xfade-samples.sh
```

Toma los samples MKS y genera versiones con crossfade integrado en el audio: la cola del sample se mezcla con el inicio para que el loop sea suave. Los archivos se crean en `public/sounds-mks-xfade/`.

> Los archivos generados estan en `.gitignore` porque son reproducibles con los scripts. Los WAV fuente si se versionan.

## Otros comandos

| Comando           | Descripcion                                       |
| ----------------- | ------------------------------------------------- |
| `npm run build`   | Crea un build optimizado en `dist/`               |
| `npm run preview` | Sirve el build de produccion localmente            |
| `npm run lint`    | Verifica calidad de codigo con ESLint             |

## Uso del instrumento

1. **Iniciar**: al abrir la app, presiona "Iniciar" para activar el audio
2. **Elegir instrumento**: selecciona el sonido deseado (Base Sound, Shrutibox Prototype, Shrutibox MKS, MKS Crossfade, MKS Grain)
3. **Activar notas**: haz click en las lengüetas que deseas escuchar (se marcan como seleccionadas)
4. **Reproducir**: presiona el boton Play (o barra espaciadora) para iniciar el drone
5. **Modificar en vivo**: mientras suena, puedes cambiar instrumento, activar o desactivar notas
6. **Detener**: presiona Stop (o barra espaciadora) para silenciar (las notas quedan seleccionadas)

### Atajos de teclado (estilo piano)

**Fila inferior (notas shuddh / naturales):**

| Tecla | Nota    |
| ----- | ------- |
| A     | Sa      |
| S     | Re      |
| D     | Ga      |
| F     | Ma      |
| G     | Pa      |
| H     | Dha     |
| J     | Ni      |
| K     | Sa (alto) |

**Fila superior (notas komal / tivra):**

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

## Mapa de notas (sistema Sargam cromatico)

```
┌──┬───┬──┬───┬──┬──┬───┬──┬───┬───┬───┬──┬──┐
│Sa│Re♭│Re│Ga♭│Ga│Ma│Ma♯│Pa│Dha♭│Dha│Ni♭│Ni│Sa│
│C3│Db3│D3│Eb3│E3│F3│F#3│G3│Ab3 │A3 │Bb3│B3│C4│
└──┴───┴──┴───┴──┴──┴───┴──┴───┴───┴───┴──┴──┘
 S    K   S    K   S   S    T   S    K    S    K   S   S
```

S = shuddh (natural), K = komal (bemol), T = tivra (sostenido)

## Feature flags

`src/config/featureFlags.js` permite activar/desactivar funcionalidades:

| Flag                  | Default | Descripcion                                      |
| --------------------- | ------- | ------------------------------------------------ |
| keyboard              | on      | Soporte de teclado fisico                        |
| speedControl          | off     | Control de velocidad del envelope (desactivado)  |
| mobileLayout          | on      | Layout optimizado para movil                     |
| instrumentSelector    | on      | Selector de instrumento en la UI                 |

## Estrategia de audio para loop continuo

Al reproducir samples pregrabados en loop, se produce un **click audible** en el punto donde el loop salta del final al inicio, porque la forma de onda tiene una discontinuidad abrupta en ese corte.

### El problema: single player con loop built-in

```
               click!
                 │
Player:  [=======▼=======]──loop──►[=======▼=======]──loop──►...
         ^               ^         ^
         loopStart      loopEnd    loopStart (salto abrupto)
```

El player reproduce de `loopStart` a `loopEnd` y salta al inicio. En ese salto, la forma de onda se corta abruptamente, generando un click audible cada vez que el loop reinicia.

### La solucion: dual player con crossfade

```
Player A:  [====1s========~21s]───fade out───(dispose)
                               │
Player B:            [====1s========~21s]───fade out───(dispose)
                     │                   │
                  arranca con          Player C: [====1s====...
                  fade-in              arranca con fade-in
```

En lugar de usar el loop built-in, se ejecutan **dos players que se alternan**:

1. **Player A** arranca desde `loopStart` y reproduce sin loop
2. Antes de que A llegue a `loopEnd`, se crea **Player B** desde `loopStart`
3. Durante `crossfadeDuration` segundos, A hace fade-out y B hace fade-in
4. Cuando A termina el fade, se destruye
5. Antes de que B llegue a `loopEnd`, se crea **Player C** y se repite

El audio nunca alcanza el punto de corte, eliminando completamente el click de loop.

Esta tecnica esta implementada en `GrainAudioManager.js` para el instrumento **MKS Grain**.

> Para documentacion detallada de las mejoras de audio, ver [`docs/audio-improvements.md`](docs/audio-improvements.md).

## Documentacion

| Documento                                        | Descripcion                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| [`docs/getting-started.md`](docs/getting-started.md) | Guia de inicio rapido paso a paso              |
| [`docs/architecture.md`](docs/architecture.md)       | Arquitectura detallada con diagramas y flujos  |
| [`docs/audio-improvements.md`](docs/audio-improvements.md) | Mejoras de audio: clicks, crossfade, dual player |
