// ==========================================
// AUDIO ENGINE (Ambient / Downtempo Vibe)
// ==========================================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

const playAmbientChord = (frequencies, duration = 2, type = "sine") => {
  if (!audioCtx) return;
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(
    0.15,
    audioCtx.currentTime + duration * 0.2
  );
  masterGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  frequencies.forEach((freq) => {
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    lfo.type = "sine";
    lfo.frequency.value = Math.random() * 2 + 0.1;
    lfoGain.gain.value = 3;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);

    osc.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
    lfo.start(audioCtx.currentTime);
    lfo.stop(audioCtx.currentTime + duration);
  });
};

export const playHitSound = () => {
  initAudio();
  playAmbientChord([65.41, 130.81], 1, "triangle");
};

export const playLevelUpSound = () => {
  initAudio();
  playAmbientChord([261.63, 329.63, 392.0, 493.88], 3, "sine");
};

export const playUnlockSound = () => {
  initAudio();
  playAmbientChord([440.0, 659.25], 2, "sine");
};