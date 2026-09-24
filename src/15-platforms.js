/* =====================================================================
   PLATFORMS
   How to get a game onto each store, from access to patches. Each guide
   walks the same six stages. `points` are the process, stable for years;
   `facts` are the numbers and rules that change, each with the day it was
   checked and its source (same rules and stale warning as topic facts).
   `nda` says what the platform keeps under NDA, so a thin section is
   explained rather than padded. `glance` feeds the comparison table.
   A UGC platform (kind 'ugc') is engine, hosting and economy in one, so
   its guide walks seven stages of its own and stays out of the table.
   Any stage can carry a `diagram`, drawn above its points.
   ===================================================================== */
const PLATFORM_STAGES = [
  ['access', 'Getting access'], ['build', 'Building for it'], ['cert', 'Review and certification'],
  ['ratings', 'Ratings, privacy and legal'], ['store', 'Store page and money'], ['release', 'Release and after']
];
const UGC_STAGES = [
  ['access', 'Getting started'], ['architecture', 'How a game runs'], ['tools', 'The editor and the language'],
  ['rules', 'Rules, safety and moderation'], ['money', 'Making money'], ['publish', 'Publishing and updates'], ['marketing', 'Marketing and discovery']
];
/** @param {{kind:string}} p */
const stagesOf = p => p.kind === 'ugc' ? UGC_STAGES : PLATFORM_STAGES;
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
        { claim:'Payouts are monthly, once a month’s sales pass $100, about 30 days after the month ends.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/finance/payments_salesreporting' },
        { claim:'Valve’s revenue share was reported in 2018 as 30% up to $10 million per game, 25% to $50 million, and 20% above; the agreement itself is not public.', asOf:CHECKED, src:'https://gameinformer.com/2018/11/30/valve-adjusting-revenue-share-for-steams-most-popular-games' },
        { claim:'Players can refund within 14 days of purchase if they have played under 2 hours.', asOf:CHECKED, src:'https://store.steampowered.com/steam_refunds/' }] },
    release:{ points:['An approved game does not release itself: you press Release.','Patches go live when you set a build live on the default branch; test it on a password-protected branch first.','Demos and playtests are separate app entries with their own review. Early Access games must be playable now and promise nothing specific about the future.'],
      facts:[{ claim:'Steam Next Fest runs three times a year; a game needs a public demo and must be unreleased, and can take part only once.', asOf:CHECKED, src:'https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest' }] }
  },
  flow:{ kind:'flow', title:'Steam, from sign-up to release',
    steps:[{id:'account', t:'Steamworks sign-up', d:'person or company'},{id:'fee', t:'Pay the app fee', d:'the 30-day wait starts'},{id:'page', t:'Build the store page', d:'art, text, content survey'},{id:'pagerev', t:'Store page review', d:'3 to 5 business days'},{id:'soon', t:'Coming Soon', d:'at least two weeks of wishlists'},{id:'buildrev', t:'Build review', d:'3 to 5 business days'},{id:'release', t:'Press Release', d:'nothing happens until you do'}],
    edges:[['account','fee'],['fee','page'],['page','pagerev'],['pagerev','soon'],['pagerev','buildrev'],['soon','release'],['buildrev','release']] },
  topics:['platform-access','certification-and-review','store-presence','release-and-updates']
});

PLATFORM('nintendo', { t:'Nintendo Switch', kind:'console', sub:'Switch and Switch 2',
  short:'Register free, sign the NDA, apply for Switch access, then build, rate and pass Nintendo’s review. Almost everything technical is under NDA.',
  glance:['Free portal; NDA and approval','Nintendo review (Lotcheck)','Under NDA'],
  nda:'The SDK, dev kits, technical requirements, review checklist, timings, store specifications and revenue share are all under NDA. The partner portal covers them after you sign.',
  stages:{
    access:{ points:['Register free on the Nintendo Developer Portal, even as an individual, and accept the NDA.','Apply separately for access to Nintendo Switch development information.','Sign a publishing agreement before release.'],
      facts:[{ claim:'The Nintendo Developer Portal accepts individual developers; access to Switch information needs a separate application after registration.', asOf:CHECKED, src:'https://developer.nintendo.com/the-process' },
        { claim:'The portal states that Nintendo is not currently accepting requests for access to the Switch 2 development environment.', asOf:CHECKED, src:'https://developer.nintendo.com/web/development/home/developing-for-switch2' }] },
    build:{ points:['The SDK, dev kit hardware and technical requirements arrive only after approval.','Unity is listed as supported middleware. Unreal gives console source only after you prove approval.','Godot has no official console export: use middleware (such as W4 Games or RAWRLAB) or a porting studio, and still register with Nintendo.'],
      facts:[{ claim:'The Godot project states that console export needs third-party middleware or a porting company, because console SDKs are under NDA.', asOf:CHECKED, src:'https://godotengine.org/consoles/' }] },
    cert:{ points:['Nintendo reviews every product before release (often called Lotcheck) against its guidelines.','Keep the guidelines in mind from the start, and ask the portal team early about anything unusual.'] },
    ratings:{ points:['Digital releases are rated through IARC. Japan needs a CERO rating directly, and boxed releases need ratings from each board.'],
      facts:[{ claim:'IARC lists Nintendo among its storefronts.', asOf:CHECKED, src:'https://globalratings.com/storefronts/' },
        { claim:'CERO (Japan) is not among IARC’s rating authorities.', asOf:CHECKED, src:'https://globalratings.com/participants/' }] },
    store:{ points:['You set the price and release date on the Nintendo eShop.','Store assets, payouts and the revenue share are in the agreements, not public.'] },
    release:{ points:['Patches, DLC and price promotions are submitted through the portal after launch.'] }
  },
  flow:{ kind:'flow', title:'Nintendo Switch, from sign-up to release',
    steps:[{id:'reg', t:'Register and sign the NDA', d:'free, individuals accepted'},{id:'apply', t:'Apply for Switch access', d:'a separate application'},{id:'dev', t:'Develop with the SDK', d:'kits and rules under NDA'},{id:'agree', t:'Publishing agreement', d:'before release'},{id:'rate', t:'Age ratings', d:'IARC, plus CERO for Japan'},{id:'review', t:'Nintendo review', d:'Lotcheck'},{id:'eshop', t:'eShop release', d:'your price and date'}],
    edges:[['reg','apply'],['apply','dev'],['dev','agree'],['agree','rate'],['rate','review'],['review','eshop']] },
  topics:['platform-access','platform-requirements','certification-and-review','ratings-and-disclosures']
});

PLATFORM('playstation', { t:'PlayStation', kind:'console', sub:'PS5',
  short:'Apply through PlayStation Partners as a registered company, sign the agreements, then build to Sony’s requirements and pass its testing.',
  glance:['Registered company; NDA','Sony testing (TRC)','Under NDA'],
  nda:'The SDK, DevNet, dev kits, the Technical Requirements Checklist (TRC), testing timings, store specifications and revenue share are under NDA.',
  stages:{
    access:{ points:['Apply through PlayStation Partners. The form asks where your company or institution is registered.','Accepted partners sign agreements under NDA before they see the SDK.'],
      facts:[{ claim:'PlayStation Partners registration asks where the applicant’s company or institution is registered.', asOf:CHECKED, src:'https://register.playstation.net/' },
        { claim:'In 2022 Sony offered newly registered partners with an accepted concept one dev kit and one test kit on loan; check with your partner contact that this still applies.', asOf:CHECKED, src:'https://sonyinteractive.com/en/news/blog/complimentary-development-hardware/' }] },
    build:{ points:['The SDK, DevNet documentation and PS5 kits come after approval, under NDA.','Unity and Unreal console support need proof of approval from Sony; Godot goes through middleware or a porting studio.','Trophies, saves, activities and accessibility rules are in the TRC.'],
      facts:[{ claim:'Unreal Engine’s PS5 support is available after you confirm approved PlayStation 5 developer status with Epic.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/development-for-playstation-5-in-unreal-engine' }] },
    cert:{ points:['Sony tests every submission against the TRC before release.','Plan for resubmission: a failed item means another round of testing.'] },
    ratings:{ points:['Digital releases are rated through IARC; Japan needs CERO directly, and boxed releases need ratings from each board.'],
      facts:[{ claim:'IARC lists PlayStation among its storefronts.', asOf:CHECKED, src:'https://globalratings.com/storefronts/' }] },
    store:{ points:['Self-publishing on PlayStation Store means you own the IP and pick the date.','The revenue share and store specifications are in the agreements, not public.'] },
    release:{ points:['Patch and day-one patch rules are under NDA; plan them with your partner contact.'] }
  },
  flow:{ kind:'flow', title:'PlayStation, from application to release',
    steps:[{id:'apply', t:'Apply to PlayStation Partners', d:'as a registered company'},{id:'nda', t:'Agreements and NDA', d:'before the SDK'},{id:'kits', t:'SDK and dev kits', d:'DevNet access'},{id:'dev', t:'Build to the TRC', d:'trophies, saves, accessibility'},{id:'test', t:'Submission and testing', d:'against the TRC'},{id:'store', t:'PlayStation Store release', d:'you pick the date'}],
    edges:[['apply','nda'],['nda','kits'],['kits','dev'],['dev','test'],['test','store']] },
  topics:['platform-access','platform-requirements','certification-and-review']
});

PLATFORM('xbox', { t:'Xbox and Microsoft Store', kind:'console', sub:'Xbox Series X|S, PC Game Pass, Microsoft Store',
  short:'Console games using Xbox services go through ID@Xbox. Xbox publishes its requirements and certification times; PC games can use the Microsoft Store directly.',
  glance:['ID@Xbox (NDA); PC store free','Every build certified','4 business days, 2 for updates'],
  nda:'The console SDK details and Xbox-specific graphics APIs are under NDA. The Xbox Requirements and certification times are public.',
  stages:{
    access:{ points:['For console games with Xbox services, apply to ID@Xbox: be 18 or older, sign an NDA, and be in a country Microsoft works with.','The older Xbox Creators Program published UWP games with a limited set of Xbox services (sign-in and leaderboards, no achievements or online multiplayer); UWP is no longer developed, so confirm with Microsoft before planning on it.','PC games can go on the Microsoft Store directly.'],
      facts:[{ claim:'ID@Xbox requires members to be 18 or older, to sign an NDA and to be in a country where Microsoft can do business.', asOf:CHECKED, src:'https://developer.microsoft.com/en-us/games/publish/' },
        { claim:'The Microsoft Store developer registration no longer charges a fee under the new onboarding.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/windows/apps/publish/get-started' }] },
    build:{ points:['The public GDK covers PC Game Pass and cloud; console tools need onboarding as a partner with a Microsoft Entra ID tenant.','Read the Xbox Requirements (XRs) before designing saves, achievements and suspend and resume: they are public.'],
      facts:[{ claim:'Xbox Requirements version 16.4 is dated 8 September 2026.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/console/certification-requirements' },
        { claim:'Console games must ship with 10 to 100 achievements worth 1,000 gamerscore at launch, and must treat Series X and Series S equally.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/console/certification-requirements' },
        { claim:'Secure GDK downloads need an organisation onboarded as an Xbox partner; personal Microsoft accounts are no longer supported.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/gdk-dev/development-downloads/access-resources' }] },
    cert:{ points:['Every submission goes through certification, updates included: submission checks, build verification tests, then XR testing.','Blocking failures come back as Conditions for Resubmission; exceptions to an XR are agreed with your Microsoft contacts before you submit.'],
      facts:[{ claim:'Certification targets 4 business days for a base digital game, 2 for a content update and 5 for a disc submission.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/gaming/game-publishing/concepts/certification/certification-guide' }] },
    ratings:{ points:['Every product needs an IARC questionnaire, even with board certificates; boxed releases need long-form ratings from each board.','Paid random items must show their odds before purchase.'],
      facts:[{ claim:'Microsoft Store policy 10.8.4 requires the odds of each item in a paid random reward to be shown before purchase.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/windows/apps/publish/store-policies' }] },
    store:{ points:['You can reserve a store name up to three months before publishing.','Game Pass deals are made through your Microsoft contacts.','The console store’s revenue share is not public.'],
      facts:[{ claim:'The Microsoft Store (PC) fee for games sold through Microsoft’s commerce is 12%.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/windows/apps/publish/get-started' }] },
    release:{ points:['After a pass, the game is released from certification and your Microsoft contact coordinates release.','Game Preview is Xbox’s early access and shows a notice at launch; saves must survive updates.'] }
  },
  flow:{ kind:'flow', title:'Xbox, from ID@Xbox to release',
    steps:[{id:'idx', t:'Join ID@Xbox', d:'18+, NDA, supported country'},{id:'gdk', t:'GDK and Partner Center', d:'an Entra ID tenant'},{id:'xr', t:'Build to the XRs', d:'public requirements'},{id:'sub', t:'Submit for certification', d:'4 business days'},{id:'rel', t:'Release', d:'with your Microsoft contact'}],
    edges:[['idx','gdk'],['gdk','xr'],['xr','sub'],['sub','rel']] },
  topics:['platform-access','platform-requirements','certification-and-review','ratings-and-disclosures']
});

PLATFORM('google-play', { t:'Google Play', kind:'mobile', sub:'Android phones and tablets',
  short:'Pay a one-time fee, verify your identity, run a closed test if you are a new personal account, then fill in the store forms and pass review.',
  glance:['Anyone; $25 once','Review of every release','Up to 7 days'],
  stages:{
    access:{ points:['Register a Play Console account as a person or an organisation, with a one-time fee and identity checks.','New personal accounts must run a closed test before they can publish to production.'],
      facts:[{ claim:'Play Console registration costs $25 once.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/6112435' },
        { claim:'Personal accounts created after 13 November 2023 need a closed test with at least 12 testers opted in for 14 days in a row before applying for production.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/14151465' },
        { claim:'Android developer verification is enforced on certified devices from 30 September 2026 in Brazil, Indonesia, Singapore and Thailand, and worldwide from 2027.', asOf:CHECKED, src:'https://developer.android.com/developer-verification' }] },
    build:{ points:['Upload an Android App Bundle that targets the API level Google currently requires.','Native code, which Unity, Unreal and Godot builds contain, must support 16 KB memory pages in apps targeting Android 15 or later.','Crash and freeze rates above Google’s thresholds can lower your visibility.'],
      facts:[{ claim:'From 31 August 2026 new apps and updates must target Android 16 (API 36); an extension to 1 November 2026 can be requested.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/11926878' },
        { claim:'Android vitals flags a game when user-perceived crashes pass 1.09% or freezes (ANRs) pass 0.47%, averaged over 28 days.', asOf:CHECKED, src:'https://developer.android.com/games/optimize/vitals' }] },
    cert:{ points:['Every release is reviewed. Plan for a week.','Managed publishing lets you decide when an approved release goes live.'],
      facts:[{ claim:'Google says review can take up to seven days, or longer in exceptional cases, for some developer accounts.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/9859751' }] },
    ratings:{ points:['Complete the IARC questionnaire for every app.','Fill in the Data safety form, including data your SDKs collect, and link a privacy policy, even if you collect nothing.','Paid random items must show their odds before purchase.'],
      facts:[{ claim:'The Data safety form is required for every app on closed, open or production tracks, including apps that collect no data.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/10787469' }] },
    store:{ points:['The listing needs an icon, a feature graphic and screenshots; pre-registration can run before launch.','In-app digital goods use Google Play Billing unless a policy exception applies.'],
      facts:[{ claim:'Google announced a new service-fee model on 4 March 2026, taking effect by region between 30 June 2026 and 30 September 2027; until then the rest of the world pays 15% on the first $1 million a year and 30% above.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/112622' },
        { claim:'Pre-registration campaigns can run for up to 90 days.', asOf:CHECKED, src:'https://support.google.com/googleplay/android-developer/answer/9084187' }] },
    release:{ points:['Staged rollouts release an update to a share of users first, so you can stop a bad build.','Vitals thresholds keep applying after launch.'] }
  },
  flow:{ kind:'flow', title:'Google Play, from account to rollout',
    steps:[{id:'acct', t:'Play Console account', d:'$25, identity checks'},{id:'test', t:'Closed test', d:'12 testers, 14 days (new personal accounts)'},{id:'build', t:'App Bundle at target API', d:'16 KB pages for native code'},{id:'forms', t:'Data safety and IARC', d:'privacy policy linked'},{id:'review', t:'Review', d:'plan a week'},{id:'roll', t:'Staged rollout', d:'a share of users first'}],
    edges:[['acct','test'],['test','build'],['test','forms'],['build','review'],['forms','review'],['review','roll']] },
  topics:['platform-access','platform-requirements','ratings-and-disclosures','release-and-updates']
});

PLATFORM('apple', { t:'Apple App Store', kind:'mobile', sub:'iPhone, iPad and Mac',
  short:'Join the Apple Developer Program, build with current Xcode, test on TestFlight, fill in App Store Connect and pass App Review for every version.',
  glance:['$99 a year; company needs D-U-N-S','App Review of every version','90% within 24 hours'],
  stages:{
    access:{ points:['Join the Apple Developer Program as an individual or an organisation. An organisation needs a legal entity and a D-U-N-S number.'],
      facts:[{ claim:'The Apple Developer Program costs $99 per membership year, with fee waivers for eligible nonprofits, schools and government bodies.', asOf:CHECKED, src:'https://developer.apple.com/programs/whats-included/' },
        { claim:'Organisations enrol with a legal entity, a D-U-N-S number, legal binding authority and a public website.', asOf:CHECKED, src:'https://developer.apple.com/programs/enroll/' }] },
    build:{ points:['Build with the Xcode and SDK versions Apple currently requires.','Games with Game Center features need the entitlement and Game Center set up in App Store Connect.','Privacy manifests and signed third-party SDKs feed your privacy labels. Beta testers use TestFlight.'],
      facts:[{ claim:'Since 28 April 2026 apps must be built with Xcode 26 and the iOS 26 SDK or later.', asOf:CHECKED, src:'https://developer.apple.com/news/upcoming-requirements/' },
        { claim:'TestFlight supports up to 100 internal and 10,000 external testers; external builds need beta review.', asOf:CHECKED, src:'https://developer.apple.com/testflight/' }] },
    cert:{ points:['Every version, update included, goes through App Review.','Placeholder content and crashes are rejected, and demos or betas belong on TestFlight, not the store.','Expedited review exists for critical fixes and event-tied releases.'],
      facts:[{ claim:'Apple states that on average 90% of submissions are reviewed in less than 24 hours.', asOf:CHECKED, src:'https://developer.apple.com/distribute/app-review/' }] },
    ratings:{ points:['Apple uses its own age-rating questionnaire, not IARC.','Privacy nutrition labels are required and must include data your SDKs collect.','Paid random items must show their odds before purchase.'],
      facts:[{ claim:'Apple’s age ratings are 4+, 9+, 13+, 16+ and 18+; developers had to answer the new rating questions by 31 January 2026.', asOf:CHECKED, src:'https://developer.apple.com/news/?id=ks775ehf' },
        { claim:'Guideline 3.1.1 requires apps with loot boxes to disclose the odds of each item type before purchase.', asOf:CHECKED, src:'https://developer.apple.com/app-store/review/guidelines/' }] },
    store:{ points:['Pre-orders can open from 2 to 180 days before release.','Payment needs the Paid Apps Agreement, bank and tax details.'],
      facts:[{ claim:'Members of Apple’s Small Business Program (no more than $1 million in proceeds in the prior calendar year, or new to the App Store; enrolment required) pay 15% on paid apps and in-app purchases, instead of the standard 30%.', asOf:CHECKED, src:'https://developer.apple.com/app-store/small-business-program/' },
        { claim:'Since 1 May 2025, apps on the US storefront may link to outside purchase methods.', asOf:CHECKED, src:'https://developer.apple.com/news/?id=9txfddzf' }] },
    release:{ points:['Release manually or automatically after approval.','Phased release rolls an update out over seven days and can be paused.'],
      facts:[{ claim:'Phased release goes 1%, 2%, 5%, 10%, 20%, 50% and 100% of users who have automatic updates on, over seven days, and can be paused for up to 30 days in total.', asOf:CHECKED, src:'https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases' }] }
  },
  flow:{ kind:'flow', title:'Apple App Store, from enrolment to release',
    steps:[{id:'enrol', t:'Developer Program', d:'$99 a year'},{id:'build', t:'Build with current Xcode', d:'Game Center, privacy manifest'},{id:'tf', t:'TestFlight beta', d:'up to 10,000 testers'},{id:'asc', t:'App Store Connect', d:'listing, privacy, age rating'},{id:'review', t:'App Review', d:'most within 24 hours'},{id:'rel', t:'Release', d:'phased, if you like'}],
    edges:[['enrol','build'],['build','tf'],['build','asc'],['tf','review'],['asc','review'],['review','rel']] },
  topics:['platform-access','platform-requirements','ratings-and-disclosures','release-and-updates']
});

PLATFORM('epic', { t:'Epic Games Store', kind:'open', sub:'PC',
  short:'Self-service publishing with a recoupable fee; you keep all revenue up to a threshold each year.',
  glance:['Anyone; $100 per game','Store review','Not published'],
  stages:{
    access:{ points:['Publish through the Epic Developer Portal; each game pays a submission fee that is paid back later.'],
      facts:[{ claim:'Epic charges a recoupable $100 submission fee per game.', asOf:CHECKED, src:'https://store.epicgames.com/en-US/distribution' }] },
    build:{ points:['Multiplayer games must support crossplay across PC stores; games with achievements on other PC stores must offer them on Epic too.'] },
    cert:{ points:['Epic reviews the product and its store page before release.'] },
    ratings:{ points:['IARC ratings are available in the Developer Portal.'] },
    store:{ points:['Developers keep 100% of the first $1 million of net revenue per product each year, then 88%.'],
      facts:[{ claim:'Since June 2025 developers keep 100% of the first $1 million of net revenue per product each year (the allowance resets on 1 January), then 88%, on purchases made with Epic’s payments.', asOf:CHECKED, src:'https://store.epicgames.com/en-US/news/epic-games-store-updates-revenue-share-keep-100-of-the-first-1m-per-product-per-year' }] },
    release:{ points:['Updates are published through the Developer Portal.'] }
  },
  topics:['store-presence']
});

PLATFORM('web', { t:'Web and browser portals', kind:'open', sub:'HTML5 and WebGL',
  short:'Your own site has no gatekeeper; portals such as CrazyGames and Poki bring players in exchange for their rules and a revenue split.',
  glance:['Anyone','Portal QA, or none','Varies'],
  stages:{
    access:{ points:['Self-hosting needs no approval: you handle payments, privacy law and hosting yourself.','CrazyGames takes submissions from anyone; Poki works by application.'] },
    build:{ points:['Export HTML5 or WebGL and keep the download small: portals set size and file limits.'],
      facts:[{ claim:'CrazyGames limits a game to a 50 MB initial download, 250 MB in total and 1,500 files.', asOf:CHECKED, src:'https://docs.crazygames.com/requirements/intro/' }] },
    cert:{ points:['Portals run their own QA; a full launch on CrazyGames needs its SDK and must land the player straight in gameplay.'] },
    ratings:{ points:['Portals set their own content rules; CrazyGames asks for PEGI 12 compliance for a full launch.'] },
    store:{ points:['Portals pay a share of ad and purchase revenue; terms vary by portal and are agreed on joining.'] },
    release:{ points:['Updates are uploaded to the portal or your own host.'] }
  },
  topics:['platform-choice']
});

PLATFORM('quest', { t:'Meta Quest', kind:'open', sub:'Meta Horizon Store (VR)',
  short:'One public store with technical checks rather than taste: verify your organisation, pass the VR checks and review, then updates ship without review.',
  glance:['Verified organisation','Store review against the VRCs','Plan 2 weeks or more'],
  stages:{
    access:{ points:['Sign up on the Meta developer site, create an organisation (a team) and verify an admin or the business before publishing.','Headsets need a developer team and a verified account to enter developer mode.'],
      facts:[{ claim:'An organisation must verify an admin’s identity or the business before it can publish or update apps; admin verification with a government ID usually takes minutes.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/publish-organization-verification/' }] },
    build:{ points:['OpenXR is the recommended path in Unity, Unreal and Godot; Godot adds Meta features through the official OpenXR Vendors plugin.','Every uploaded build, test channels included, must meet the release packaging rules.'],
      facts:[{ claim:'Apps created after 1 March 2026 must target Android 14 (API 34).', asOf:CHECKED, src:'https://developers.meta.com/horizon/blog/meta-quest-apps-android-14-march-1/' },
        { claim:'Immersive apps must keep rendering at 60 fps or more at an allowed refresh rate.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/vrc-quest-performance-1/' },
        { claim:'Immersive apps must run 45 minutes without crashing or freezing.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/vrc-quest-functional-1/' }] },
    cert:{ points:['Only the production channel is reviewed; alpha, beta and release-candidate channels let testers in without review.','Review checks technical, content and privacy requirements (the VRCs), not subjective quality.'],
      facts:[{ claim:'Meta asks developers to submit for review at least two weeks ahead of launch.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/publish-submit/' }] },
    ratings:{ points:['Every app completes the IARC questionnaire and self-certifies its age group; apps for younger users carry extra requirements.'],
      facts:[{ claim:'Age-group self-certification is required for every app on each submission or update: teens and adults, mixed ages, or children.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/age-groups/' }] },
    store:{ points:['Store art covers hero, covers, icon, five screenshots of real content and a trailer.','A Coming Soon page can go up well before launch and collects wishlists; pre-orders are supported.'],
      facts:[{ claim:'Meta keeps 30% of net revenue; for subscriptions its share drops to 15% from the fourth month.', asOf:CHECKED, src:'https://developers.meta.com/horizon/policy/developer-distribution-agreement/' }] },
    release:{ points:['A newly published app can carry the Early Access label; switching it off cannot be undone.','After launch, a new build in the production channel ships without review; store page changes are reviewed.'],
      facts:[{ claim:'After launch, builds uploaded to production update immediately without review, and metadata changes usually take 1 to 2 business days.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/publish-after-sub/' }] }
  },
  topics:['platform-choice']
});

PLATFORM('itch', { t:'itch.io', kind:'open', sub:'Downloads and browser games',
  short:'Anyone can upload, sell or give away a game, including browser builds, and choose how much itch.io keeps.',
  glance:['Anyone','None for free pages','None'],
  stages:{
    access:{ points:['Any account can create game pages; there are no tiers or approval to upload.'] },
    build:{ points:['Upload downloadable builds, or a ZIP with an index.html to play in the browser.','butler, itch.io’s command-line uploader, sends only what changed between builds.','Check itch.io’s HTML5 documentation for the current file count and size limits before exporting.'] },
    cert:{ points:['Free pages publish without review. itch.io reviews new sellers before their first paid game shows in search.'] },
    ratings:{ points:['itch.io has no age-rating questionnaire; you mark adult content yourself, and since July 2025, under payment-processor pressure, adult pages can be deindexed from browse and search while itch.io reviews them, though they still work by direct link.'] },
    store:{ points:['The seller sets itch.io’s share of each sale (open revenue sharing); payouts need tax details.'],
      facts:[{ claim:'itch.io’s open revenue sharing, launched in 2015, lets sellers set itch.io’s share, with 10% as the default.', asOf:CHECKED, src:'https://www.gamedeveloper.com/business/itch-io-launches-open-revenue-sharing' }] },
    release:{ points:['Push updates with butler or a new upload; players with the itch.io app get them automatically.'] }
  },
  topics:['platform-choice']
});

PLATFORM('roblox', { t:'Roblox', kind:'ugc', sub:'Roblox Studio and Luau; players on phone, PC and console',
  short:'Engine, servers and economy in one: build in Roblox Studio with Luau, publish with a click, and earn Robux you can cash out, once you pass the checks that decide who can see the game.',
  stages:{
    access:{ points:['Anyone can download Roblox Studio and build privately. What is gated is reach: the wider the audience, the more identity Roblox asks of you.','Publishing publicly to players 16 and over needs an account at least two days old, an age check (a face estimate or ID) and the Maturity & Compliance Questionnaire.','Reaching all ages, including under-16s, adds government ID (or a face estimate for creators under 18), two-factor sign-in, a refundable fee or two months of a Roblox subscription, and an evaluation the game must pass.','A group (called a Community in the app) owns games the way a studio would, holds shared revenue and splits payouts. Roblox will not settle disputes inside a group, so agree ownership and splits in writing first.','Team Create adds collaborators after an age check, and pairs age groups by default: an adult can collaborate with players 16 and over only.'],
      facts:[{ claim:'Accounts are split into Roblox Kids (5 to 8), Roblox Select (9 to 15) and Roblox (16 and over); a game runs a trial for age-checked players 16 and over and qualifies for under-16s at 250 unique plays by highly engaged age-checked players within 60 days.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/publishing/kids-and-select' },
        { claim:'The all-ages publishing fee is 1,000 Robux per game, refunded once the game keeps 25 highly engaged players for 60 days without moderation; expedited review costs 50,000 Robux for a 48-hour review, and either fee is forfeited if the game is permanently moderated.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/publishing/publish-games-and-places' },
        { claim:'Creating a group costs 100 Robux.', asOf:CHECKED, src:'https://create.roblox.com/docs/projects/groups' }] },
    architecture:{ diagram:{ kind:'stack', title:'One Roblox game, from the player to the cloud', arrow:'trust only flows down',
        layers:[{t:'Player clients', d:'LocalScripts, UI and input; simulate parts they own'},{t:'Remotes and inputs', d:'RemoteEvents, prompts, touches: every way a client asks'},{t:'Game server', d:'Scripts own the state and check every request'},{t:'Cloud services', d:'DataStores save, MemoryStores match, MessagingService links servers'}] },
      points:['Every Roblox game is multiplayer by default and the server is the authority: it owns the game state and replicates the world, physics and chat to every client.','A change a client makes never reaches the server by itself. Clients reach the server through remotes (RemoteEvent, UnreliableRemoteEvent, RemoteFunction), through inputs the server listens to (Touched, ProximityPrompt, ClickDetector), and through physics on parts they own.','Treat every remote call as hostile: an exploiter can read client scripts, fire remotes at any rate with any arguments, and move their own character. The server checks permission, types, values (reject non-finite numbers with math.isfinite), plausibility and rate, using state it owns.','Unanchored parts near a player are simulated by that player’s client so physics feels responsive, which makes network ownership a trust boundary. Server Authority mode moves movement and physics to the server, with client prediction and rollback.','A game (a universe in the APIs) holds one or more places, which are like scenes; TeleportService moves players between places and servers.','Plan for the low end: most players are on modest phones with 100 to 300 ms of latency, and StreamingEnabled sends each client only the nearby world, so client code must expect parts to be missing.'],
      facts:[{ claim:'Server Authority mode (Workspace.AuthorityMode = Server) makes the server the single source of truth: clients send inputs, predict locally, and roll back when they mispredict.', asOf:CHECKED, src:'https://create.roblox.com/docs/projects/server-authority' },
        { claim:'A DataStore value can hold up to 4,194,304 characters per key, and each server’s default budget is 60 + 40 × players standard reads a minute, and the same for writes.', asOf:CHECKED, src:'https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits' },
        { claim:'MessagingService messages are at most 1 kB, and delivery is best effort, not guaranteed.', asOf:CHECKED, src:'https://create.roblox.com/docs/reference/engine/classes/MessagingService' },
        { claim:'Android is about 65% of a typical game’s players, and about 60% of those devices have 2 to 4 GB of RAM.', asOf:CHECKED, src:'https://create.roblox.com/docs/performance-optimization/test-on-hardware' }] },
    tools:{ points:['Roblox Studio is the editor, the engine and the IDE in one, and it is cloud-first: the place lives on Roblox’s servers, and publishing uploads it.','Code is Luau, a small, fast, gradually typed language derived from Lua 5.1. --!strict on a script’s first line turns on full type checking, and --!native compiles a server script to machine code.','Three script types: a Script runs on the server (or the client, set by RunContext), a LocalScript runs only on a player’s client, and a ModuleScript runs wherever it is required. Keep most code in ModuleScripts: shared ones in ReplicatedStorage, server-only ones in ServerScriptService.','Test multiplayer from day one: Studio’s Server & Clients mode runs a server with several simulated clients, with device and network simulation. Profile with the Script Profiler and the MicroProfiler, and on a real low-end phone.','Team Create edits a place live with others, and Drafts mode lets each scripter commit changes instead. Script Sync mirrors scripts to local files for an outside editor and git; the community tool Rojo syncs the whole project.','Studio includes an AI Assistant that can edit the place, and a built-in MCP server so outside AI coding tools can read and edit scripts in the open session.'],
      facts:[{ claim:'Luau type checking has three modes, set on a script’s first line: --!nocheck, --!nonstrict (the default) and --!strict.', asOf:CHECKED, src:'https://create.roblox.com/docs/luau/type-checking' },
        { claim:'Studio’s Server & Clients test mode simulates up to 8 clients.', asOf:CHECKED, src:'https://create.roblox.com/docs/studio/testing-modes' },
        { claim:'Creator Store sellers price models and plugins in US dollars and keep 100% of net proceeds.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/creator-store' }] },
    rules:{ points:['You declare your content in the Maturity & Compliance Questionnaire, and Roblox limits who can see the game to match. Answer for the most extreme content a player can meet, and retake it whenever an update changes an answer.','Every uploaded image, mesh, sound and video is moderated separately by people and automated systems, and players cannot see it until it passes.','Paid random items must show every outcome with its odds before purchase; where PolicyService reports them restricted for a player, offer a free way to earn the item, a fixed disclosed order, or direct purchase of each outcome instead.','Playable gambling is banned outright, and social hangouts and free-form creation such as drawing carry their own age gates.','The rules themselves are the Community Standards and the Terms of Use; misrepresenting content in the questionnaire is itself moderated.'],
      facts:[{ claim:'Minimal and Mild games can be seen on every account tier, Moderate games by Select and 16-and-over accounts, and Restricted games only by age-verified players 18 and over.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/promotion/content-maturity' },
        { claim:'Paid random item odds must be shown as percentages summing to exactly 100% before purchase, including when the item is bought with a currency or key that was bought with Robux.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/monetization/paid-random-items' }] },
    money:{ points:['Players mostly pay in Robux. Robux other players spend in your game becomes Earned Robux, which the Developer Exchange (DevEx) turns into real money.','The main products: passes (one-off perks), developer products (repeat purchases such as currency), subscriptions, paid access, private servers, and avatar items sold in the game. Rewarded video and immersive ads add ad revenue.','Grant developer products only on the server, in the receipt handler (MarketplaceService.ProcessReceipt, or the newer BindReceiptHandler), and confirm the purchase only after the grant is saved; otherwise Roblox offers the receipt again on the player’s next purchase or next join.','Never hard-code a price: regional pricing, price optimisation and subscriber discounts mean players see different prices, so read them with GetProductInfoAsync.','Creator Rewards pay for bringing engaged spenders and new players to Roblox, in place of the old engagement-based (Premium) payouts.'],
      facts:[{ claim:'Passes pay the creator 70% of the Robux spent.', asOf:CHECKED, src:'https://create.roblox.com/docs/monetize-experiences' },
        { claim:'An avatar item bought inside a game pays 30% to the item’s creator and 40% to the game’s owner.', asOf:CHECKED, src:'https://create.roblox.com/docs/marketplace/marketplace-fees-and-commissions' },
        { claim:'Roblox Plus subscribers get 10% off, rising to 20% from the third month, paid by Roblox rather than the creator; a game earns 250 Robux a month for three months for each new subscriber it signs up.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/monetization/roblox-plus' },
        { claim:'Creator Rewards pay 5 Robux a day for each Active Spender (someone who spent at least $9.99 in the past 60 days) for whom the game is one of their first three of the day and who plays it at least 10 minutes.', asOf:CHECKED, src:'https://create.roblox.com/docs/creator-rewards' },
        { claim:'DevEx pays $0.0038 per Earned Robux for Robux earned from 2025-09-05 (older balances cash out at $0.0035), and needs age 13 or over, at least 30,000 Earned Robux, a verified email and a tax form.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/monetization/developer-exchange' },
        { claim:'From 2026-06-08, a higher DevEx rate of $0.0054 applies to Robux from developer products, passes, subscriptions and private servers bought by US players verified 18 and over, in games where no player character is ever R6.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/monetization/18-plus-devex-rate' }] },
    publish:{ points:['Publishing is two steps: File → Publish to Roblox uploads the place, which starts Private; then you set its audience to Limited (playtesters, friends, community members) or Public once you meet the requirements.','Metadata feeds discovery: keep the name stable, sum up the game in the first sentence with genre words, and never repeat keywords, which gets a game demoted.','Old servers keep running old code after an update. Restart outdated servers from the dashboard, optionally after a delay, and keep saves backward-compatible.','Ship timed content early behind a config and switch it on at release.','Read analytics in Roblox’s own order: day-one retention and session length first, then day 7 and day 30, then payer conversion, and acquisition last. Experiments runs official A/B tests on config values.'],
      facts:[{ claim:'A place file can be at most 100 MB, and at most 5 never-public games can be made public per day.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/publishing/publish-games-and-places' },
        { claim:'A game can show up to 10 thumbnail images or videos at 16:9; videos must show real gameplay, and only 3 video uploads are allowed a month.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/publishing/thumbnails' },
        { claim:'An in-game experiment runs for 14 to 60 days with a control and up to two variants.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/experiments' }] },
    marketing:{ points:['Home recommendations work in two stages: retrieval picks candidates on engagement, retention and monetisation, then ranking orders them for each player.','Signals are averaged per player, not totalled, so a small game with deeply engaged players is not at a disadvantage.','After an update, discovery tests the game on new groups of players and widens distribution if they engage, so a first minute that loses players costs more than a small audience does.','Exposure is cut for giveaway-bait titles, metadata that does not match the game, and games that copy an existing one.','Paid reach comes from Ads Manager, with sponsored placements and search ads paid by card or with Robux converted to ad credits. Events, update notifications and social links bring existing players back.'],
      facts:[{ claim:'Roblox names play-through rate, first-play bounce rate, play days per player and playtime per player (capped at 60 minutes a day) as its most important ranking signals.', asOf:CHECKED, src:'https://create.roblox.com/docs/discovery' },
        { claim:'Ads Manager campaigns aim at Plays, Earnings or Engagement, and Robux converted to ad credits cannot be converted back.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/promotion/ads-manager' },
        { claim:'A game’s social media links are shown only to age-verified players 16 and over, and only such creators can add them.', asOf:CHECKED, src:'https://create.roblox.com/docs/production/promotion/social-media-links' }] }
  },
  flow:{ kind:'flow', title:'Roblox, from Studio to every age group',
    steps:[{id:'build', t:'Build in Studio', d:'private while you work'},{id:'upload', t:'Publish to Roblox', d:'uploads; still Private'},{id:'checks', t:'Age check', d:'and the questionnaire'},{id:'public', t:'Public, 16 and over', d:'set the audience'},{id:'discover', t:'Discovery tests it', d:'per-player engagement'},{id:'trial', t:'All-ages evaluation', d:'ID, 2FA, fee or Plus'},{id:'all', t:'Kids and Select', d:'under-16s can see it'}],
    edges:[['build','upload'],['upload','checks'],['checks','public'],['public','discover'],['public','trial'],['trial','all']] },
  topics:['ugc-platforms','server-authority','server-anticheat','launch-and-discoverability','business-model']
});

PLATFORM('fortnite', { t:'Fortnite (UEFN)', kind:'ugc', sub:'Unreal Editor for Fortnite, Verse and Fortnite Creative',
  short:'Build islands inside Fortnite with Unreal Editor for Fortnite and Verse. Epic hosts everything, reviews every release, and pays from a pool shared out by engagement.',
  stages:{
    access:{ points:['An Epic account is free, and anyone can build, in Fortnite Creative on any Fortnite platform or in UEFN on a Windows PC.','Publishing and payouts need the Fortnite Developer Program, which is for adults only and gives you a creator code.','Teams are set up in the Creator Portal. Projects are versioned with Epic’s Lore, which locks files when they are checked out.'],
      facts:[{ claim:'The Fortnite Developer Program needs age 18 or over, a real-money purchase through Epic Payments or at least $20 spent in Fortnite in the last 365 days, and a creator code of 3 to 16 characters; payouts also need a tax interview and a Hyperwallet account.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/fortnite/fortnite-developer-program' },
        { claim:'Nobody can collaborate on a UEFN project with anyone under 18.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/collaborating-in-unreal-editor-for-fortnite' }] },
    architecture:{ points:['You build inside Fortnite’s runtime: Epic hosts the servers, networking, characters, weapons and the base game, so you work at a higher level than on Roblox.','Gameplay is built from devices, the core building blocks, which talk to each other through events and functions you bind together.','Verse covers what devices cannot: many devices can be controlled from Verse, and you can write your own Verse devices.','Scene Graph is the newer structure of entities, components and prefabs that ties the world together, and it is native to Verse.'],
      facts:[{ claim:'Scene Graph is still labelled Beta, and Epic advises caution when shipping with it.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/scene-graph-in-unreal-editor-for-fortnite' }] },
    tools:{ points:['Fortnite Creative is the in-game sandbox on every Fortnite platform. UEFN is an Unreal-based editor for PC that adds landscape sculpting, lighting and Verse.','Verse is Epic’s language for games. A function can fail only if it has the <decides> effect. Failable expressions, such as array indexing, comparisons and calls to such functions (written with square brackets), run only in a failure context such as if, which rolls back their effects when they fail. Concurrency is part of the language.','Live edit sessions sync changes between UEFN and a running Creative game, so you test inside Fortnite itself.'],
      facts:[{ claim:'UEFN runs on PC only, while Fortnite Creative runs on Switch, Xbox, PlayStation, Android, iOS and PC.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/install-and-launch-fortnite-creative-and-unreal-editor-for-fortnite' }] },
    rules:{ points:['Islands must follow the Fortnite Developer Rules and Epic’s content guidelines. Moderation reviews the metadata and assets first, then the island itself, and a rejection can be appealed.','Common rejections: misleading thumbnails, advertising your creator code inside the island, photos of real people, and profanity.','Every island needs an IARC rating from a questionnaire in the Creator Portal, and Epic pays the licence fee.'],
      facts:[{ claim:'Fortnite caps island ratings at Teen (ESRB) in North America and PEGI 12 in Europe; an island rated above a region’s cap is unavailable there, and one above the cap everywhere cannot be published.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/iarc-overview-and-faqs-in-fortnite-creative' }] },
    money:{ points:['Engagement payouts share out a pool funded by Fortnite’s Item Shop, by how much paying players engage with your island, with extra weight for bringing in new and returning players.','In-island transactions sell items for V-Bucks, defined as Verse entitlements. Paid random items must show their odds, and items that give an advantage must be declared.'],
      facts:[{ claim:'The Engagement Pool receives 40% of eligible net revenue from the Item Shop and related real-money purchases, and payouts are monthly, 30 days after the month ends.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/engagement-payout-in-fortnite-creative' },
        { claim:'Creators receive 50% of the V-Bucks value of in-island sales, raised to 100% from 2026-01-09 through 2027-01-31; V-Bucks value is real-money spend minus platform fees.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/in-island-transactions-overview-in-fortnite' },
        { claim:'In-island items cost 50 to 5,000 V-Bucks in steps of 50, work only in the island where they were bought, and cannot be gifted to another player.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/fortnite/in-island-transactions-overview-in-fortnite' }] },
    publish:{ points:['Publishing from Creative or UEFN creates a private version. Then create a release in the Creator Portal with game details, the IARC questionnaire, media and visibility, and submit it for review.','Releases can be scheduled 1 to 90 days ahead, or held unpublished after approval and published later. An unpublished island keeps its code and can be republished.','Creator Portal analytics show impressions, clicks, playtime and players, filterable by country, platform, party size and source.'],
      facts:[{ claim:'Every island is enrolled in automatic A/B thumbnail testing, which creators can opt out of.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/fortnite/publishing-islands-in-fortnite-creative' }] },
    marketing:{ points:['Engagement drives distribution: several core signals (average playtime, retention, qualified play-through rate) are per player, so deep engagement can outperform a large audience.','New islands are tested in Discover and scored automatically on engagement, retention, social and similarity signals, plus a human check.','Islands whose metadata copies another island are shown less; reusing Verse code and devices does not count as copying.','Paid placement is the Sponsored Row, an auction you bid on from the Creator Portal.'],
      facts:[{ claim:'New islands are tested in Discover for up to two weeks.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/fortnite/how-discover-works-in-fortnite' },
        { claim:'Discover measures average playtime (capped at 120 minutes a session), concurrent players, bounce rate, retention, social play, qualified play-through rate and 7-day unique players.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/fortnite/how-discover-works-in-fortnite' }] }
  },
  flow:{ kind:'flow', title:'Fortnite, from UEFN to Discover',
    steps:[{id:'build', t:'Build the island', d:'UEFN on PC, or Creative'},{id:'program', t:'Developer Program', d:'18 and over, creator code'},{id:'private', t:'Publish Project', d:'a private version'},{id:'release', t:'Create a release', d:'details, IARC, media'},{id:'review', t:'Moderation', d:'metadata, then the island'},{id:'live', t:'Live in Discover', d:'tested for up to two weeks'}],
    edges:[['build','program'],['program','private'],['private','release'],['release','review'],['review','live']] },
  topics:['ugc-platforms','platform-choice','launch-and-discoverability','business-model']
});

// The comparison table on the Platforms page: one row per store or console,
// from each guide's `glance` (access, review gate, typical turnaround).
function platformMatrix(){
  const main = PLATFORMS.filter(p => p.kind !== 'open' && p.kind !== 'ugc');
  return { kind: 'matrix', title: 'The platforms at a glance', rows: main.map(p => p.t), cols: ['Access', 'Review gate', 'Turnaround'], cells: main.map(p => p.glance),
    note: 'Console turnaround and terms are under NDA. Check each guide’s dated facts before you plan around a number.' };
}
