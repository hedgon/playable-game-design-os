/* =====================================================================
   WORKED EXAMPLES AND COMPARISONS - SAMPLES
   One sample of each new data kind, so the code paths render and the checks
   have something to read. The content workers replace these with the real
   examples (WORKED) and comparisons (COMPARE); delete a sample once its
   topic or game pair has real content.
   ===================================================================== */

// SAMPLE: replace with real worked examples.
WORKED('economy-modelling-and-balance', {
  kind:'table',
  id:'sink-and-faucet-week',
  t:'One week of a soft currency, faucet against sink',
  intro:'Count what a typical player earns and spends in a week, row by row. If the balance column only rises, the currency will lose its meaning.',
  note:'Illustrative numbers, not from a shipped game.',
  columns:[{h:'Source or sink'}, {h:'Per day', unit:'coins'}, {h:'Days a week', unit:'days'}, {h:'Per week', unit:'coins'}],
  rows:[
    ['Daily quest reward', 300, 7, 2100],
    ['Level clear bonus', 120, 5, 600],
    ['Upgrade purchases', -450, 6, -2700]
  ],
  formulas:[{col:'Per week', f:'Per day x Days a week (in a sheet: =B2*C2). Spending is negative.'}],
  try:['What is the net change over the week, and is it healthy for a player who plays every day?', 'Which row would you change first to bring the net to about zero, and what would the player notice?'],
  file:'sink-and-faucet-week.csv'
});

// SAMPLE: replace with real comparisons.
COMPARE({
  id:'hades-vs-slay-the-spire-failed-run',
  t:'Making a failed run worth having played',
  problem:'In a roguelike the player loses most runs, so a loss has to leave them with something or they stop playing.',
  games:['hades', 'slay-the-spire'],
  sections:[
    { h:'What a death gives back',
      a:'Hades turns death into a scene. You return to the House of Hades, characters react to what killed you, and each run banks currencies that buy permanent upgrades.',
      b:'Slay the Spire gives back knowledge. A loss adds nothing to your next deck, but you know more about the cards and enemies, and play unlocks more cards and relics over time.' },
    { h:'Where the player feels progress',
      a:'In the numbers and the story. The Mirror of Night makes the next run stronger, and the dialogue moves forward even when the run does not.',
      b:'In the player. The rules stay the same every run, so the only thing that grows is your judgement about what to take and what to skip.' },
    { h:'What each choice risks',
      a:'Permanent upgrades can make a run feel safe once enough are bought, which weakens the tension that made dying matter.',
      b:'With no carried power, an early bad offer can sink a run, and a new player may feel they learned nothing from a quick loss.' }
  ],
  verdict:'Hades pays the player in story and power for every attempt, at the cost of some danger. Slay the Spire keeps every run equally risky, at the cost of a slower reward for new players.',
  principle:'Decide what a loss gives back, power, story or understanding, and make sure it arrives on the first loss, not the tenth.',
  topics:['economy-modelling-and-balance'],
  sources:['https://store.steampowered.com/app/1145360/Hades/', 'https://store.steampowered.com/app/646570/Slay_the_Spire/']
});
