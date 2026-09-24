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
    mechanism: 'You enter each region of Hallownest with no map of it. In most regions the cartographer Cornifer is somewhere inside, selling a partial map he has sketched while exploring ahead of you. After that, the rooms you explore beyond his sketch are added only when you rest at a bench with a quill, which his wife Iselda sells in Dirtmouth, the town above. Exits to neighbouring regions show as a name and an arrow. Even knowing where you stand is an item: the Wayward Compass charm, which takes a charm notch you could otherwise spend on combat.',
    teach: 'The first region, the Forgotten Crossroads, sits just under the town, loops back on itself and has the cheapest map, so being lost is cheap and brief. Cornifer is found by following his humming and a trail of discarded paper, which teaches, without a tutorial, that a map is something in the world you go and find. Iselda’s shop sells the quill and the pins that mark benches and stations, so the whole system arrives through characters. By the time the player leaves the Crossroads, looking for the cartographer has become a habit.',
    fair: 'Benches are frequent and easy to spot, and they are where the map updates, so the rule never changes: rest, and what you learned is written down. Rooms Cornifer did not draw stay blank until you walk them and rest, so the map only ever claims what someone has actually seen. Dying leaves your Geo with a shade where you fell and cracks your soul gauge until you beat it, so a mistake costs a walk back, not the map. And the compass is always there for a player who would rather spend a notch than get lost.',
    escalate: 'Later regions are larger, more vertical and less forgiving, and Cornifer is hidden deeper in them, so you spend longer lost before you can buy a map. Some regions are dark and maze-like by design, and Cornifer’s map of Deepnest is barely filled in, so the skill the early game taught, reading the space and remembering landmarks, is tested hardest where the map helps least. By the late game the map is less a tool than a record of how much of Hallownest you have made your own.',
    copies: 'Copies hand over a full map with every room revealed and markers on it, which turns exploration into walking between icons; nothing is ever lost, so nothing is ever found. The opposite failure is withholding the map without the benches, arrows, landmarks and cheap first region that make being lost recoverable; then being lost is only tedium, and players reach for a wiki. The rule works because the cost of not knowing is real but bounded.',
    prototype: 'Build five connected grey-box rooms with one clear landmark each. Give the player no map until they find a vendor in room three; after that, draw only the rooms they have entered, and only when they touch a save point. Watch whether players start remembering landmarks before the map arrives. Then run the same test with a full map from the start, and compare how long players spend looking at the world rather than at the map.'
  },
  lens: {
    gameplay: { text: 'Short, readable melee: strike with the nail, jump, dash, and heal by focusing the soul you gain from hitting enemies, so healing costs the resource that attacking earns. Charms with notch costs let a player build for an area or a boss, and new movement abilities reopen earlier regions in new ways, so the same world keeps offering new routes.', topics: ['builds-and-loadouts', 'challenge-failure-recovery'] },
    ui: { primary: true,
      did: 'The only permanent HUD is the soul vessel, the health masks and the Geo count, packed into the top-left corner. Everything else is either the world itself or a screen you choose to open: the map, the inventory, the charms. There is no minimap, no quest marker and no floating damage number.',
      moment: 'Resting on a bench: a vessel, four masks and a number, and the rest of the screen is the hall, its lamp and the bugs around it. In a fight the same corner is all you glance at; the knight, the enemy and the telegraph of its next attack fill everything else.',
      why: 'With the corner that small, the eye stays on the knight and on the enemy’s telegraph, which is what the combat is read from. Soul is both the healing and the spell resource, so one gauge answers both “can I heal?” and “can I cast?”, and the choice between them is visible at a glance. Keeping the map off screen is what makes being lost, and finding your way, part of the game.',
      steal: 'Keep on screen only what a player checks between actions, merge resources that answer the same question, and let the world carry everything else. Put a resource the player must choose how to spend where they will see it while making the choice.',
      trap: 'Hiding what a player needs mid-fight in the name of minimalism. Hollow Knight keeps health and healing in view because combat depends on them; what it removes is navigation help, and only because navigation is the skill it wants to test.',
      topics: ['ux-as-design', 'readability-and-hierarchy'] },
    art: { text: 'Hand-drawn 2D art with a palette of its own for each region, from the lush greens of Greenpath to the rain-soaked blues of the City of Tears. Characters are simple, strong silhouettes with pale masks, so the knight and its enemies read clearly against detailed, layered backgrounds, and the whole kingdom looks as if one hand drew it.', topics: ['visual-language'] },
    sound: { text: 'Christopher Larkin’s score gives regions their own themes and leaves many spaces quiet, so music marks places, returns and major fights rather than filling every room. Many bosses get a theme of their own, which makes each fight an event, and the quiet stretches make the kingdom feel empty and old.', topics: ['audio-and-music'] },
    lore: { text: 'A fallen insect kingdom and the plague that ended it, told in fragments through characters, tablets and places. The knight’s own origin is part of the mystery. The key facts are there for players who look, while players who only want to explore can still follow a clear goal.' },
    world: { primary: true,
      did: 'Hallownest is one connected underground kingdom whose regions link back to each other through shortcuts, lifts, trams and a network of stag stations. Each region has its own name, palette, music, enemies and architecture, and most connect to more than one neighbour.',
      moment: 'The map of the Fungal Wastes after buying it: named exits to the Forgotten Crossroads and the City of Tears show the region is part of a larger whole, and a bench pin marks where it is safe to stop and let the quill catch up.',
      why: 'Because every region looks, sounds and plays differently, players find their way by memory of places rather than by markers. Opening a shortcut back to a known area feels like understanding the world, not just unlocking a door, and the stag stations make long journeys a reward you earned rather than a chore.',
      steal: 'Give every region a distinct look, sound and question, connect regions in more than one place, and make fast travel something the player unlocks by exploring. Let the player’s growing mental map be the reward.',
      trap: 'Building a large world before each region has an identity; size without distinct places is only distance. And connecting everything so early that no route ever needs to be remembered.',
      topics: ['spatial-composition', 'level-structure'] },
    env: { primary: true,
      did: 'The fall of Hallownest is told mostly through its ruins, its surviving characters and optional lore tablets rather than cutscenes. Many enemies are the kingdom’s former citizens, infected and still going through the motions of their old lives.',
      moment: 'The City of Tears: a great city under endless rain, its former residents’ husks still walking their old routes, its grand halls and fountains showing what it once was before you learn what happened to it.',
      why: 'Players put the history together at their own pace, and close looking is rewarded with understanding rather than items. The Dream Nail reads the thoughts of creatures, which turns any enemy into a line of story, so curiosity itself becomes a way of playing.',
      steal: 'Let the space carry the history, make the enemies part of the story of the place, and give curious players a tool to read deeper, so story is optional depth rather than an interruption.',
      trap: 'Leaving the story so implicit that nobody can follow it. Hollow Knight still gives clear characters, a few direct scenes and a readable goal to hang the fragments on; without those, fragments are just noise.',
      topics: ['environmental-storytelling'] },
    business: { text: 'A small team in Adelaide funded it partly through Kickstarter, sold it at a low premium price and followed with free content updates rather than paid expansions. The low price for a long game and the steady free updates kept players talking about it for years, until the sequel, Hollow Knight: Silksong, arrived in 2025.', topics: ['business-model'] },
    replay: { text: 'Optional bosses, the harder rematches of the Godmaster update and a Steel Soul mode with permanent death give mastery players a second game. Charm builds change how fights play out, and speedrunners have turned the connected world into a route-planning puzzle of its own.' },
    lineage: { text: 'It inherits the ability-gated exploration of Metroid, which Team Cherry named as an influence, where new movement reopens old places, and has a death penalty critics likened to Dark Souls: recover what you dropped where you died. The bought, bench-updated map is its own twist on the genre’s usual automatic map.' }
  },
  shots: [
    { img: 'assets/games/shots/hollow-knight-hud.webp', lens: 'ui', alt: 'Hollow Knight: the knight on a bench beside another bug; only the soul vessel, four masks and a Geo count sit in the top-left corner.', caption: 'The whole permanent HUD fits in one corner; the rest of the screen is the world.',
      callouts: [{ x: 0.10, y: 0.13, t: 'Soul vessel: spent to heal or to cast' }, { x: 0.215, y: 0.095, t: 'Masks: health' }, { x: 0.235, y: 0.17, t: 'Geo: dropped with a shade when you die' }, { x: 0.55, y: 0.77, t: 'A bench: save, change charms, update the map' }] },
    { img: 'assets/games/shots/hollow-knight-map.webp', lens: 'world', alt: 'Hollow Knight: the map of the Fungal Wastes, with named exits to neighbouring regions.', caption: 'Cornifer’s map arrives partly drawn and the quill adds what you explore; each exit to another region is a name and an arrow.',
      callouts: [{ x: 0.59, y: 0.32, t: 'A pin from the map shop: a bench' }, { x: 0.72, y: 0.535, t: 'An exit to a neighbouring region: a name and an arrow' }, { x: 0.52, y: 0.72, t: 'Mantis Village, a place already visited' }] },
    { img: 'assets/games/shots/hollow-knight-greenpath.webp', lens: 'art', alt: 'Hollow Knight: Greenpath, a region of teal water and green foliage.', caption: 'Greenpath: each region has its own palette, and the knight’s white mask reads against all of them.' }
  ]
});
