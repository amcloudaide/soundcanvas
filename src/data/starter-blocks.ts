import { createBlock, type Block } from '../types/block'

export const starterBlocks: Block[] = [
  // ============================================================
  // BEATS (10)
  // ============================================================
  createBlock({ name: 'Four on the Floor', category: 'beats', pattern: 's("bd*4, [~ cp]*2, hh*8")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.6 }, density: 0.7, tags: ['house', 'dance'] }),
  createBlock({ name: 'Chill Hip-Hop', category: 'beats', pattern: 's("bd ~ [~ bd] ~, ~ sd ~ sd, hh*8")', key: 'chromatic', bpm: 85, mood: { energy: 0.3, brightness: 0.4 }, density: 0.5, tags: ['lofi', 'chill'] }),
  createBlock({ name: 'Trap Beat', category: 'beats', pattern: 's("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ sd ~, hh*16")', key: 'chromatic', bpm: 140, mood: { energy: 0.9, brightness: 0.3 }, density: 0.8, tags: ['trap', 'hard'] }),
  createBlock({ name: 'Reggae One Drop', category: 'beats', pattern: 's("~ ~ ~ bd, ~ ~ sd ~, hh*4")', key: 'chromatic', bpm: 75, mood: { energy: 0.4, brightness: 0.6 }, density: 0.3, tags: ['reggae', 'laid-back'] }),
  createBlock({ name: 'Breakbeat', category: 'beats', pattern: 's("bd ~ sd bd ~ sd bd sd, hh*8")', key: 'chromatic', bpm: 130, mood: { energy: 0.8, brightness: 0.5 }, density: 0.7, tags: ['break', 'energetic'] }),
  createBlock({ name: 'Disco Groove', category: 'beats', pattern: 's("bd ~ bd ~, ~ cp ~ cp, hh*8")', key: 'chromatic', bpm: 115, mood: { energy: 0.6, brightness: 0.8 }, density: 0.6, tags: ['disco', 'funky'] }),
  createBlock({ name: 'Minimal Techno', category: 'beats', pattern: 's("bd*4, ~ ~ cp ~, [hh hh hh ~]*2")', key: 'chromatic', bpm: 128, mood: { energy: 0.5, brightness: 0.3 }, density: 0.5, tags: ['techno', 'minimal'] }),
  createBlock({ name: 'Boom Bap', category: 'beats', pattern: 's("bd ~ ~ ~, ~ ~ sd ~, hh*4")', key: 'chromatic', bpm: 90, mood: { energy: 0.5, brightness: 0.4 }, density: 0.4, tags: ['hiphop', 'classic'] }),
  createBlock({ name: 'Drum & Bass', category: 'beats', pattern: 's("bd ~ [~ bd] ~, ~ ~ sd ~, hh*16")', key: 'chromatic', bpm: 170, mood: { energy: 0.95, brightness: 0.4 }, density: 0.9, tags: ['dnb', 'fast'] }),
  createBlock({ name: 'Shuffle Beat', category: 'beats', pattern: 's("bd ~ ~ bd ~ ~, ~ ~ sd ~ ~ sd, [hh ~ hh]*4")', key: 'chromatic', bpm: 100, mood: { energy: 0.5, brightness: 0.7 }, density: 0.5, tags: ['shuffle', 'swing'] }),

  // ============================================================
  // BASS (9)
  // ============================================================
  createBlock({ name: 'Sub Wobble', category: 'bass', pattern: 'note("c2 ~ eb2 ~").s("sawtooth").lpf(400)', key: 'Cm', bpm: 120, mood: { energy: 0.6, brightness: 0.2 }, density: 0.4, tags: ['dark', 'wobble'] }),
  createBlock({ name: 'Funky Slap', category: 'bass', pattern: 'note("c2 c2 eb2 f2 g2 f2 eb2 c2").s("sawtooth").lpf(800)', key: 'Cm', bpm: 110, mood: { energy: 0.7, brightness: 0.5 }, density: 0.7, tags: ['funky', 'groove'] }),
  createBlock({ name: 'Deep House Bass', category: 'bass', pattern: 'note("c2 ~ ~ c2 ~ ~ c2 ~").s("triangle").lpf(300)', key: 'Cm', bpm: 122, mood: { energy: 0.5, brightness: 0.3 }, density: 0.3, tags: ['deep', 'house'] }),
  createBlock({ name: 'Acid Line', category: 'bass', pattern: 'note("c2 c2 eb2 c2 f2 c2 g2 eb2").s("square").lpf(1200)', key: 'Cm', bpm: 130, mood: { energy: 0.8, brightness: 0.4 }, density: 0.8, tags: ['acid', 'squelchy'] }),
  createBlock({ name: 'Walking Bass', category: 'bass', pattern: 'note("g2 a2 b2 d3 b2 a2 g2 e2").s("triangle").lpf(600)', key: 'G', bpm: 100, mood: { energy: 0.4, brightness: 0.5 }, density: 0.6, tags: ['jazz', 'walking'] }),
  createBlock({ name: 'Reggae Bass', category: 'bass', pattern: 'note("f2 ~ ~ f2 ~ ~ ~ ~").s("triangle").lpf(400)', key: 'F', bpm: 75, mood: { energy: 0.3, brightness: 0.4 }, density: 0.2, tags: ['reggae', 'dub'] }),
  createBlock({ name: 'Octave Bounce', category: 'bass', pattern: 'note("a1 a2 a1 a2 a1 a2 e2 a2").s("sawtooth").lpf(500)', key: 'Am', bpm: 128, mood: { energy: 0.7, brightness: 0.3 }, density: 0.6, tags: ['bounce', 'dance'] }),
  createBlock({ name: 'Synth Bass Stab', category: 'bass', pattern: 'note("d2 ~ ~ ~ d2 ~ f2 ~").s("square").lpf(900)', key: 'Dm', bpm: 115, mood: { energy: 0.6, brightness: 0.4 }, density: 0.3, tags: ['stab', 'synth'] }),
  createBlock({ name: 'Pulsing Sub', category: 'bass', pattern: 'note("e2*4").s("sine").gain(0.6)', key: 'Em', bpm: 140, mood: { energy: 0.4, brightness: 0.1 }, density: 0.4, tags: ['sub', 'pulse'] }),

  // ============================================================
  // MELODY (9)
  // ============================================================
  createBlock({ name: 'Dreamy Piano', category: 'melody', pattern: 'note("<c4 e4 g4 b4>*2").s("piano")', key: 'C', bpm: 120, mood: { energy: 0.3, brightness: 0.7 }, density: 0.4, tags: ['dreamy', 'soft'] }),
  createBlock({ name: 'Plucky Synth Arp', category: 'melody', pattern: 'note("c4 e4 g4 c5 g4 e4").s("triangle")', key: 'C', bpm: 120, bars: 1, mood: { energy: 0.6, brightness: 0.8 }, density: 0.6, tags: ['arp', 'bright'] }),
  createBlock({ name: 'Dark Synth Lead', category: 'melody', pattern: 'note("eb4 ~ g4 ~ bb4 ~ g4 ~").s("sawtooth").lpf(2000)', key: 'Cm', bpm: 120, mood: { energy: 0.5, brightness: 0.3 }, density: 0.5, tags: ['dark', 'lead'] }),
  createBlock({ name: '8-bit Melody', category: 'melody', pattern: 'note("e5 b4 d5 c5 e5 b4 c5 d5").s("square")', key: 'C', bpm: 120, mood: { energy: 0.7, brightness: 0.9 }, density: 0.7, tags: ['retro', 'chiptune'] }),
  createBlock({ name: 'Minor Arp', category: 'melody', pattern: 'note("a3 c4 e4 a4 e4 c4").s("triangle")', key: 'Am', bpm: 110, mood: { energy: 0.4, brightness: 0.4 }, density: 0.6, tags: ['arp', 'melancholy'] }),
  createBlock({ name: 'Pentatonic Riff', category: 'melody', pattern: 'note("g4 a4 b4 d5 e5 d5 b4 a4").s("sawtooth").lpf(3000)', key: 'G', bpm: 100, mood: { energy: 0.5, brightness: 0.6 }, density: 0.7, tags: ['pentatonic', 'riff'] }),
  createBlock({ name: 'Trance Lead', category: 'melody', pattern: 'note("f4 f4 a4 f4 c5 a4 f4 c4").s("sawtooth").lpf(4000)', key: 'F', bpm: 140, mood: { energy: 0.8, brightness: 0.7 }, density: 0.7, tags: ['trance', 'uplifting'] }),
  createBlock({ name: 'Jazz Lick', category: 'melody', pattern: 'note("d4 f4 a4 c5 bb4 a4 f4 d4").s("triangle")', key: 'Dm', bpm: 90, mood: { energy: 0.3, brightness: 0.5 }, density: 0.6, tags: ['jazz', 'smooth'] }),
  createBlock({ name: 'Sparkle Bell', category: 'melody', pattern: 'note("e5 ~ b5 ~ e5 b4 ~ e5").s("sine")', key: 'Em', bpm: 128, mood: { energy: 0.3, brightness: 0.9 }, density: 0.4, tags: ['bell', 'sparkle'] }),

  // ============================================================
  // CHORDS (9)
  // ============================================================
  createBlock({ name: 'Lo-fi Jazz Chords', category: 'chords', pattern: 'note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>").s("piano")', key: 'C', bpm: 85, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.2, tags: ['lofi', 'jazz'] }),
  createBlock({ name: 'Ambient Wash', category: 'chords', pattern: 'note("<[c3,g3,c4] [f3,a3,c4]>").s("sawtooth").lpf(800).gain(0.3)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.1, brightness: 0.6 }, density: 0.1, tags: ['ambient', 'pad'] }),
  createBlock({ name: 'Power Chords', category: 'chords', pattern: 'note("<[c3,g3] [eb3,bb3] [f3,c4] [g3,d4]>").s("sawtooth").gain(0.5)', key: 'Cm', bpm: 130, bars: 4, mood: { energy: 0.8, brightness: 0.4 }, density: 0.3, tags: ['rock', 'power'] }),
  createBlock({ name: 'Bright Pop Chords', category: 'chords', pattern: 'note("<[c3,e3,g3] [f3,a3,c4] [g3,b3,d4] [c3,e3,g3]>").s("triangle")', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.5, brightness: 0.8 }, density: 0.2, tags: ['pop', 'happy'] }),
  createBlock({ name: 'Minor Seventh Pad', category: 'chords', pattern: 'note("<[a2,c3,e3,g3] [d3,f3,a3,c4]>").s("sawtooth").lpf(600).gain(0.3)', key: 'Am', bpm: 90, bars: 2, mood: { energy: 0.2, brightness: 0.3 }, density: 0.1, tags: ['pad', 'moody'] }),
  createBlock({ name: 'Staccato Stabs', category: 'chords', pattern: 'note("<[g3,b3,d4] ~ ~ [a3,c4,e4] ~ ~ [g3,b3,d4] ~>").s("square")', key: 'G', bpm: 128, bars: 2, mood: { energy: 0.7, brightness: 0.6 }, density: 0.4, tags: ['stab', 'rhythmic'] }),
  createBlock({ name: 'Folk Strum', category: 'chords', pattern: 'note("<[d3,f3,a3] [d3,f3,a3] [a2,c3,e3] [a2,c3,e3]>").s("triangle")', key: 'Dm', bpm: 100, bars: 4, mood: { energy: 0.4, brightness: 0.5 }, density: 0.3, tags: ['folk', 'acoustic'] }),
  createBlock({ name: 'Epic Fifths', category: 'chords', pattern: 'note("<[e2,b2,e3] [a2,e3,a3]>").s("sawtooth").lpf(1200).gain(0.4)', key: 'Em', bpm: 140, bars: 2, mood: { energy: 0.7, brightness: 0.3 }, density: 0.2, tags: ['epic', 'cinematic'] }),
  createBlock({ name: 'Island Vibes', category: 'chords', pattern: 'note("<[f3,a3,c4] [bb2,d3,f3] [c3,e3,g3] [f3,a3,c4]>").s("triangle")', key: 'F', bpm: 95, bars: 4, mood: { energy: 0.4, brightness: 0.7 }, density: 0.2, tags: ['tropical', 'relaxed'] }),

  // ============================================================
  // FX (7)
  // ============================================================
  createBlock({ name: 'Vinyl Crackle', category: 'fx', pattern: 's("hh*16").gain(0.05).speed(0.5)', key: 'chromatic', bpm: 120, mood: { energy: 0.1, brightness: 0.3 }, density: 0.1, tags: ['texture', 'lofi'] }),
  createBlock({ name: 'Riser', category: 'fx', pattern: 'note("c3").s("sawtooth").lpf(800)', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.6, brightness: 0.5 }, density: 0.1, tags: ['riser', 'build'] }),
  createBlock({ name: 'White Noise Wash', category: 'fx', pattern: 's("hh*4").gain(0.03)', key: 'chromatic', bpm: 120, mood: { energy: 0.1, brightness: 0.5 }, density: 0.1, tags: ['noise', 'ambient'] }),
  createBlock({ name: 'Tick Tock', category: 'fx', pattern: 's("hh*2").gain(0.15).speed(2)', key: 'chromatic', bpm: 120, mood: { energy: 0.2, brightness: 0.6 }, density: 0.2, tags: ['click', 'clock'] }),
  createBlock({ name: 'Reverse Hit', category: 'fx', pattern: 's("sd").speed(-1).slow(4)', key: 'chromatic', bpm: 120, bars: 4, mood: { energy: 0.5, brightness: 0.4 }, density: 0.05, tags: ['reverse', 'impact'] }),
  createBlock({ name: 'Glitch Stutter', category: 'fx', pattern: 's("cp*16").gain(0.08).speed(4)', key: 'chromatic', bpm: 140, mood: { energy: 0.7, brightness: 0.6 }, density: 0.8, tags: ['glitch', 'stutter'] }),
  createBlock({ name: 'Ocean Waves', category: 'fx', pattern: 's("hh*8").gain(0.04).speed(0.3)', key: 'chromatic', bpm: 60, mood: { energy: 0.05, brightness: 0.4 }, density: 0.1, tags: ['nature', 'calm'] }),

  // ============================================================
  // VOCAL (6)
  // ============================================================
  createBlock({ name: 'Hey Chop', category: 'vocal', pattern: 's("mouth:0*2")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.7 }, density: 0.3, tags: ['chop', 'shout'] }),
  createBlock({ name: 'Ooh Pad', category: 'vocal', pattern: 's("mouth:1").slow(2)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.1, tags: ['vocal', 'pad'] }),
  createBlock({ name: 'Vocal Chop Rhythm', category: 'vocal', pattern: 's("mouth:0 ~ mouth:1 ~ mouth:0 mouth:1 ~ ~")', key: 'chromatic', bpm: 110, mood: { energy: 0.6, brightness: 0.6 }, density: 0.5, tags: ['chop', 'rhythm'] }),
  createBlock({ name: 'Breath Texture', category: 'vocal', pattern: 's("mouth:1*2").gain(0.1).speed(0.5)', key: 'chromatic', bpm: 90, mood: { energy: 0.1, brightness: 0.3 }, density: 0.1, tags: ['breath', 'texture'] }),
  createBlock({ name: 'Vocal Stab', category: 'vocal', pattern: 's("mouth:0").speed(1.5)', key: 'chromatic', bpm: 128, mood: { energy: 0.8, brightness: 0.8 }, density: 0.2, tags: ['stab', 'energy'] }),
  createBlock({ name: 'Choir Drone', category: 'vocal', pattern: 's("mouth:1").slow(4).gain(0.2)', key: 'C', bpm: 80, bars: 4, mood: { energy: 0.1, brightness: 0.4 }, density: 0.05, tags: ['choir', 'drone'] }),
]
