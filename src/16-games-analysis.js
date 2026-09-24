/* =====================================================================
   GAME ANALYSES
   Family, tags and search names for every reference game, then the full
   analysis (signature idea, ten lenses, screenshots) as each one is
   written. The frame and its rules are in 14-references.js.
   Facts that could be wrong (a year, a name, a business model) are
   checked against a primary or well-established source; judgement is
   written as judgement.
   ===================================================================== */
/** @type {[string, string, string[], string[]][]} */ ([
  ['slay-the-spire', 'roguelike', ['systems','procedural','early-access','premium'], ['sts','slay spire']],
  ['stardew-valley', 'sim', ['cozy','solo-developer','premium','multiplayer'], ['stardew']],
  ['vampire-survivors', 'roguelike', ['real-time','early-access','premium'], ['vs','vampire survivor']],
  ['balatro', 'roguelike', ['systems','solo-developer','premium'], ['poker roguelike']],
  ['celeste', 'action', ['precision','premium'], ['madeline']],
  ['hades', 'roguelike', ['real-time','narrative-choice','early-access','premium'], ['hades 1']],
  ['into-the-breach', 'strategy', ['turn-based','systems','premium'], ['itb']],
  ['minecraft', 'sim', ['procedural','multiplayer','premium'], ['mc']],
  ['among-us', 'social', ['multiplayer','premium'], ['amogus']],
  ['wordle', 'puzzle', ['daily','deduction','free-to-play'], ['word game']],
  ['hollow-knight', 'action', ['minimal-hud','premium'], ['hk', 'metroidvania']],
  ['animal-crossing-nh', 'sim', ['cozy','multiplayer','premium'], ['acnh', 'animal crossing']],
  ['factorio', 'sim', ['systems','early-access','premium'], ['factory game']],
  ['portal', 'puzzle', ['rules-as-objects','premium'], ['portal 1']],
  ['tetris', 'puzzle', ['real-time','precision'], ['tetromino']]
]).forEach(([id, family, tags, aka]) => ANALYSIS(id, { family, tags, aka }));

ANALYSIS('hollow-knight', {
  signature: {
    idea: 'Make the map something you earn',
    mechanism: 'You enter each region of Hallownest with no map of it. In most regions the cartographer Cornifer is somewhere inside, selling a partial map; after that, the rooms you explore beyond his sketch are added only when you rest at a bench with a quill. Exits to neighbouring regions show as a name and an arrow. Knowing where you stand on the map is itself an item: the Wayward Compass charm, which takes a charm notch you could spend on combat.',
    teach: 'The first region, the Forgotten Crossroads, sits just under the town, loops back on itself and has the cheapest map, so being lost is cheap. Cornifer is found by following his humming and a trail of discarded paper, which teaches that the map is a thing in the world you go and find. The map shop in Dirtmouth, the town above, sells the quill and pins, so the whole system is introduced through characters, not a tutorial screen.',
    fair: 'Benches are frequent and easy to spot, and they are where the map updates, so the rule is consistent: rest, and what you learned is written down. Rooms Cornifer did not draw stay blank until you walk them and rest, so the map only ever claims what someone has actually seen. Dying leaves your Geo with a shade where you fell and cracks your soul gauge until you beat it, so a mistake costs a walk back, not your progress on the map.',
    escalate: 'Later regions are larger, more vertical and less forgiving, and their cartographer is hidden deeper, so you spend longer lost before you can buy a map. Some regions, such as Deepnest, are dark and maze-like by design, so the skill the early game taught, reading the space and remembering it, is tested hardest where the map helps least: Cornifer’s map of Deepnest is barely filled in.',
    copies: 'Copies hand over a full map with every room revealed and markers on it, which turns exploration into walking between icons. The opposite failure is withholding the map without the benches, arrows and landmarks that make getting lost recoverable; then being lost is only tedium.',
    prototype: 'Build five connected grey-box rooms with one clear landmark each. Give the player no map until they find a vendor in room three; after that, draw only the rooms they have entered, and only when they touch a save point. Watch whether players start remembering landmarks before the map arrives.'
  },
  lens: {
    gameplay: { text: 'Short, readable melee: strike with the nail, dash and jump, and heal by spending the soul you gain from hitting enemies. Charms with notch costs let a player build for an area or a boss.', topics: ['builds-and-loadouts', 'challenge-failure-recovery'] },
    ui: { primary: true,
      did: 'The only permanent HUD is the soul vessel, the health masks and the Geo count, packed into the top-left corner; everything else is the world or a screen you choose to open.',
      moment: 'Resting on a bench: a vessel, four masks and a number, and the rest of the screen is the hall, its lamp and the bugs around it.',
      why: 'With the corner that small, the eye stays on the knight and on the enemy’s telegraph, which is what the combat is read from. Soul is both the healing and the spell resource, so one gauge answers both “can I heal?” and “can I cast?”.',
      steal: 'Keep on screen only what a player checks between actions, and merge resources that answer the same question.',
      trap: 'Hiding what a player needs mid-fight in the name of minimalism; Hollow Knight keeps health and healing in view because combat depends on them.',
      topics: ['ux-as-design', 'readability-and-hierarchy'] },
    art: { text: 'Hand-drawn 2D art with a palette of its own for each region and strong silhouettes, so the knight and its enemies read clearly against detailed backgrounds.', topics: ['visual-language'] },
    sound: { text: 'Christopher Larkin’s score gives regions their own themes and leaves many spaces quiet, so music marks places and major fights.' },
    lore: { text: 'A fallen insect kingdom and the plague that ended it, told in fragments; the knight’s own origin is part of the mystery.' },
    world: { primary: true,
      did: 'Hallownest is one connected underground kingdom whose regions link back to each other through shortcuts, lifts, trams and a network of stag stations.',
      moment: 'The map of the Fungal Wastes after buying it: named exits to the Forgotten Crossroads and the City of Tears show the region is part of a larger whole.',
      why: 'Each region has its own look and its own movement or combat question, so players find their way by memory of places rather than by markers, and opening a shortcut feels like understanding the world.',
      steal: 'Give every region a distinct look and a distinct question, and connect regions in more than one place.',
      trap: 'Building a large world before each region has an identity; size without distinct places is only distance.',
      topics: ['spatial-composition', 'level-structure'] },
    env: { primary: true,
      did: 'The fall of Hallownest is told mostly through its ruins, its survivors and optional tablets rather than cutscenes.',
      moment: 'The City of Tears: a great city under endless rain, its former residents still walking their old routes.',
      why: 'Players put the history together at their own pace, and close looking is rewarded with understanding rather than items. The Dream Nail reads the thoughts of creatures, which turns any enemy into a line of story.',
      steal: 'Let the space carry the history and give curious players a tool to read deeper, so story is optional depth, not an interruption.',
      trap: 'Leaving the story so implicit that nobody can follow it; Hollow Knight still gives clear characters and a few direct scenes to hang the fragments on.',
      topics: ['environmental-storytelling'] },
    business: { text: 'A small team in Adelaide funded it partly through Kickstarter, sold it at a low premium price and followed with free content updates rather than paid expansions; the sequel, Hollow Knight: Silksong, arrived in 2025.' },
    replay: { text: 'Optional bosses, the harder rematches of the Godmaster update and a Steel Soul mode with permanent death give mastery players a second game.' },
    lineage: { text: 'It inherits the ability-gated exploration of Metroid and Castlevania and a Souls-like death penalty (recover what you dropped where you died); the bought, bench-updated map is its own twist.' }
  },
  shots: [
    { img: 'assets/games/shots/hollow-knight-hud.webp', lens: 'ui', alt: 'Hollow Knight: the knight on a bench beside another bug; only the soul vessel, four masks and a Geo count sit in the top-left corner.', caption: 'The whole permanent HUD fits in one corner; the rest of the screen is the world.',
      callouts: [{ x: 0.10, y: 0.13, t: 'Soul vessel: spent to heal or to cast' }, { x: 0.215, y: 0.095, t: 'Masks: health' }, { x: 0.235, y: 0.17, t: 'Geo: dropped with a shade when you die' }, { x: 0.55, y: 0.77, t: 'A bench: save, change charms, update the map' }] },
    { img: 'assets/games/shots/hollow-knight-map.webp', lens: 'world', alt: 'Hollow Knight: the map of the Fungal Wastes, with named exits to neighbouring regions.', caption: 'Cornifer’s map arrives partly drawn and the quill adds what you explore; each exit to another region is a name and an arrow.',
      callouts: [{ x: 0.59, y: 0.32, t: 'A pin from the map shop: a bench' }, { x: 0.72, y: 0.535, t: 'An exit to a neighbouring region: a name and an arrow' }, { x: 0.52, y: 0.72, t: 'Mantis Village, a place already visited' }] },
    { img: 'assets/games/shots/hollow-knight-greenpath.webp', lens: 'art', alt: 'Hollow Knight: Greenpath, a region of teal water and green foliage.', caption: 'Greenpath: each region has its own palette, and the knight’s white mask reads against all of them.' }
  ]
});
