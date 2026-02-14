import { Character, StrongholdPreset } from './types';

// ── Dice Constants ──

export const MAX_COMBAT_DICE = 5;
export const MAX_REROLLS = 5;
export const FIELD_HIT_THRESHOLD = 5; // hits on 5+
export const SIEGE_ATTACKER_HIT_THRESHOLD = 6; // hits on 6 only
export const DEFENDER_HIT_THRESHOLD = 5; // always hits on 5+

// ── Characters ──

export const CHARACTERS: Character[] = [
  // Free Peoples
  {
    name: 'Gandalf the White',
    faction: 'free_peoples',
    leadership: 3,
    level: 3,
    isCaptainOfTheWest: true,
    specialAbility: 'Reduces Nazgûl leadership to 0 when present',
  },
  {
    name: 'Aragorn',
    faction: 'free_peoples',
    leadership: 3,
    level: 3,
    isCaptainOfTheWest: true,
  },
  {
    name: 'Boromir',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: true,
  },
  {
    name: 'Legolas',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: false,
  },
  {
    name: 'Gimli',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: false,
  },
  {
    name: 'Meriadoc',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: false,
  },
  {
    name: 'Peregrin',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: false,
  },
  {
    name: 'Théoden',
    faction: 'free_peoples',
    leadership: 2,
    level: 2,
    isCaptainOfTheWest: false,
  },
  {
    name: 'Éomer',
    faction: 'free_peoples',
    leadership: 1,
    level: 1,
    isCaptainOfTheWest: false,
  },
  // Shadow
  {
    name: 'The Witch-king',
    faction: 'shadow',
    leadership: 3,
    level: 3,
    isCaptainOfTheWest: false,
    specialAbility: 'Nazgûl — leadership negated by Gandalf the White',
  },
  {
    name: 'Saruman',
    faction: 'shadow',
    leadership: 2,
    level: 2,
    isCaptainOfTheWest: false,
  },
  {
    name: 'The Mouth of Sauron',
    faction: 'shadow',
    leadership: 2,
    level: 2,
    isCaptainOfTheWest: false,
  },
];

// ── Stronghold Presets ──

export const STRONGHOLD_PRESETS: StrongholdPreset[] = [
  // Free Peoples Strongholds
  {
    name: 'Rivendell',
    faction: 'free_peoples',
    defaultDefender: { regulars: 0, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Grey Havens',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 0, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Woodland Realm',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Erebor',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Dale',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: "Helm's Deep",
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Edoras',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 1, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Minas Tirith',
    faction: 'free_peoples',
    defaultDefender: { regulars: 3, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Dol Amroth',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 1, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Pelargir',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Lórien',
    faction: 'free_peoples',
    defaultDefender: { regulars: 1, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  // Shadow Strongholds
  {
    name: 'Dol Guldur',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Orthanc',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 1, characters: [], leaders: 1 },
    battleType: 'siege',
  },
  {
    name: 'Minas Morgul',
    faction: 'shadow',
    defaultDefender: { regulars: 2, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Morannon',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Barad-dûr',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 1, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Mount Gundabad',
    faction: 'shadow',
    defaultDefender: { regulars: 2, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Moria',
    faction: 'shadow',
    defaultDefender: { regulars: 2, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Far Harad',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 1, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Near Harad',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
  {
    name: 'Umbar',
    faction: 'shadow',
    defaultDefender: { regulars: 3, elites: 0, characters: [], leaders: 0 },
    battleType: 'siege',
  },
];
