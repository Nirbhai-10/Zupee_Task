/**
 * Tiny client-side WAV encoder.
 *
 * MediaRecorder produces audio/webm;codecs=opus on Chromium and
 * audio/mp4;codecs=mp4a on Safari. Sarvam's STT (saaras / saarika)
 * accepts WAV/MP3/FLAC only and rejects webm with a 400. So we decode
 * the recorded blob through Web Audio, downmix to mono 16 kHz, and
 * re-encode as a 16-bit PCM WAV that Sarvam reliably ingests.
 *
 * 16 kHz mono is what speech models prefer; halves payload size vs.
 * 44.1 kHz stereo.
 */

const TARGET_SAMPLE_RATE = 16_000;

export async function encodeBlobToWav16kMono(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();

  // AudioContext is widely supported, but Safari historically only had
  // webkitAudioContext — guard for both.
  const Ctor: typeof AudioContext =
    typeof AudioContext !== "undefined"
      ? AudioContext
      : (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API not supported in this browser");

  const ctx = new Ctor();
  let decoded: AudioBuffer;
  try {
    // decodeAudioData returns a Promise on modern browsers; older Safari
    // wants the success/error callback form. Wrap defensively.
    decoded = await new Promise<AudioBuffer>((resolve, reject) => {
      // ArrayBuffer.slice() so the original buffer isn't transferred.
      const result = ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      if (result && typeof (result as Promise<AudioBuffer>).then === "function") {
        (result as Promise<AudioBuffer>).then(resolve, reject);
      }
    });
  } finally {
    // Don't await close() — some Safari versions return undefined.
    void ctx.close?.();
  }

  // Downmix to mono.
  const mono = downmixToMono(decoded);

  // Resample to target sample rate.
  const resampled =
    decoded.sampleRate === TARGET_SAMPLE_RATE
      ? mono
      : linearResample(mono, decoded.sampleRate, TARGET_SAMPLE_RATE);

  return encodePcm16Wav(resampled, TARGET_SAMPLE_RATE);
}

function downmixToMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0).slice();
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const out = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) {
    out[i] = (left[i] + right[i]) / 2;
  }
  return out;
}

function linearResample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLength = Math.round(input.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const i0 = Math.floor(srcIndex);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = srcIndex - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

function encodePcm16Wav(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  // fmt sub-chunk
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data sub-chunk
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // PCM samples (clamped + scaled to int16)
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
