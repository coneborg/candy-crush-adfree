// Candy Crush Web Audio API Procedural Sound Engine
// Rich, tactile, zero-external-dependency audio synthesis

class SoundFX {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.muted = localStorage.getItem('candy_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                
                // Dynamics compressor prevents clipping and gives punchy master volume
                this.compressor = this.ctx.createDynamicsCompressor();
                this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
                this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
                this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
                this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
                this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime);

                this.compressor.connect(this.masterGain);
                this.masterGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('candy_muted', this.muted);
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime);
        }
        return this.muted;
    }

    // Physical candy sliding/knocking click
    playSwap() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Sharp tactile transient click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1400, now);
        clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

        clickGain.gain.setValueAtTime(0.35, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        clickOsc.connect(clickGain);
        clickGain.connect(this.compressor);
        clickOsc.start(now);
        clickOsc.stop(now + 0.035);

        // 2. Warm resonant wooden body
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(520, now + 0.01);
        bodyOsc.frequency.exponentialRampToValueAtTime(280, now + 0.07);

        bodyGain.gain.setValueAtTime(0.28, now + 0.01);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.compressor);
        bodyOsc.start(now + 0.01);
        bodyOsc.stop(now + 0.07);
    }

    // Invalid swap rubber bounce back
    playInvalidSwap() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        [0, 0.08].forEach((delay, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const f = idx === 0 ? 260 : 200;
            osc.frequency.setValueAtTime(f, now + delay);
            osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + delay + 0.07);

            gain.gain.setValueAtTime(0.25, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

            osc.connect(gain);
            gain.connect(this.compressor);
            osc.start(now + delay);
            osc.stop(now + delay + 0.07);
        });
    }

    // Juicy candy chime match with escalating pentatonic combo pitches & crunch
    playMatch(combo = 1) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Bright candy pentatonic scale (C Major Pentatonic across 2 octaves)
        const scale = [
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00, // A5
            1046.5, // C6
            1174.7, // D6
            1318.5, // E6
            1568.0, // G6
            1760.0  // A6
        ];
        const baseFreq = scale[Math.min(combo - 1, scale.length - 1)];

        // 1. Crisp candy crunch noise burst
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3500, now);
        noiseFilter.Q.setValueAtTime(3, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.compressor);
        noise.start(now);

        // 2. Juicy bell chime fundamental (sine)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.22);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.28);

        // 3. Sparkle harmonic overtone (triangle at 2.76x)
        const harm = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(baseFreq * 2, now);

        harmGain.gain.setValueAtTime(0.18, now);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        harm.connect(harmGain);
        harmGain.connect(this.compressor);
        harm.start(now);
        harm.stop(now + 0.22);

        // 4. Sparkle tail for high combos (>= 3)
        if (combo >= 3) {
            [0.06, 0.12].forEach((sparkleDelay, i) => {
                const sOsc = this.ctx.createOscillator();
                const sGain = this.ctx.createGain();
                sOsc.type = 'sine';
                sOsc.frequency.setValueAtTime(baseFreq * (i === 0 ? 1.5 : 2), now + sparkleDelay);
                sGain.gain.setValueAtTime(0.15, now + sparkleDelay);
                sGain.gain.exponentialRampToValueAtTime(0.001, now + sparkleDelay + 0.15);
                sOsc.connect(sGain);
                sGain.connect(this.compressor);
                sOsc.start(now + sparkleDelay);
                sOsc.stop(now + sparkleDelay + 0.15);
            });
        }
    }

    // High energy laser whoosh for striped candy
    playLaser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Laser chirp sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.26);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.26);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.28);

        // Sparkling beam hiss
        const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.22), this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'highpass';
        nFilter.frequency.setValueAtTime(2000, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.2, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.compressor);
        noise.start(now);
    }

    // Deep sub-bass boom + candy blast for wrapped candy
    playExplosion() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Sub-bass boom
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(32, now + 0.35);

        subGain.gain.setValueAtTime(0.55, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        sub.connect(subGain);
        subGain.connect(this.compressor);
        sub.start(now);
        sub.stop(now + 0.38);

        // 2. Crunchy blast crackle
        const bufLen = Math.floor(this.ctx.sampleRate * 0.32);
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.32);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.4, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.compressor);
        noise.start(now);
    }

    // Color Bomb disco riser
    playColorBombCharge() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Ascending chromatic laser sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.35);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.38);
    }

    // Electric zap when color bomb lightning strikes a candy
    playZap(index = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const startFreq = 1800 + (index % 5) * 200;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Jelly clearing pop / squish
    playJellyPop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    // Triumphant win fanfare (rich major chord arpeggio)
    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [
            { f: 523.25, t: 0.00 }, // C5
            { f: 659.25, t: 0.10 }, // E5
            { f: 783.99, t: 0.20 }, // G5
            { f: 1046.5, t: 0.32 }, // C6
            { f: 1318.5, t: 0.44 }, // E6
            { f: 1568.0, t: 0.58 }  // G6
        ];

        notes.forEach(({ f, t }) => {
            const now = this.ctx.currentTime + t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.compressor);
            osc.start(now);
            osc.stop(now + 0.45);
        });
    }

    // Comical sad trombone descent for out of moves
    playLose() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [
            { f: 392.00, dur: 0.22 }, // G4
            { f: 369.99, dur: 0.22 }, // F#4
            { f: 349.23, dur: 0.22 }, // F4
            { f: 311.13, dur: 0.50 }  // Eb4 with slide
        ];

        let offset = 0;
        notes.forEach((note, i) => {
            const now = this.ctx.currentTime + offset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.f, now);

            if (i === notes.length - 1) {
                // Slide down on last note
                osc.frequency.exponentialRampToValueAtTime(note.f * 0.85, now + note.dur);
            }

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);

            gain.gain.setValueAtTime(0.24, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.compressor);
            osc.start(now);
            osc.stop(now + note.dur);

            offset += note.dur + 0.04;
        });
    }

    // Subtle bubbly UI click
    playButtonClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.compressor);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    speak(text) {
        if (this.muted) return;
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.rate = 1.05;
                utter.pitch = 1.25;
                utter.volume = 0.95;
                window.speechSynthesis.speak(utter);
            } catch (e) {}
        }
    }
}

window.soundFx = new SoundFX();
