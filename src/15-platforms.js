/* =====================================================================
   PLATFORMS
   How to get a game onto each store, from access to patches. Each guide
   walks the same six stages. `points` are the process, stable for years;
   `facts` are the numbers and rules that change, each with the day it was
   checked and its source (same rules and stale warning as topic facts).
   `nda` says what the platform keeps under NDA, so a thin section is
   explained rather than padded. `glance` feeds the comparison table.
   ===================================================================== */
const PLATFORM_STAGES = [
  ['access', 'Getting access'], ['build', 'Building for it'], ['cert', 'Review and certification'],
  ['ratings', 'Ratings, privacy and legal'], ['store', 'Store page and money'], ['release', 'Release and after']
];
const PLATFORMS = [];
/** @param {string} id @param {any} o */
function PLATFORM(id, o){ o.id = id; PLATFORMS.push(o); }
const CHECKED = '2026-09-24';

PLATFORM('steam', { t:'Steam', kind:'pc', sub:'Windows, Mac, Linux and Steam Deck',
  short:'Open to anyone: pay a fee per game, pass a store page review and a build review, then press Release yourself.',
  glance:['Anyone; $100 per game','Store page, then build','3 to 5 business days each'],
  stages:{
    access:{ points:['Sign up to Steamworks as a person or a company. There is no NDA and no concept approval.','Pay the app fee for each game, then give bank, tax and identity details.','Your first game cannot release until 30 days after its fee is paid.'],
      facts:[{ claim:'The Steam Direct fee is $100 per game, paid back to you once the game earns $1,000 in adjusted gross revenue.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/gettingstarted/appfee' },
        { claim:'A new partner waits 30 days after paying the app fee before the first game can release; tax verification can take 2 to 7 business days.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/gettingstarted/onboarding' }] },
    build:{ points:['Build for Windows, Mac or Linux with any engine. There is no dev kit.','The Steamworks SDK (achievements, cloud saves, Steam Input, Workshop) is optional, but anything the store page promises must work.','Steam Deck compatibility review is optional and grades a game Verified, Playable or Unsupported.'],
      facts:[{ claim:'Steam Deck Verified checks controller input and on-screen glyphs, default settings that run well, no launcher warnings, and text at least 9 pixels tall at 1280 by 800.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/steamdeck/compat' }] },
    cert:{ points:['Two reviews: the store page first, then the build. The page must be approved before the build can be submitted.','The page may show only what is in the game at launch, and screenshots must show gameplay.','The build must start on every system it claims and do what the page advertises. Answer the content survey, including AI-generated content, before review.'],
      facts:[{ claim:'Store page review and build review each typically take 3 to 5 business days; Valve asks for submission at least 7 business days before launch.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/store/review_process' }] },
    ratings:{ points:['Steam does not use IARC. Its content survey produces ratings for several regional boards, with required sections for Germany and Indonesia.','Every partner completes a tax interview; Valve collects and pays VAT and GST in many countries, and store prices include it.'],
      facts:[{ claim:'US tax on US-source income defaults to 30% withholding for non-US partners, reduced where a tax treaty applies.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/finance/taxfaq' }] },
    store:{ points:['Required art: header, small, main and vertical capsules, and at least five gameplay screenshots at 1920 by 1080.','A Coming Soon page collects wishlists, and wishlisters are emailed at launch.','Set a base price and regional prices; discount rules limit how soon after launch or a price change you can discount.'],
      facts:[{ claim:'A new game must be public as Coming Soon for at least two weeks before it can release.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/store/coming_soon' },
        { claim:'Payouts are monthly, once a month\'s sales pass $100, about 30 days after the month ends.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/finance/payments_salesreporting' },
        { claim:'Valve\'s revenue share was reported in 2018 as 30% up to $10 million per game, 25% to $50 million, and 20% above; the agreement itself is not public.', asOf:CHECKED, src:'https://gameinformer.com/2018/11/30/valve-adjusting-revenue-share-for-steams-most-popular-games' },
        { claim:'Players can refund within 14 days of purchase if they have played under 2 hours.', asOf:CHECKED, src:'https://store.steampowered.com/steam_refunds/' }] },
    release:{ points:['An approved game does not release itself: you press Release.','Patches go live when you set a build live on the default branch; test it on a password-protected branch first.','Demos and playtests are separate app entries with their own review. Early Access games must be playable now and promise nothing specific about the future.'],
      facts:[{ claim:'Steam Next Fest runs three times a year; a game needs a public demo and must be unreleased, and can take part only once.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest' }] }
  },
  flow:{ kind:'flow', title:'Steam, from sign-up to release',
    steps:[{id:'account', t:'Steamworks sign-up', d:'person or company'},{id:'fee', t:'Pay the app fee', d:'the 30-day wait starts'},{id:'page', t:'Build the store page', d:'art, text, content survey'},{id:'pagerev', t:'Store page review', d:'3 to 5 business days'},{id:'soon', t:'Coming Soon', d:'at least two weeks of wishlists'},{id:'buildrev', t:'Build review', d:'3 to 5 business days'},{id:'release', t:'Press Release', d:'nothing happens until you do'}],
    edges:[['account','fee'],['fee','page'],['page','pagerev'],['pagerev','soon'],['pagerev','buildrev'],['soon','release'],['buildrev','release']] },
  topics:['launch-and-discoverability','live-operations']
});


// The comparison table on the Platforms page: one row per store or console,
// from each guide's `glance` (access, review gate, typical turnaround).
function platformMatrix(){
  const main = PLATFORMS.filter(p => p.kind !== 'open');
  return { kind: 'matrix', title: 'The platforms at a glance', rows: main.map(p => p.t), cols: ['Access', 'Review gate', 'Turnaround'], cells: main.map(p => p.glance),
    note: 'Console turnaround and terms are under NDA. Check each guide’s dated facts before you plan around a number.' };
}
