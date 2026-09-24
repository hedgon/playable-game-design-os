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
  topics:['platform-access','certification-and-review','store-presence','release-and-updates']
});

PLATFORM('nintendo', { t:'Nintendo Switch', kind:'console', sub:'Switch and Switch 2',
  short:'Register free, sign the NDA, apply for Switch access, then build, rate and pass Nintendo\'s review. Almost everything technical is under NDA.',
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
        { claim:'CERO (Japan) is not among IARC\'s rating authorities.', asOf:CHECKED, src:'https://globalratings.com/participants/' }] },
    store:{ points:['You set the price and release date on the Nintendo eShop.','Store assets, payouts and the revenue share are in the agreements, not public.'] },
    release:{ points:['Patches, DLC and price promotions are submitted through the portal after launch.'] }
  },
  flow:{ kind:'flow', title:'Nintendo Switch, from sign-up to release',
    steps:[{id:'reg', t:'Register and sign the NDA', d:'free, individuals accepted'},{id:'apply', t:'Apply for Switch access', d:'a separate application'},{id:'dev', t:'Develop with the SDK', d:'kits and rules under NDA'},{id:'agree', t:'Publishing agreement', d:'before release'},{id:'rate', t:'Age ratings', d:'IARC, plus CERO for Japan'},{id:'review', t:'Nintendo review', d:'Lotcheck'},{id:'eshop', t:'eShop release', d:'your price and date'}],
    edges:[['reg','apply'],['apply','dev'],['dev','agree'],['agree','rate'],['rate','review'],['review','eshop']] },
  topics:['platform-access','platform-requirements','certification-and-review','ratings-and-disclosures']
});

PLATFORM('playstation', { t:'PlayStation', kind:'console', sub:'PS5',
  short:'Apply through PlayStation Partners as a registered company, sign the agreements, then build to Sony\'s requirements and pass its testing.',
  glance:['Registered company; NDA','Sony testing (TRC)','Under NDA'],
  nda:'The SDK, DevNet, dev kits, the Technical Requirements Checklist (TRC), testing timings, store specifications and revenue share are under NDA.',
  stages:{
    access:{ points:['Apply through PlayStation Partners. The form asks where your company or institution is registered.','Accepted partners sign agreements under NDA before they see the SDK.'],
      facts:[{ claim:'PlayStation Partners registration asks where the applicant\'s company or institution is registered.', asOf:CHECKED, src:'https://register.playstation.net/' },
        { claim:'In 2022 Sony offered newly registered partners with an accepted concept one dev kit and one test kit on loan; check with your partner contact that this still applies.', asOf:CHECKED, src:'https://sonyinteractive.com/en/news/blog/complimentary-development-hardware/' }] },
    build:{ points:['The SDK, DevNet documentation and PS5 kits come after approval, under NDA.','Unity and Unreal console support need proof of approval from Sony; Godot goes through middleware or a porting studio.','Trophies, saves, activities and accessibility rules are in the TRC.'],
      facts:[{ claim:'Unreal Engine\'s PS5 support is available after you confirm approved PlayStation 5 developer status with Epic.', asOf:CHECKED, src:'https://dev.epicgames.com/documentation/en-us/unreal-engine/development-for-playstation-5-in-unreal-engine' }] },
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
    access:{ points:['For console games with Xbox services, apply to ID@Xbox: be 18 or older, sign an NDA, and be in a country Microsoft works with.','Without Xbox services, the Xbox Creators program publishes to console.','PC games can go on the Microsoft Store directly.'],
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
    store:{ points:['You can reserve a store name up to three months before publishing.','Game Pass deals are made through your Microsoft contacts.','The console store\'s revenue share is not public.'],
      facts:[{ claim:'The Microsoft Store (PC) fee for games sold through Microsoft\'s commerce is 12%.', asOf:CHECKED, src:'https://learn.microsoft.com/en-us/windows/apps/publish/get-started' }] },
    release:{ points:['After a pass, the game is released from certification and your Microsoft contact coordinates release.','Game Preview is Xbox\'s early access and shows a notice at launch; saves must survive updates.'] }
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
    build:{ points:['Upload an Android App Bundle that targets the API level Google currently requires.','Native code, which Unity, Unreal and Godot builds contain, must support 16 KB memory pages in apps targeting Android 15 or later.','Crash and freeze rates above Google\'s thresholds can lower your visibility.'],
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
      facts:[{ claim:'Apple\'s age ratings are 4+, 9+, 13+, 16+ and 18+; developers had to answer the new rating questions by 31 January 2026.', asOf:CHECKED, src:'https://developer.apple.com/news/?id=ks775ehf' },
        { claim:'Guideline 3.1.1 requires apps with loot boxes to disclose the odds of each item type before purchase.', asOf:CHECKED, src:'https://developer.apple.com/app-store/review/guidelines/' }] },
    store:{ points:['Pre-orders can open from 2 to 180 days before release.','Payment needs the Paid Apps Agreement, bank and tax details.'],
      facts:[{ claim:'Members of Apple\'s Small Business Program (no more than $1 million in proceeds in the prior calendar year, or new to the App Store; enrolment required) pay 15% on paid apps and in-app purchases, instead of the standard 30%.', asOf:CHECKED, src:'https://developer.apple.com/app-store/small-business-program/' },
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
      facts:[{ claim:'From 2026 developers keep 100% of the first $1 million of net revenue per product per year, then 88%, on purchases made with Epic\'s payments.', asOf:CHECKED, src:'https://store.epicgames.com/en-US/news/epic-games-store-updates-revenue-share-keep-100-of-the-first-1m-per-product-per-year' }] },
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
      facts:[{ claim:'An organisation must verify an admin\'s identity or the business before it can publish or update apps; admin verification with a government ID usually takes minutes.', asOf:CHECKED, src:'https://developers.meta.com/horizon/resources/publish-organization-verification/' }] },
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
    build:{ points:['Upload downloadable builds, or a ZIP with an index.html to play in the browser.','butler, itch.io\'s command-line uploader, sends only what changed between builds.','Check itch.io\'s HTML5 documentation for the current file count and size limits before exporting.'] },
    cert:{ points:['Free pages publish without review. itch.io reviews new sellers before their first paid game shows in search.'] },
    ratings:{ points:['itch.io has no age-rating questionnaire; you mark adult content yourself, and its visibility rules have changed since 2025.'] },
    store:{ points:['The seller sets itch.io\'s share of each sale (open revenue sharing); payouts need tax details.'],
      facts:[{ claim:'itch.io\'s open revenue sharing, launched in 2015, lets sellers set itch.io\'s share, with 10% as the default.', asOf:CHECKED, src:'https://www.gamedeveloper.com/business/itch-io-launches-open-revenue-sharing' }] },
    release:{ points:['Push updates with butler or a new upload; players with the itch.io app get them automatically.'] }
  },
  topics:['platform-choice']
});

// The comparison table on the Platforms page: one row per store or console,
// from each guide's `glance` (access, review gate, typical turnaround).
function platformMatrix(){
  const main = PLATFORMS.filter(p => p.kind !== 'open');
  return { kind: 'matrix', title: 'The platforms at a glance', rows: main.map(p => p.t), cols: ['Access', 'Review gate', 'Turnaround'], cells: main.map(p => p.glance),
    note: 'Console turnaround and terms are under NDA. Check each guide’s dated facts before you plan around a number.' };
}
