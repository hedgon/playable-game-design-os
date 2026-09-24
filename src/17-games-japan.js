/* =====================================================================
   REFERENCE GAMES: Japanese games and games that bend time and turns.
   Whole entries added with GAME() (see 14-references.js for the frame).
   Facts checked against primary or well-established sources, 2026-09-24.
   ===================================================================== */
GAME({ id:'valkyria-chronicles', img:'assets/games/valkyria-chronicles.jpg', dev:'SEGA', store:'https://store.steampowered.com/app/294860/Valkyria_Chronicles/',
  t:'Valkyria Chronicles', year:2008, genre:'tactical RPG', family:'strategy', tags:['japanese','turn-based','time-blend','premium'], aka:['vc', 'valkyria', 'blitz'],
  want:'Command a squad through a war that looks like a painting, and feel each soldier’s run under fire.',
  verb:'spend command points, then run one soldier in real time and take the shot',
  first30:'A book opens on the first chapter. In a village skirmish you pick a unit on the map, and the camera drops behind them as they start to run.',
  minute:'Which unit gets the next command point? How far can this scout run before the machine gun sees her? Aim for the head, or take the safer body shot?',
  engines:['tension','mastery','storytelling','expression'],
  why:'BLiTZ keeps the planning of turn-based tactics but makes each move a short real-time run under enemy fire, so a plan is tested by the player’s own movement. The watercolour look and the book frame give a grim war the feel of a story being told.',
  complaints:'Rankings reward finishing in few turns, which pushes players to rush one fast unit across the map. Being shot while running can feel unpredictable. The tone swings between grim and light.',
  lesson:'A turn can contain real time: keep the strategic choice discrete and make carrying it out physical, with an enemy that can punish a sloppy run.',
  misses:'Copies add real-time movement without the interception fire and cover rules that make movement a risk, so the hybrid becomes turn-based tactics with extra walking.',
  diagrams:[
    { kind:'loop', title:'Valkyria Chronicles: a turn you run yourself', steps:[{t:'Command mode', d:'spend a point on a unit'},{t:'Action mode', d:'run in real time; the gauge drains'},{t:'Target mode', d:'time stops; aim and fire'},{t:'Enemy phase', d:'they move and shoot back'}] }
  ],
  signature: {
    idea: 'Put real-time movement inside a turn',
    mechanism: 'Each turn starts in Command Mode on an overhead map with a pool of Command Points. Spending one gives you direct control of a unit: the camera drops behind the soldier and you move them freely in real time, limited by an Action Points gauge that drains as they run. Enemies with line of sight fire on you while you move. When you stop to attack, time freezes in Target Mode and you aim by hand, head shots included. Points can go to many units or to the same unit again, with less movement each time, and unspent points carry over.',
    teach: 'The campaign opens with small skirmishes before it asks for larger battles, and each class shows its job in its weapon and silhouette: scouts run far, shocktroopers fight up close, lancers take on tanks, engineers repair and resupply. The book that frames the campaign presents each battle as a chapter, so rules arrive alongside story.',
    fair: 'Cover is readable: sandbags and buildings protect you, tall grass hides you, and crouching steadies your aim. Classes counter each other in a triangle (infantry beat lancers, lancers beat tanks, tanks beat infantry), so being shot is usually a consequence of where you chose to run. A fallen ally can be rescued before the enemy reaches them.',
    escalate: 'Missions grow from village skirmishes to fortified lines, enemy tanks, the Valkyria Selvaria and a vast land battleship, and captured points open new routes for reinforcements, so a few rules face longer, harder maps.',
    copies: 'The hybrid works only because moving is dangerous. Remove interception fire or line of sight, and real-time movement becomes a slower way to click a tile. Scoring missions by turn count alone also bends it: players learned to rush one fast scout to the enemy camp and skip the tactics.',
    prototype: 'Grey-box a small courtyard with two pieces of cover and one enemy turret that fires at anything in its sight. Give the player three points per turn; each point lets one unit run in real time until a movement bar empties, then take one aimed shot. Watch whether players plan routes around the turret’s sight lines.'
  },
  lens: {
    gameplay: { primary:true,
      did: 'BLiTZ joins a strategic layer (spend command points on an overhead map) to a real-time layer (run one soldier under fire, then aim by hand).',
      moment: 'Action Mode with the Edelweiss tank on a village street: the gauge at the bottom is the movement left this turn, and the marker below the windmill is an enemy already in sight.',
      why: 'The strategy stays discrete, so the player can plan, while carrying it out is physical, so a plan can be ruined by a careless run; every move feels personal.',
      steal: 'Keep the decision turn-based and make carrying it out a short, skilful action with a clear budget.',
      trap: 'Letting scoring reward one exploit; ranking by turn count taught players to rush a scout and ignore the rest of the system.',
      topics: ['mechanics-and-rules', 'risk-reward'] },
    ui: { primary:true,
      did: 'Book Mode presents the whole campaign as a book: chapters, battles and records are pages and tabs.',
      moment: 'A character profile: the soldier’s 3D model on the left page, a biography on the right, tabs along the edges.',
      why: 'The book makes the menus part of the story and gives every squad member a history, which raises the cost of losing one.',
      steal: 'Let the menu be an object that fits the story’s framing.',
      trap: 'Menus so decorative that finding things is slow; the tabs keep every section one press away.',
      topics: ['ux-as-design'] },
    art: { primary:true,
      did: 'Sega’s in-house CANVAS engine renders 3D scenes to look like a watercolour painting in motion, with sketched edges that fade out at the frame.',
      moment: 'Aiming in Target Mode: the painted scene dissolves into pencil lines at the edges of the screen, so the frame itself looks like an illustration.',
      why: 'The painterly look sets the game apart from realistic war games, and the director has said that softening environmental realism let the characters’ emotion come through.',
      steal: 'Choose a rendering style that carries the tone you want, and push it into the frame and the UI, not only the models.',
      trap: 'A strong style that costs readability; Valkyria keeps allies blue and enemies red so the painting never hides who is who.',
      topics: ['visual-language'] },
    sound: { text: 'Hitoshi Sakimoto’s score uses taiko drums played like a marching band and heavy brass for the military, was steered toward Welkin and Alicia’s romance, and has several tracks played by a live orchestra.' },
    lore: { text: 'In an alternate 1930s Europe, the Empire invades neutral Gallia for its ragnite; Welkin Gunther’s Squad 7 fights back and uncovers the truth about the Valkyria and the persecuted Darcsen people.' },
    world: { text: 'Gallia draws on the Netherlands, and the Empire and the Federation on 1930s Germany and Britain, so a fictional war carries real-world weight.' },
    env: { text: 'Battles echo real Second World War settings (forest fighting, an amphibious landing, a fortified line), while the story itself is told in Book Mode rather than through the spaces.' },
    business: { text: 'A premium PlayStation 3 game in 2008 with paid extra missions; a 2014 PC port and a 2016 remaster bundle that content, and a Switch version followed in 2018.' },
    replay: { text: 'New Game Plus keeps class levels and weapons and opens harder skirmishes; a Hard EX mode adds tougher battles.' },
    lineage: { text: 'Its producer credited his work on Sakura Wars (tactics) and Nightshade (action); the prototype was a traditional overhead tactics game before real-time movement was added, and BLiTZ carried on through the PSP sequels and Valkyria Chronicles 4.' }
  },
  shots: [
    { img:'assets/games/shots/valkyria-chronicles-action.webp', lens:'gameplay', alt:'Valkyria Chronicles: the Edelweiss tank in Action Mode on a village street, with a windmill ahead and unit panels in the corners.', caption:'Action Mode: you drive this unit yourself until the gauge runs out, and enemies in sight fire while you move.',
      callouts:[{ x:0.41, y:0.91, t:'The gauge: movement left for this unit this turn' }, { x:0.51, y:0.35, t:'The target ahead' }, { x:0.30, y:0.12, t:'The marked enemy: its class and health' }, { x:0.70, y:0.80, t:'Your unit: the Edelweiss tank, its hull and tread health and shells left' }] },
    { img:'assets/games/shots/valkyria-chronicles-aim.webp', lens:'art', alt:'Valkyria Chronicles: aiming over a soldier’s shoulder; the edges of the screen fade into pencil sketch lines.', caption:'The painted scene fades into sketch lines at the edges of the frame.' },
    { img:'assets/games/shots/valkyria-chronicles-book.webp', lens:'ui', alt:'Valkyria Chronicles: Book Mode showing Welkin Gunther’s profile, his model on the left page and a biography on the right.', caption:'Book Mode: every soldier has a page, and the campaign’s sections are tabs.',
      callouts:[{ x:0.10, y:0.28, t:'Tabs: each section of the campaign is part of the book' }, { x:0.67, y:0.35, t:'A profile: every squad member has a history' }] }
  ]
});
