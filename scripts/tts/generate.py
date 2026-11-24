"""Озвучка слов и примеров нейросетью Kokoro (бесплатно, офлайн) → app/public/audio/<key>.mp3.

Запуск (один раз после изменения контента, уже готовые файлы пропускаются):
  pip install kokoro-onnx soundfile numpy
  # модель: https://github.com/thewh1teagle/kokoro-onnx/releases (kokoro-v1.0.onnx, voices-v1.0.bin)
  npm run content && node scripts/tts/texts.mjs > /tmp/texts.json
  python3 scripts/tts/generate.py /tmp/texts.json --model kokoro-v1.0.onnx --voices voices-v1.0.bin

Обработка, чтобы звучало не «как нейросеть»:
- у отдельных слов ставим точку: ровная завершённая интонация, а не обрыв;
- тишина в начале срезается (звук стартует сразу), в конце сохраняется естественное затухание + короткая пауза;
- мягкие фейды по краям (без щелчков), одинаковая громкость у всех файлов.
Имя файла = хеш нормализованного текста; та же функция в app/src/lib/speech.ts (audioKey).
"""
import argparse, io, json, os, re, subprocess, sys, time
import numpy as np
import soundfile as sf

VOICE = 'af_heart'   # лучший голос Kokoro по оценке авторов (A); мужские — C+
SPEED_WORD = 0.88    # слова чуть медленнее — для учеников
SPEED_SENT = 0.94
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'app', 'public', 'audio')


def norm(t: str) -> str:
    t = t.lower().replace('’', "'").replace('‘', "'")
    return re.sub(r"[^a-z0-9'é]+", ' ', t).strip()


def cyrb53(s: str, seed: int = 0) -> int:
    M = 0xFFFFFFFF
    h1, h2 = (0xDEADBEEF ^ seed) & M, (0x41C6CE57 ^ seed) & M
    units = s.encode('utf-16-le')
    for i in range(0, len(units), 2):
        ch = units[i] | (units[i + 1] << 8)
        h1 = ((h1 ^ ch) * 2654435761) & M
        h2 = ((h2 ^ ch) * 1597334677) & M
    h1 = ((h1 ^ (h1 >> 16)) * 2246822507) & M
    h1 ^= ((h2 ^ (h2 >> 13)) * 3266489909) & M
    h2 = ((h2 ^ (h2 >> 16)) * 2246822507) & M
    h2 ^= ((h1 ^ (h1 >> 13)) * 3266489909) & M
    return 4294967296 * (2097151 & h2) + (h1 & M)


def key(t: str) -> str:
    return np.base_repr(cyrb53(norm(t)), 36).lower()


SPECIAL = {'a': 'A.', 'I': 'I.'}


def tts_text(text: str, kind: str) -> str:
    if kind == 'word':
        if text in SPECIAL:
            return SPECIAL[text]
        return text if re.search(r'[.?!]$', text) else text + '.'
    return text


def polish(a: np.ndarray, sr: int) -> np.ndarray:
    a = a.astype(np.float32)
    f = int(sr * 0.01)                       # кадр 10 мс
    n = len(a) // f
    rms = np.sqrt(np.mean(a[: n * f].reshape(n, f) ** 2, axis=1) + 1e-12)
    peak = rms.max()
    voiced = np.where(rms > peak * 0.04)[0]
    if not len(voiced):
        return a
    start = max(0, voiced[0] - 2) * f                     # 20 мс до начала звука
    end_v = voiced[-1]
    tail = end_v
    while tail + 1 < n and rms[tail + 1] > peak * 0.006 and tail - end_v < 25:
        tail += 1                                         # естественное затухание (до 250 мс)
    end = min(len(a), (tail + 4) * f)
    a = a[start:end].copy()
    fi, fo = int(sr * 0.006), int(sr * 0.06)
    a[:fi] *= np.linspace(0, 1, fi)
    a[-fo:] *= np.linspace(1, 0, fo) ** 2                 # мягкий хвост, без обрыва
    v_rms = np.sqrt(np.mean(a[(voiced[0] * f - start):(end_v * f - start)] ** 2) + 1e-12)
    a *= 10 ** (-19 / 20) / v_rms                         # одинаковая громкость (~-19 dBFS)
    pk = np.abs(a).max()
    if pk > 0.89:
        a *= 0.89 / pk
    return np.concatenate([a, np.zeros(int(sr * 0.12), np.float32)])  # пауза-«выдох» в конце


def encode(a: np.ndarray, sr: int, path: str):
    buf = io.BytesIO()
    sf.write(buf, a, sr, format='WAV', subtype='PCM_16')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'wav', '-i', 'pipe:0', '-ac', '1',
                    '-c:a', 'libmp3lame', '-b:a', '48k', path], input=buf.getvalue(), check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('texts'); ap.add_argument('--model', required=True); ap.add_argument('--voices', required=True)
    ap.add_argument('--out', default=OUT)
    args = ap.parse_args()
    from kokoro_onnx import Kokoro
    k = Kokoro(args.model, args.voices)
    items = json.load(open(args.texts))
    os.makedirs(args.out, exist_ok=True)
    seen, t0, made = {}, time.time(), 0
    for i, it in enumerate(items):
        kk = key(it['text'])
        if kk in seen and norm(seen[kk]) != norm(it['text']):
            sys.exit(f'коллизия ключа: {seen[kk]!r} / {it["text"]!r}')
        seen[kk] = it['text']
        path = os.path.join(args.out, kk + '.mp3')
        if os.path.exists(path):
            continue
        sp = SPEED_WORD if it['kind'] == 'word' else SPEED_SENT
        a, sr = k.create(tts_text(it['text'], it['kind']), voice=VOICE, speed=sp, lang='en-us')
        encode(polish(a, sr), sr, path)
        made += 1
        if made % 200 == 0:
            print(f'{i + 1}/{len(items)} · {time.time() - t0:.0f} с', flush=True)
    print(f'готово: новых {made}, всего {len(items)}, {time.time() - t0:.0f} с')


if __name__ == '__main__':
    main()
