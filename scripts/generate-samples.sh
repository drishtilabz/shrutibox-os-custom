#!/bin/bash
set -e

# Genera 22 samples MP3 a partir de una grabacion WAV de shrutibox en C3.
# Usa pitch-shifting con ffmpeg (asetrate + aresample) para derivar cada nota
# desde la frecuencia fuente (130.81 Hz / Sa de octava 3).
#
# Estructura de salida (coincide con noteMap.js):
#   public/sounds/octave_3/  → Sa Re Ga Ma Pa Dha Ni (Mandra, ×0.5)
#   public/sounds/octave_4/  → Sa Re Ga Ma Pa Dha Ni (Madhya, ×1.0)
#   public/sounds/octave_5/  → Sa Re Ga Ma Pa Dha Ni + sa_high (Tara, ×2.0)
#
# Requisitos: ffmpeg, bc
# Uso: bash scripts/generate-samples.sh

echo "=== Generando samples para Shrutibox Digital ==="
echo ""

if ! command -v ffmpeg &> /dev/null; then
  echo "ERROR: ffmpeg no esta instalado."
  echo "Instalalo con: brew install ffmpeg"
  exit 1
fi

if ! command -v bc &> /dev/null; then
  echo "ERROR: bc no esta instalado."
  exit 1
fi

SOURCE_WAV="public/original-sounds/95345__iluppai__shruti-box.wav"
SOURCE_FREQ=130.81
SAMPLE_RATE=44100
BASE_DIR="public/sounds"
BITRATE="192k"

if [ ! -f "$SOURCE_WAV" ]; then
  echo "ERROR: No se encontro el archivo fuente: $SOURCE_WAV"
  exit 1
fi

# Notas y frecuencias base (octava 4 / Madhya Saptak, A=440Hz)
NOTES="sa:261.63 re:293.66 ga:329.63 ma:349.23 pa:392.00 dha:440.00 ni:493.88"

# Multiplicadores por octava (relativo a octava 4)
OCTAVES="3:0.5 4:1.0 5:2.0"

TEMP_DIR=$(mktemp -d)
NORMALIZED="${TEMP_DIR}/normalized.wav"

echo "  Normalizando audio fuente..."
ffmpeg -y -i "$SOURCE_WAV" \
  -af "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-50dB,loudnorm=I=-14:TP=-1:LRA=7" \
  -ar "$SAMPLE_RATE" -loglevel error \
  "$NORMALIZED"
echo "  Audio normalizado."
echo ""

generated=0
skipped=0

for octave_entry in $OCTAVES; do
  octave="${octave_entry%%:*}"
  mult="${octave_entry##*:}"
  dir="${BASE_DIR}/octave_${octave}"
  mkdir -p "$dir"

  for note_entry in $NOTES; do
    note="${note_entry%%:*}"
    base_freq="${note_entry##*:}"
    target_freq=$(echo "$base_freq * $mult" | bc -l)
    ratio=$(echo "$target_freq / $SOURCE_FREQ" | bc -l)
    outfile="${dir}/${note}.mp3"

    if [ -f "$outfile" ]; then
      echo "  Ya existe: $outfile (omitiendo)"
      skipped=$((skipped + 1))
      continue
    fi

    new_rate=$(echo "$SAMPLE_RATE * $ratio" | bc -l | cut -d. -f1)
    echo "  Generando: $outfile ($(printf '%.2f' "$target_freq") Hz, ratio: $(printf '%.4f' "$ratio"))"

    ffmpeg -y -i "$NORMALIZED" \
      -af "asetrate=${new_rate},aresample=${SAMPLE_RATE}" \
      -b:a "$BITRATE" -loglevel error \
      "$outfile"

    generated=$((generated + 1))
  done
done

# Sa superior (octava 6, C6 = 1046.52 Hz)
sa_high_freq=$(echo "261.63 * 4" | bc -l)
sa_high_ratio=$(echo "$sa_high_freq / $SOURCE_FREQ" | bc -l)
outfile="${BASE_DIR}/octave_5/sa_high.mp3"

if [ -f "$outfile" ]; then
  echo "  Ya existe: $outfile (omitiendo)"
  skipped=$((skipped + 1))
else
  new_rate=$(echo "$SAMPLE_RATE * $sa_high_ratio" | bc -l | cut -d. -f1)
  echo "  Generando: $outfile ($(printf '%.2f' "$sa_high_freq") Hz, ratio: $(printf '%.4f' "$sa_high_ratio"))"

  ffmpeg -y -i "$NORMALIZED" \
    -af "asetrate=${new_rate},aresample=${SAMPLE_RATE}" \
    -b:a "$BITRATE" -loglevel error \
    "$outfile"

  generated=$((generated + 1))
fi

rm -rf "$TEMP_DIR"

echo ""
echo "Generacion completada: ${generated} samples creados, ${skipped} omitidos."
echo "Los samples fueron generados por pitch-shifting desde ${SOURCE_WAV}."
echo "Para produccion (Fase B), reemplazalos con grabaciones individuales de cada nota."
