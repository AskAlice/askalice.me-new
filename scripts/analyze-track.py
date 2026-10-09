#!/usr/bin/env python3
"""Precompute the /demos/music analysis from the actual MP3.

Purpose
    Turn public/media/music/i-promise.mp3 into
      * src/lib/music/i-promise.json   – per-slice level, dominant pitch, note, partials H1–H8
      * public/media/music/i-promise-spectrogram.webp – log-frequency spectrogram, same time axis
    so the page ships real, reproducible numbers instead of the AI Studio draft's.

Usage
    python3 scripts/analyze-track.py                       # defaults below
    python3 scripts/analyze-track.py --hop 0.25 --mp3 path/to/track.mp3

Parameters
    --mp3     input MP3 (default public/media/music/i-promise.mp3)
    --json    output analysis JSON (default src/lib/music/i-promise.json)
    --image   output spectrogram WebP (default public/media/music/i-promise-spectrogram.webp)
    --hop     seconds between analysis slices (default 0.25)

Requirements: ffmpeg + ffprobe on PATH, numpy, Pillow.

Method (documented so the numbers can be checked)
    * decode to mono 32 kHz float with ffmpeg (no shell; argument list only)
    * level: RMS of each hop window, reported as dBFS (floor −60)
    * dominant pitch: harmonic product spectrum (3 harmonics) of a 4096-point Hann
      FFT, searched in 60–1500 Hz, refined by parabolic interpolation; slices
      quieter than −50 dBFS get freq 0 / note "—"
    * partials: spectral magnitude at k·f0 (k = 1…8, peak within ±2 bins),
      normalised to the frame's strongest bin
    * spectrogram: same STFT, 2400 columns × 320 rows, rows log-spaced 30 Hz–16 kHz,
      −80…0 dB relative to the track's peak, black→red→orange→yellow→white map
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SR = 32_000
NFFT = 4096
F_MIN, F_MAX = 30.0, 16_000.0
IMG_W, IMG_H = 2400, 320
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
TIMEOUT_S = 120


def log(level: str, msg: str) -> None:
    """Structured progress line on stderr."""
    print(f"[analyze-track] {level} {msg}", file=sys.stderr)


def run(cmd: list[str]) -> bytes:
    """Run a command (no shell) with a timeout; raise with a readable message on failure."""
    try:
        res = subprocess.run(cmd, capture_output=True, timeout=TIMEOUT_S, check=False)
    except FileNotFoundError as e:
        raise SystemExit(f"{cmd[0]} not found — install ffmpeg (brew install ffmpeg)") from e
    except subprocess.TimeoutExpired as e:
        raise SystemExit(f"{cmd[0]} timed out after {TIMEOUT_S}s") from e
    if res.returncode != 0:
        raise SystemExit(f"{cmd[0]} failed: {res.stderr.decode(errors='replace')[-400:]}")
    return res.stdout


def probe(mp3: Path) -> dict:
    """Duration and ID3 tags (BPM, encoder, year) via ffprobe."""
    out = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", str(mp3)])
    fmt = json.loads(out)["format"]
    tags = {k.lower(): v for k, v in fmt.get("tags", {}).items()}
    bpm = tags.get("tbpm") or tags.get("bpm")
    return {
        "duration": round(float(fmt["duration"]), 2),
        "bpm": int(float(bpm)) if bpm else None,
        "encoder": tags.get("encoded_by") or tags.get("encoder"),
        "year": tags.get("date") or tags.get("year"),
    }


def decode(mp3: Path) -> np.ndarray:
    """Mono float32 samples at SR."""
    raw = run(["ffmpeg", "-v", "error", "-i", str(mp3), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, dtype="<f4").astype(np.float64)
    if x.size < SR:
        raise SystemExit("decoded audio is shorter than one second — wrong file?")
    return x


def note_name(f: float) -> str:
    """Nearest equal-tempered note for a frequency, e.g. 440 → A4."""
    m = round(69 + 12 * math.log2(f / 440.0))
    return f"{NOTES[m % 12]}{m // 12 - 1}"


def spectrum(x: np.ndarray, centre: int, win: np.ndarray) -> np.ndarray:
    """Magnitude spectrum of a Hann window centred on sample `centre` (zero-padded at edges)."""
    a = centre - NFFT // 2
    seg = np.zeros(NFFT)
    lo, hi = max(a, 0), min(a + NFFT, x.size)
    if hi > lo:
        seg[lo - a : hi - a] = x[lo:hi]
    return np.abs(np.fft.rfft(seg * win))


def dominant_pitch(mag: np.ndarray) -> float:
    """Harmonic-product-spectrum f0 in 60–1500 Hz with parabolic refinement (Hz)."""
    hz = SR / NFFT
    n = mag.size // 3
    hps = mag[:n] * mag[::2][:n] * mag[::3][:n]
    lo, hi = int(60 / hz), min(int(1500 / hz), n - 2)
    k = lo + int(np.argmax(hps[lo:hi]))
    a, b, c = np.log(hps[k - 1 : k + 2] + 1e-30)
    shift = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) != 0 else 0.0
    return (k + float(np.clip(shift, -0.5, 0.5))) * hz


def partials(mag: np.ndarray, f0: float) -> list[float]:
    """Magnitude at k·f0 for k=1..8 (±2-bin peak), relative to the frame's strongest bin."""
    hz = SR / NFFT
    peak = float(mag.max()) or 1.0
    out = []
    for k in range(1, 9):
        b = int(round(k * f0 / hz))
        if b + 2 >= mag.size:
            out.append(0.0)
            continue
        out.append(round(float(mag[max(b - 2, 0) : b + 3].max()) / peak, 3))
    return out


def analyse(x: np.ndarray, hop_s: float) -> list[dict]:
    """Per-slice level, pitch, note and partials every `hop_s` seconds."""
    win = np.hanning(NFFT)
    hop = int(hop_s * SR)
    slices = []
    for start in range(0, x.size - hop // 2, hop):
        chunk = x[start : start + hop]
        rms = float(np.sqrt(np.mean(chunk**2))) if chunk.size else 0.0
        db = max(-60.0, 20 * math.log10(rms) if rms > 0 else -60.0)
        mag = spectrum(x, start + hop // 2, win)
        if db < -50:
            f0, note, parts = 0, "—", [0.0] * 8
        else:
            f = dominant_pitch(mag)
            f0 = int(round(f))  # name the note from the stored (rounded) value so the two always agree
            note, parts = note_name(f0), partials(mag, f)
        slices.append({"t": round(start / SR, 2), "db": round(db, 1), "rms": round(rms, 3), "freq": f0, "note": note, "harmonics": parts})
    return slices


def spectrogram(x: np.ndarray, out: Path) -> None:
    """Write the log-frequency spectrogram WebP (IMG_W × IMG_H, time → x, F_MIN–F_MAX ↑ y)."""
    win = np.hanning(NFFT)
    centres = np.linspace(0, x.size - 1, IMG_W).astype(int)
    hz = SR / NFFT
    rows = np.geomspace(F_MAX, F_MIN, IMG_H)  # top row = highest frequency
    bins = np.clip(np.round(rows / hz).astype(int), 1, NFFT // 2)
    cols = np.empty((IMG_H, IMG_W))
    for j, c in enumerate(centres):
        cols[:, j] = 20 * np.log10(spectrum(x, int(c), win)[bins] + 1e-12)
    v = np.clip((cols - cols.max() + 80) / 80, 0, 1)  # −80…0 dB → 0…1
    # black → red → orange → yellow → white
    r = np.clip(v * 3, 0, 1)
    g = np.clip(v * 3 - 1, 0, 1)
    b = np.clip(v * 3 - 2, 0, 1)
    rgb = (np.stack([r, g, b], axis=-1) * 255).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(out, "WEBP", quality=82, method=6)


def main() -> None:
    """CLI entry point."""
    root = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--mp3", type=Path, default=root / "public/media/music/i-promise.mp3")
    ap.add_argument("--json", type=Path, default=root / "src/lib/music/i-promise.json")
    ap.add_argument("--image", type=Path, default=root / "public/media/music/i-promise-spectrogram.webp")
    ap.add_argument("--hop", type=float, default=0.25)
    a = ap.parse_args()

    if not a.mp3.is_file():
        raise SystemExit(f"input not found: {a.mp3}")
    if not 0.05 <= a.hop <= 5:
        raise SystemExit("--hop must be between 0.05 and 5 seconds")
    for p in (a.json, a.image):
        if not p.parent.is_dir():
            raise SystemExit(f"output folder missing: {p.parent}")

    meta = probe(a.mp3)
    log("INFO", f"decoding {a.mp3.name} ({meta['duration']} s)")
    x = decode(a.mp3)
    slices = analyse(x, a.hop)
    log("INFO", f"{len(slices)} slices every {a.hop} s")
    spectrogram(x, a.image)
    log("INFO", f"wrote {a.image.relative_to(root)}")
    doc = {
        "track": "I Promise",
        "artist": "Alice Knag",
        "duration": meta["duration"],
        "bpm": meta["bpm"],
        "encoder": meta["encoder"],
        "year": meta["year"],
        "audioUrl": "/media/music/i-promise.mp3",
        "hop": a.hop,
        "spectrogram": {"fMin": F_MIN, "fMax": F_MAX, "scale": "log"},
        "slices": slices,
    }
    a.json.write_text(json.dumps(doc, separators=(",", ":"), ensure_ascii=False) + "\n")
    log("INFO", f"wrote {a.json.relative_to(root)} ({a.json.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
