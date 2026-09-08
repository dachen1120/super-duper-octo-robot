# -*- coding: utf-8 -*-
"""Generate A/B (en-US male/female) read-aloud audio + per-turn timestamps
for a sample dialogue JSON (content/samples/*.json).

Outputs:
  content/samples/audio/<dialogueId>.full.mp3   - full assembled dialogue
  content/samples/audio/turns/<turnId>.mp3      - per-turn audio
Updates the JSON in place: dialogue.audio + each turn.audio {src,startMs,endMs}.
"""
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools", "pylibs"))

import edge_tts  # noqa: E402
from imageio_ffmpeg import get_ffmpeg_exe  # noqa: E402

SRC = os.environ.get("SRC_JSON", os.path.join(ROOT, "content", "samples", "ai-tech-2026-09-07.json"))
VOICE_A = os.environ.get("VOICE_A", "en-US-GuyNeural")      # A: young-ish male, US
VOICE_B = os.environ.get("VOICE_B", "en-US-AriaNeural")     # B: young-ish female, US
RATE = os.environ.get("RATE", "-8%")                        # moderately slow
GAP_MS = int(os.environ.get("GAP_MS", "420"))               # pause between turns
TOPIC_GAP_MS = int(os.environ.get("TOPIC_GAP_MS", "800"))   # longer pause at topic/news change

SR = 24000  # sample rate for assembly


def log(*args):
    print(*args, flush=True)


async def pick_voices(a, b):
    voices = await edge_tts.list_voices()
    by_name = {v["ShortName"]: v for v in voices}
    chosen = {}
    for key, name in (("A", a), ("B", b)):
        if name in by_name:
            chosen[key] = name
            log("voice %s -> %s (%s)" % (key, name, by_name[name].get("Gender", "")))
        else:
            log("WARNING: voice not found: %s" % name)
    if len(chosen) != 2:
        log("Available en-US voices:")
        for v in voices:
            if v["Locale"].lower() == "en-us":
                log("  - %s (%s)" % (v["ShortName"], v.get("Gender", "")))
        raise SystemExit("Please set VOICE_A / VOICE_B to available voices.")
    return chosen["A"], chosen["B"]


async def synth(text, voice, out_mp3):
    c = edge_tts.Communicate(text, voice=voice, rate=RATE)
    await c.save(out_mp3)


def to_wav(ffmpeg, mp3, wav):
    subprocess.run(
        [ffmpeg, "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", wav],
        check=True, capture_output=True,
    )


def wav_ms(path):
    with wave.open(path, "rb") as w:
        return int(round(w.getnframes() / w.getframerate() * 1000))


def silence_wav(path, ms):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"\x00" * (SR * 2 * ms // 1000))


async def main():
    data = json.load(open(SRC, encoding="utf-8"))
    ind = data["industry"]
    dia = data["dialogue"]
    turns = dia["turns"]
    dialogue_id = dia["id"]
    log("dialogue: %s (%s) turns=%d" % (dia["title"], dialogue_id, len(turns)))

    voice_a, voice_b = await pick_voices(VOICE_A, VOICE_B)

    audio_dir = os.path.join(os.path.dirname(SRC), "audio")
    turns_dir = os.path.join(audio_dir, "turns")
    os.makedirs(turns_dir, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="audiowork_", dir=os.path.join(ROOT, "audio_tmp"))
    log("work dir: %s" % tmp)
    ffmpeg = get_ffmpeg_exe()
    log("ffmpeg: %s" % ffmpeg)

    try:
        # 1) per-turn TTS + decode to wav
        wavs = []
        for t in turns:
            voice = voice_a if t["speaker"] == "A" else voice_b
            mp3 = os.path.join(turns_dir, "%s.mp3" % t["id"])
            wav = os.path.join(tmp, "%s.wav" % t["id"])
            await synth(t["en"], voice, mp3)
            to_wav(ffmpeg, mp3, wav)
            wavs.append((t, wav, mp3))
            log("  synthesized %s (%s, %d words)" % (t["id"], t["speaker"], len(t["en"].split())))

        # 2) durations + silences + concat
        gaps = sorted(set([GAP_MS, TOPIC_GAP_MS]))
        sil = {}
        for ms in gaps:
            sil[ms] = os.path.join(tmp, "silence_%d.wav" % ms)
            silence_wav(sil[ms], ms)

        lines = []
        start_ms = 0
        timings = []
        for i, (t, wav, mp3) in enumerate(wavs):
            dur = wav_ms(wav)
            end = start_ms + dur
            timings.append((t, dur, start_ms, end, mp3))
            lines.append("file '%s'" % wav.replace("\\", "/"))
            if i < len(wavs) - 1:
                next_t = wavs[i + 1][0]
                gap = TOPIC_GAP_MS if (t.get("relatedNewsId") != next_t.get("relatedNewsId")) else GAP_MS
                start_ms = end + gap
                lines.append("file '%s'" % sil[gap].replace("\\", "/"))
            else:
                start_ms = end
        full_ms = start_ms

        list_file = os.path.join(tmp, "concat.txt")
        with open(list_file, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

        full_mp3 = os.path.join(audio_dir, "%s.full.mp3" % dialogue_id)
        subprocess.run(
            [ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", list_file,
             "-c:a", "libmp3lame", "-b:a", "64k", "-ac", "1", full_mp3],
            check=True, capture_output=True,
        )
        log("full audio: %s (%.1f s)" % (full_mp3, full_ms / 1000.0))

        # 3) write timings back into JSON
        dia["audio"] = {
            "src": os.path.relpath(full_mp3, os.path.dirname(SRC)).replace("\\", "/"),
            "durationMs": full_ms,
            "voices": {"A": voice_a, "B": voice_b},
            "rate": RATE,
            "gapMs": GAP_MS,
            "topicGapMs": TOPIC_GAP_MS,
        }
        for t, dur, start, end, mp3 in timings:
            t["audio"] = {
                "src": os.path.relpath(mp3, os.path.dirname(SRC)).replace("\\", "/"),
                "startMs": start,
                "endMs": end,
                "durationMs": dur,
            }
        with open(SRC, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log("updated %s" % SRC)

        # 4) summary table
        log("\n%-8s %-4s %-6s %-10s %-10s" % ("turn", "spk", "dur(ms)", "start(ms)", "end(ms)"))
        for t, dur, start, end, mp3 in timings:
            log("%-8s %-4s %-6d %-10d %-10d" % (t["id"], t["speaker"], dur, start, end))
        log("\nfull duration: %.1f s = %d ms" % (full_ms / 1000.0, full_ms))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(main())