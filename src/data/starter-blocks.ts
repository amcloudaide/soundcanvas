import { createBlock, type Block } from '../types/block'

export const starterBlocks: Block[] = [
  // === BEATS ===
  createBlock({ name: 'Four on the Floor', category: 'beats', pattern: 's("bd*4, [~ cp]*2, hh*8")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.6 }, density: 0.7, tags: ['house', 'dance'] }),
  createBlock({ name: 'Chill Hip-Hop', category: 'beats', pattern: 's("bd ~ [~ bd] ~, ~ sd ~ sd, hh*8")', key: 'chromatic', bpm: 85, mood: { energy: 0.3, brightness: 0.4 }, density: 0.5, tags: ['lofi', 'chill'] }),
  createBlock({ name: 'Trap Beat', category: 'beats', pattern: 's("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ sd ~, hh*16")', key: 'chromatic', bpm: 140, mood: { energy: 0.9, brightness: 0.3 }, density: 0.8, tags: ['trap', 'hard'] }),
  createBlock({ name: 'Reggae One Drop', category: 'beats', pattern: 's("~ ~ ~ bd, ~ ~ sd ~, hh*4")', key: 'chromatic', bpm: 75, mood: { energy: 0.4, brightness: 0.6 }, density: 0.3, tags: ['reggae', 'laid-back'] }),
  createBlock({ name: 'Breakbeat', category: 'beats', pattern: 's("bd ~ sd bd ~ sd bd sd, hh*8")', key: 'chromatic', bpm: 130, mood: { energy: 0.8, brightness: 0.5 }, density: 0.7, tags: ['break', 'energetic'] }),

  // === BASS ===
  createBlock({ name: 'Sub Wobble', category: 'bass', pattern: 'note("c2 ~ eb2 ~").s("sawtooth").lpf(400)', key: 'Cm', bpm: 120, mood: { energy: 0.6, brightness: 0.2 }, density: 0.4, tags: ['dark', 'wobble'] }),
  createBlock({ name: 'Funky Slap', category: 'bass', pattern: 'note("c2 c2 eb2 f2 g2 f2 eb2 c2").s("sawtooth").lpf(800)', key: 'Cm', bpm: 110, mood: { energy: 0.7, brightness: 0.5 }, density: 0.7, tags: ['funky', 'groove'] }),
  createBlock({ name: 'Deep House Bass', category: 'bass', pattern: 'note("c2 ~ ~ c2 ~ ~ c2 ~").s("triangle").lpf(300)', key: 'Cm', bpm: 122, mood: { energy: 0.5, brightness: 0.3 }, density: 0.3, tags: ['deep', 'house'] }),
  createBlock({ name: 'Acid Line', category: 'bass', pattern: 'note("c2 c2 eb2 c2 f2 c2 g2 eb2").s("square").lpf(1200)', key: 'Cm', bpm: 130, mood: { energy: 0.8, brightness: 0.4 }, density: 0.8, tags: ['acid', 'squelchy'] }),

  // === MELODY ===
  createBlock({ name: 'Dreamy Piano', category: 'melody', pattern: 'note("<c4 e4 g4 b4>*2").s("piano")', key: 'C', bpm: 120, mood: { energy: 0.3, brightness: 0.7 }, density: 0.4, tags: ['dreamy', 'soft'] }),
  createBlock({ name: 'Plucky Synth Arp', category: 'melody', pattern: 'note("c4 e4 g4 c5 g4 e4").s("triangle")', key: 'C', bpm: 120, bars: 1, mood: { energy: 0.6, brightness: 0.8 }, density: 0.6, tags: ['arp', 'bright'] }),
  createBlock({ name: 'Dark Synth Lead', category: 'melody', pattern: 'note("eb4 ~ g4 ~ bb4 ~ g4 ~").s("sawtooth").lpf(2000)', key: 'Cm', bpm: 120, mood: { energy: 0.5, brightness: 0.3 }, density: 0.5, tags: ['dark', 'lead'] }),
  createBlock({ name: '8-bit Melody', category: 'melody', pattern: 'note("e5 b4 d5 c5 e5 b4 c5 d5").s("square")', key: 'C', bpm: 120, mood: { energy: 0.7, brightness: 0.9 }, density: 0.7, tags: ['retro', 'chiptune'] }),

  // === CHORDS ===
  createBlock({ name: 'Lo-fi Jazz Chords', category: 'chords', pattern: 'note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>").s("piano")', key: 'C', bpm: 85, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.2, tags: ['lofi', 'jazz'] }),
  createBlock({ name: 'Ambient Wash', category: 'chords', pattern: 'note("<[c3,g3,c4] [f3,a3,c4]>").s("sawtooth").lpf(800).gain(0.3)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.1, brightness: 0.6 }, density: 0.1, tags: ['ambient', 'pad'] }),
  createBlock({ name: 'Power Chords', category: 'chords', pattern: 'note("<[c3,g3] [eb3,bb3] [f3,c4] [g3,d4]>").s("sawtooth").gain(0.5)', key: 'Cm', bpm: 130, bars: 4, mood: { energy: 0.8, brightness: 0.4 }, density: 0.3, tags: ['rock', 'power'] }),
  createBlock({ name: 'Bright Pop Chords', category: 'chords', pattern: 'note("<[c3,e3,g3] [f3,a3,c4] [g3,b3,d4] [c3,e3,g3]>").s("triangle")', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.5, brightness: 0.8 }, density: 0.2, tags: ['pop', 'happy'] }),

  // === FX ===
  createBlock({ name: 'Vinyl Crackle', category: 'fx', pattern: 's("hh*16").gain(0.05).speed(0.5)', key: 'chromatic', bpm: 120, mood: { energy: 0.1, brightness: 0.3 }, density: 0.1, tags: ['texture', 'lofi'] }),
  createBlock({ name: 'Riser', category: 'fx', pattern: 'note("c3").s("sawtooth").lpf(800)', key: 'C', bpm: 120, bars: 4, mood: { energy: 0.6, brightness: 0.5 }, density: 0.1, tags: ['riser', 'build'] }),

  // === VOCAL ===
  createBlock({ name: 'Hey Chop', category: 'vocal', pattern: 's("mouth:0*2")', key: 'chromatic', bpm: 120, mood: { energy: 0.7, brightness: 0.7 }, density: 0.3, tags: ['chop', 'shout'] }),
  createBlock({ name: 'Ooh Pad', category: 'vocal', pattern: 's("mouth:1").slow(2)', key: 'C', bpm: 120, bars: 2, mood: { energy: 0.2, brightness: 0.5 }, density: 0.1, tags: ['vocal', 'pad'] }),
]
