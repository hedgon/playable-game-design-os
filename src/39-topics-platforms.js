/* =====================================================================
   PLATFORMS AND PUBLISHING
   Getting a game onto stores and consoles: choosing platforms, access,
   requirements, certification, ratings and disclosures, store pages and
   money, release and updates. The per-platform detail lives in the guides
   (15-platforms.js); these topics are the principles behind them. Engine
   views are optional here: only topics with real engine work carry them.
   ===================================================================== */
DOMAINS.push({ id:'platforms', lens:'eng', eng:'optional', t:'Platforms and publishing', short:'Choosing platforms, access, requirements, certification, ratings, store pages, release', color:'var(--d-platforms)',
    sum:`Shipping is its own discipline. Every store and console has a door (a programme, an NDA, a fee), a set of rules the build must follow, a review that takes days you do not control, rating and privacy forms, a store page that sells, and release mechanics that differ. This domain teaches the principles; the platform guides give each store’s current rules with dated sources.`,
    links:[['product','Launch, discoverability and the business model meet the store at the store page.'],['infra','Builds, provenance and delivery pipelines feed every submission.'],['management','Review windows and certification belong on the release calendar.'],['production','Certification is a risk to plan, not paperwork at the end.']] });

T('platform-choice',{ d:'platforms', t:'Choosing platforms', tag:'The platform decides your engine, your calendar and your audience before a single feature does.',
  what:`Which platforms to target first, and in what order: PC, mobile, console, web or VR. The choice trades reach against cost, gatekeeping and effort, and it has to fit the audience you already validated rather than the platform that sounds most impressive. It also decides whether one codebase can serve several builds, and whether a platform you cannot reach directly is reachable through a porting partner or middleware instead.`,
  why:[`The platform sets the engine, the budget and the calendar before any feature does: an NDA, a dev kit and a certification queue are commitments made months before a review even starts.`,`Reach and gatekeeping trade off. Open platforms let anyone publish; consoles and curated stores add months of access work in exchange for a bigger or more curious audience.`,`A platform decided late reshapes input, save data and UI scaling, which is exactly the work a design should have budgeted from the start.`,`A platform the team cannot reach directly (a console with no first-party approval) is not automatically closed; middleware and porting partners exist for that gap.`],
  think:{ q:[`Does this platform’s input and session length match the core loop we already validated?`,`Can the team afford the dev kit, the NDA and the certification calendar of this platform before any revenue arrives?`,`What does porting to a second platform cost, in the engine we picked?`,`Is Steam Deck, handheld or a second-screen mode a day-one target, or a later port?`,`If direct access is out of reach, does a porting partner or console middleware close the gap at a cost we can carry?`],
    trade:[`PC first is cheap and open but caps reach on discoverability alone; console and mobile reach more players but gate access behind an NDA and a review queue.`,`One shared codebase saves engineering time and pulls every build down to the platform with the fewest features.`,`Committing to a console early buys a dev kit and support; committing late means designing around SDK limits the team never planned for.`],
    traps:[`Choosing a platform because the name is prestigious, not because the validated audience is there.`,`Treating “we’ll port later” as free instead of as its own scoped task.`,`Designing controls for one input method and assuming touch or gamepad will just work.`,`Skipping the middleware or porting-partner option and concluding a console is simply closed.`],
    good:[`The platform list is scored against the audience already tested, not against ambition.`,`A second export target costs days of adaptation, not months of redesign.`],
    bad:[`The wrong input scheme forces a late redesign right before certification.`,`Nobody can say why this platform is first, only that it seemed obvious.`] },
  how:[`List the realistic platforms and score each on reach, cost, gatekeeping and effort against the audience already validated.`,`Pick PC-first, mobile-first or console-first based on the team’s actual capacity for an NDA, a dev kit and a certification calendar, not the pitch deck.`,`Design the core loop for the primary platform’s input, and scope a second platform’s input as its own port task rather than a checkbox.`,`Where direct console access is out of reach, evaluate a porting partner or console middleware before dropping the platform.`,`Decide whether Steam Deck, Mac and the primary PC target share one export, or need their own preset.`,`Write the export or build matrix (platforms times configurations) before content scales past what it covers.`,`Count creative freedom as part of a platform deal: Monolith Soft became a Nintendo subsidiary in 2007, accepting Nintendo-only development in exchange for the freedom it felt it had lost under Namco Bandai, and went on to make Xenoblade Chronicles.`],
  ai:{ yes:[`Draft a reach, cost and effort comparison table once the platforms are named.`,`Summarize porting-partner and console-middleware options for an engine you name.`,`List the export or build profiles a stated platform matrix implies.`],
       no:[`Decide which platform the studio commits to.`,`Commit money to an NDA, a dev kit or a middleware licence.`] },
  prompts:[{l:'Platform fit',p:`Our game, its core loop and the audience we have validated are: [CONTEXT]. Our team’s size, budget and timeline are: [CONTEXT]. List realistic platforms scored on reach, cost, gatekeeping and effort, recommend an order, and flag any platform that needs a porting partner or middleware to reach at all.`},
    {l:'One codebase, several builds',p:`We are building in [ENGINE] and want to ship on [PLATFORM LIST]. List what one codebase can realistically share across them, what has to become a per-platform export or profile, and the input or save-data differences that would force a redesign if decided late.`}],
  verify:[`Does the platform comparison use the audience already validated, not an assumed one?`,`Does the chosen order account for each platform’s real access cost, not just its install base?`,`Is porting scoped as its own task with an estimate, rather than assumed free?`],
  test:[`Build and run an export or profile for every named platform early, before content is deep, and see what breaks.`,`Hand the primary input scheme to a player on the platform’s native controller or touchscreen and watch where it fails.`],
  rel:[['platform-access','Choosing a platform commits you to its access gate before a build exists.'],['platform-and-session','The platform decides input, session length and pacing before a level is drawn.'],['scope-control','A second platform is scope, and has to be budgeted like any other feature.'],['store-presence','Reach depends on how the platform lets a stranger find the page, not only on its install base.'],['business-model','The platform sets what revenue share and payment rules the model has to work inside.'],['ugc-platforms','Roblox and Fortnite are a platform choice that also picks the engine, the language and the audience.']] });
TECH('platform-choice',[
  {n:'Reach vs gatekeeping matrix', how:`Score each candidate platform on install base, discoverability and how far you can get before anyone has to approve anything.`, fit:`Early in preproduction, before an engine or a budget line is fixed.`, cost:`The figures age fast and need rechecking against current dated facts before they drive a decision.`, alt:`Skip the matrix and pick the single platform the already-validated audience is on.`},
  {n:'One codebase, per-platform export', how:`Build once, then a preset or profile per platform switches features and defines without branching gameplay code.`, fit:`A small team shipping PC plus one adjacent platform such as Steam Deck, Mac or web.`, cost:`Every platform’s feature set caps what “one codebase” can assume; a console-only capability still needs its own branch.`, alt:`Maintain separate platform-specific forks when the platforms diverge too far to share code.`},
  {n:'Porting partner or console middleware', how:`Pay a studio, or a middleware vendor for an engine with no official console export, to carry the platform-specific SDK work.`, fit:`A console the team has no first-party approval for, or a platform outside the team’s expertise.`, cost:`A revenue share or flat fee, plus a dependency on someone else’s schedule and quality bar.`, alt:`Apply directly to the platform holder and build the expertise in house.`}
]);
ENGINE('platform-choice',{
  godot:{ term:`Each export target is its own preset with its own feature tags, and code branches on those tags instead of scattering platform checks through gameplay code.`,
    api:['Export preset custom features','OS.has_feature()','OS.get_name()','Project setting overrides by feature tag (setting.tag)','Input.get_connected_joypads()'],
    snippet:`extends Node

func _ready() -> void:
\t# "steamdeck" is a custom feature added in the Steam Deck export preset
\tif OS.has_feature("steamdeck"):
\t\t_set_ui_scale(1.25)
\telif OS.has_feature("mobile"):
\t\t_set_ui_scale(1.0)
\t\tget_viewport().gui_embed_subwindows = true
\telse:
\t\t_set_ui_scale(1.0)

func _set_ui_scale(s: float) -> void:
\t$CanvasLayer.scale = Vector2(s, s)`,
    pitfall:`Reading OS.get_name() to guess the platform. It reports the operating system, not the export target: a Steam Deck build and a desktop Linux build both report Linux, so a feature tag is the only reliable way to tell them apart.`,
    map:`Godot’s export presets with feature tags are Unity’s Build Profiles with scripting define symbols.` },
  unity:{ term:`A Build Profile is a saved target plus its own scripting define symbols, so switching the active profile switches which conditional blocks compile without touching a setting shared by every platform.`,
    api:['BuildProfile asset','PlayerSettings.GetScriptingDefineSymbols(NamedBuildTarget)','EditorUserBuildSettings.activeBuildTarget','#if UNITY_STANDALONE / UNITY_ANDROID / UNITY_IOS','BuildPipeline.BuildPlayer(BuildPlayerWithProfileOptions)'],
    snippet:`public class PlatformUi : MonoBehaviour {
    void Start() {
#if UNITY_STANDALONE
        SetScale(1f);
#elif UNITY_ANDROID || UNITY_IOS
        SetScale(1.25f);
#endif
    }
    void SetScale(float s) =>
        transform.localScale = Vector3.one * s;
}`,
    pitfall:`Setting a define in Player Settings instead of on the Build Profile. Player Settings defines apply to every profile on that platform, so a define meant for the Steam profile also compiles into the Epic or demo profile, and the mismatch ships silently.`,
    map:`Unity’s Build Profiles with per-profile defines are Godot’s export presets with feature tags.` }});
INTERVIEW('platform-choice',{
  junior:[
    { q:`What does “platform-first” decide besides where the game is sold?`,
      a:`It decides the engine’s export path, the input scheme, session length and the calendar for access and certification. Treat it as a design constraint set before any feature, not an afterthought for marketing.`,
      follow:`Your loop was designed for a mouse. What changes if the platform becomes mobile?`,
      red:`Treats platform choice as purely a business or marketing decision.` },
    { q:`Why can’t “we’ll port it later” be treated as free?`,
      a:`Porting touches input, save data, UI scale and sometimes the whole engine export path, and it competes for the same team’s time as the current milestone. Scope it like any other feature, with an estimate.`,
      follow:`Give a rough estimate for porting your current build to a second platform.`,
      red:`Assumes a second platform is a checkbox once the first ships.` }
  ],
  mid:[
    { q:`How do you choose between PC-first, mobile-first and console-first for a new project?`,
      a:`Score reach, cost, gatekeeping and effort for each realistic candidate, then match against the audience already validated by playtesting or comparables, not against the platform that sounds most impressive. Weigh the team’s actual capacity to carry an NDA and a certification calendar before revenue arrives.`,
      follow:`The validated audience is on mobile but the team’s expertise is PC. What do you do?`,
      red:`Picks the platform the team is most excited about with no reference to the audience.` },
    { q:`A console you want is out of reach for a first-party application. What are the options?`,
      a:`A porting partner, or console middleware for engines without an official export, both of which trade a fee or revenue share for the SDK work. Weigh that cost against the platform’s own reach and against building the in-house expertise to apply directly later.`,
      follow:`How would you evaluate whether a porting partner is worth the cut they take?`,
      red:`Concludes the console is simply closed and drops it with no alternative considered.` },
    { q:`When does “one codebase, several builds” stop being true?`,
      a:`When one platform needs a capability the others do not have an equivalent for; at that point the shared code has to branch or fork rather than pretend the platforms are the same. Decide this before content assumes a feature only some builds can offer.`,
      follow:`Name a feature in your current project that could not be shared across two platforms.`,
      red:`Insists everything can stay shared with no branching, regardless of the feature.` }
  ],
  senior:[
    { q:`The team wants to announce three platforms at once. What do you push back on?`,
      a:`Whether the team can carry three NDAs, three certification calendars and three sets of platform requirements at once, and whether the audience for each is validated or assumed. Recommend sequencing platforms by validated reach and real capacity, and say plainly which platform is aspirational rather than planned.`,
      follow:`Leadership insists on the simultaneous announcement anyway. What do you protect?`,
      red:`Agrees to the announcement without naming what it costs in access work and calendar risk.` },
    { q:`How do you decide when a platform is worth reaching only through a partner rather than directly?`,
      a:`Compare the partner’s fee or revenue share against the cost and time of building direct platform-holder approval in house, and weigh how much control over the release calendar the team is willing to give up. A platform that is a small part of the total audience rarely justifies the direct-access cost; a platform central to the audience usually does.`,
      follow:`The partner’s cut would erase most of that platform’s margin. Do you still go?`,
      red:`Treats every platform as worth reaching directly regardless of audience size or cost.` }
  ] });
FACTS('platform-choice',[
  { claim:`Steam’s Deck/Machine compatibility review is optional and sorts a game into Verified, Playable, Unsupported or Unknown, checking input, performance, seamlessness and display; you request it from the app’s Technical Tools or it can be queued automatically.`, asOf:'2026-09-24', src:'https://partner.steamgames.com/doc/steamdeck/compat' },
  { claim:`Godot has no official console export because console SDKs are NDA-bound and Godot is MIT-licensed; the Godot Foundation instead lists console middleware (W4 Games, RAWRLAB Games) and porting houses.`, asOf:'2026-09-24', src:'https://godotengine.org/consoles/' },
  { claim:`W4 Consoles supports Switch, PS5 and Xbox Series X|S, with Switch 2 in early beta; the Starter plan costs $800 per platform or $2,000 for all platforms a year.`, asOf:'2026-09-24', src:'https://www.w4games.com/w4consoles' },
  { claim:`From SDK v74, Meta names OpenXR a recommended path for Unity, Unreal and Godot on Quest.`, asOf:'2026-09-24', src:'https://developers.meta.com/horizon/blog/openxr-standard-quest-horizonos-unity-unreal-godot-developer-success/' }
]);
T('platform-access',{ d:'platforms', t:'Getting access: programmes, NDAs and dev kits', tag:'A console does not hand you an SDK. It hands you a queue: an entity, an NDA, then maybe a dev kit.',
  what:`How a studio gets onto a platform: registering with a developer programme (Steamworks, Nintendo Developer Portal, PlayStation Partners, ID@Xbox and Xbox Creators, Google Play Console, Apple Developer Program), meeting entity requirements such as a registered company, a D-U-N-S number or an identity check, signing an NDA where the platform requires one, and requesting or buying a dev kit. Engine access follows the same gate: Unity and Unreal need proof of platform-holder approval before they unlock console modules, and Godot reaches consoles only through middleware or a porting house.`,
  why:[`Every console requires an NDA and a partner agreement before the SDK exists for you at all; this is the first gate, not a formality after the fact.`,`Entity requirements (a registered company, a D-U-N-S number, an identity check) can take longer to satisfy than any technical work, and they block submission entirely until done.`,`Engine vendors add their own gate on top of the platform holder’s: Unity and Unreal only unlock console build support once you prove approved status, so the sequence is platform first, then engine.`,`An NDA binds the whole team, not just whoever signed it, and it constrains what can be discussed publicly, in this guide, and in a portfolio.`],
  think:{ q:[`Does this platform require a registered company, or can an individual register directly?`,`What entity paperwork (D-U-N-S, tax forms, identity verification) has to be done before any technical request can go in?`,`Who on the team needs to see NDA material, and what can never be shown outside that group?`,`Is a dev kit free with an approved concept, or is it a purchase the budget has to plan for?`,`If direct access is denied or too slow, does a middleware vendor or porting house get us there instead?`],
    trade:[`Registering as an individual is faster and simpler; a registered company unlocks programmes that require one and can access more support.`,`Applying directly to a platform holder gives full control and the best terms; a porting partner is faster but takes a cut and a share of control.`],
    traps:[`Assuming every platform needs an NDA. Steam Direct and itch.io need none; Nintendo, PlayStation and Xbox’s full console path do.`,`Starting entity paperwork (D-U-N-S, tax interviews) at the same time as a submission deadline instead of months ahead.`,`Letting NDA material spread past the people who need it, including into public devlogs or portfolios.`,`Assuming an engine’s console support is available the moment you buy a licence, when it is gated on platform approval first.`],
    good:[`The team knows, before writing a line of platform-specific code, exactly which entity and NDA steps stand between them and a dev kit.`,`NDA material stays inside the people who signed it, with no leakage into public material.`],
    bad:[`A submission stalls for months on a tax or identity check nobody started early.`,`Someone posts an NDA-covered detail in a public forum or stream.`] },
  how:[`For each target platform, read its own developer-programme page and list the entity requirements: individual vs company, D-U-N-S, tax forms, identity checks.`,`Start the entity and identity paperwork as soon as the platform is chosen, not when a submission date is set.`,`Read what is NDA-bound before requesting access, so the team knows what it can and cannot discuss once it signs.`,`Request or budget for a dev kit only after confirming whether it is free with an approved concept or a paid purchase.`,`If a console engine (Unity, Unreal) is planned, confirm the platform-holder approval step that unlocks it before assuming the engine licence alone is enough.`,`Where direct access stalls or is out of reach, evaluate a porting partner or, for Godot, a console-middleware vendor.`],
  ai:{ yes:[`Summarize a named platform’s public developer-programme page into an entity and access checklist.`,`Draft the internal NDA-handling policy (who sees what, where it cannot be discussed) once you name the platform’s NDA.`],
       no:[`Sign an NDA or submit legal or identity paperwork on the studio’s behalf.`,`Guess what a specific NDA covers when the public page does not say.`] },
  prompts:[{l:'Access checklist',p:`We want to publish on [PLATFORM]. Here is what its public developer page says about registration, entity type and any NDA: [PASTE]. Turn this into a checklist with an owner and an estimated lead time for each step, and flag anything that looks like it needs a company entity or a paid dev kit.`},
    {l:'NDA handling policy',p:`We are about to sign an NDA to access [PLATFORM]'s SDK. Draft an internal policy for what the team can discuss publicly (devlogs, portfolios, this guide), who on the team needs access to the NDA material, and how to keep console-specific detail out of anything that will be published.`}],
  verify:[`Does the checklist match what the platform’s own developer page states, not a guess or an old memory of the process?`,`Does the NDA policy name exactly what stays private, rather than a vague “be careful”?`],
  test:[`Walk a new team member through the access checklist and see where they get stuck or need a document nobody wrote down.`,`Audit one public devlog or portfolio entry against the NDA policy before it posts.`],
  rel:[['platform-choice','Access requirements are one more axis the platform choice depends on.'],['certification-and-review','What access buys you is a queue for review, not a release.'],['ethics-and-responsibility','An NDA is a legal commitment the whole team has to honour, not only the signer.'],['pm-qa-release','Getting a dev kit onto the calendar is a milestone dependency like any other external approval.']] });
TECH('platform-access',[
  {n:'Direct self-publishing', how:`Register with a low-barrier programme (Steam Direct, itch.io, Epic, a web portal) and publish with no NDA and no concept approval.`, fit:`PC and web-first teams, prototypes, and anyone who needs to ship before a platform holder would even take a meeting.`, cost:`No first-party marketing support and no dev-kit hardware; the studio is the whole publishing operation.`, alt:`Apply to a curated storefront or console for reach the open platforms cannot match.`},
  {n:'Apply directly to the platform holder', how:`Register an entity, sign the NDA, and go through the platform’s own programme (Nintendo Developer Portal, PlayStation Partners, ID@Xbox).`, fit:`A team with a registered entity, a track record, or a concept the platform holder is willing to accept.`, cost:`Months of vetting, an NDA binding the whole team, and often company paperwork before any technical work starts.`, alt:`A publisher or porting partner who already holds that access.`},
  {n:'Engine vendor proof-of-approval route', how:`Prove platform-holder approval to Unity or Unreal first; only then does the engine vendor unlock the console build modules and documentation.`, fit:`A team already building in Unity or Unreal that added a console target after the fact.`, cost:`A second gate run in sequence after the platform holder’s own approval, not in parallel with it.`, alt:`Godot through a console-middleware vendor or a porting house, which does not require this proof step.`}
]);
INTERVIEW('platform-access',{
  junior:[
    { q:`Do all platforms require an NDA to develop for them?`,
      a:`No. Steam and itch.io need no NDA and no concept approval; Nintendo, PlayStation and the full Xbox console path do, gated behind their developer programmes. Check the specific platform rather than assuming one rule fits all.`,
      follow:`Which of those two categories does a web portal like itch.io or CrazyGames fall into?`,
      red:`Assumes every platform needs the same NDA-and-approval process.` },
    { q:`What is a dev kit, and is it always free?`,
      a:`Hardware or a software environment the platform holder provides so you can build and test for their system. It is sometimes free to an approved team with an accepted concept, and sometimes a paid purchase; the answer differs by platform and is often gated behind the same NDA that gates everything else.`,
      follow:`Where would you look to find out which case applies for a specific console?`,
      red:`States a single price or policy as universal across platforms.` }
  ],
  mid:[
    { q:`A studio wants to target Nintendo Switch. What has to happen before any technical work starts?`,
      a:`Register on the Nintendo Developer Portal (open to individuals, no fee), accept the NDA and terms of service, then submit a separate application for access to Switch-specific information and hardware. Nothing about the SDK or the dev kit is visible before that separate application clears.`,
      follow:`How would you plan a schedule around a gate whose timing the platform does not publish?`,
      red:`Assumes portal registration alone grants SDK access.` },
    { q:`Your team is on Unity and wants a PS5 build. What blocks that, and in what order?`,
      a:`PS5 is a closed platform requiring confidentiality and legal agreements with Sony first; Unity’s own build-support modules for consoles are separate installers gated on proving that platform approval, and always with Unity Pro or higher, or a Preferred Platform licence key from the platform holder, because Unity Personal does not cover closed platforms. The platform holder’s approval comes first, the engine’s console modules follow.`,
      follow:`What would you tell a producer who assumes buying a Unity Pro seat is enough?`,
      red:`Thinks a Unity licence alone unlocks console building.` },
    { q:`How do you decide between applying to a console directly and going through a porting partner?`,
      a:`Compare the entity and NDA overhead and the calendar risk of direct approval against a partner’s fee or revenue share, and weigh how much of the platform relationship and technical control the team is willing to hand over. A studio with no company entity yet, or a tight timeline, often does better through a partner for the first console.`,
      follow:`What would change your recommendation for a team’s second console title?`,
      red:`Recommends the same route regardless of the team’s entity status or timeline.` }
  ],
  senior:[
    { q:`You are onboarding a studio onto its first two console platforms at once. What is the actual critical path?`,
      a:`Usually the entity and identity paperwork and the NDA process, not engine work; those can take longer than a build takes to make and cannot be parallelized past a point because platform holders vet the same legal entity. Sequence the applications, start paperwork before content is locked, and treat the NDA review itself as a scheduled milestone with an owner.`,
      follow:`One console’s approval stalls for an unstated reason. What do you do while it is pending?`,
      red:`Treats access as a formality that runs alongside content production with no schedule risk.` },
    { q:`An engineer wants to publish a devlog showing a console build running. What do you check first?`,
      a:`Whether anything in the shot, the code shown, or the described process is NDA-covered, and remember that the NDA binds the whole team, not just the signer. When in doubt, get platform-holder sign-off on the specific material rather than judging it internally, because the cost of a leak is the relationship, not just the post.`,
      follow:`The devlog only shows the game running with no console UI visible. Does that make it safe?`,
      red:`Approves the devlog based only on what the signer personally remembers being restricted.` }
  ] });
FACTS('platform-access',[
  { claim:`Steam Direct’s fee is $100 per app, recoupable once the product reaches at least $1,000 Adjusted Gross Revenue.`, asOf:'2026-09-24', src:'https://partner.steamgames.com/doc/gettingstarted/appfee' },
  { claim:`Nintendo Developer Portal registration is free and open to individuals; access to Switch-specific information requires a separate application submitted after registering and accepting the NDA and Terms of Service.`, asOf:'2026-09-24', src:'https://developer.nintendo.com/the-process' },
  { claim:`PlayStation Partners registration’s first question asks where the applicant’s company or institution is registered, indicating a registered entity is generally expected to apply.`, asOf:'2026-09-24', src:'https://register.playstation.net/' },
  { claim:`ID@Xbox requires being at least 18 years old, signing an NDA, and being in a country with which Microsoft can do business.`, asOf:'2026-09-24', src:'https://developer.microsoft.com/en-us/games/publish' },
  { claim:`The full console GDK and NDA samples further require an organisation onboarded with a Partner Center account and a Microsoft Entra ID tenant, since personal Microsoft accounts are no longer supported.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/gdk-dev/development-downloads/access-resources' },
  { claim:`Apple Developer Program membership costs $99 per year; an organisation account additionally requires a D-U-N-S Number, legal binding authority, a work email on the organisation’s domain, and a public website.`, asOf:'2026-09-24', src:'https://developer.apple.com/programs/enroll/' }
]);
T('platform-requirements',{ d:'platforms', t:'Platform requirements: what every build must do', tag:'Suspend, resume, controller loss and a save that survives them are not features. They are the entry fee.',
  what:`The technical and behavioural requirements a platform holds every build to, beyond the game itself: achievements or trophies, save data that survives a suspend, handling controller loss and account or user switching, accessibility features, minimum SDK or API levels, and parity across a generation such as Xbox Series X and Series S. Some of this is public (Xbox’s Requirements, store and platform policies); the equivalent console checklists for Nintendo and PlayStation are NDA content, and only their public outline can be described here.`,
  why:[`These are the requirements a review gate checks against, so meeting them early is cheaper than discovering them at certification.`,`Suspend, resume and controller-loss handling are not edge cases; they are the platform’s own most common crash and rejection class.`,`SDK and API minimums move on a schedule set by the platform, not by the project, so a build can pass review one quarter and fail the next without a single code change.`,`Where the checklist is NDA content, the design still has to plan around the public outline, because guessing the private detail is worse than working from what is known.`],
  think:{ q:[`Does the build correctly save and restore state across a suspend with no player-initiated action?`,`What happens the instant a controller disconnects mid-session, before the player notices?`,`Are we tracking the platform’s current minimum SDK or API level, or building against whatever version was current when the project started?`,`Do Series X and Series S (or an equivalent split) get the same modes and the same access, not a cut-down version for one?`,`For a platform whose checklist is NDA, what is in its public outline, and what have we chosen not to guess?`],
    trade:[`Autosaving on every lifecycle event is safer and costs more disk writes and design care around a save that can be interrupted mid-write.`,`Supporting every accessibility requirement early costs design time up front and avoids a much larger retrofit later.`],
    traps:[`Handling controller loss only through a generic “pause on focus loss” event, which misses console cases where focus does not change.`,`Targeting whatever SDK version the project started on and never revisiting the platform’s current minimum.`,`Building one performance mode and quietly shipping a worse experience on the weaker half of a console generation.`,`Assuming an NDA checklist item works like the public rule from a different platform.`],
    good:[`A suspend or a pulled controller is handled the same way everywhere in the game, from one lifecycle handler.`,`The SDK and API minimums are tracked as a dated fact and rechecked before each submission.`],
    bad:[`A save is lost because the game only wrote it on a manual save action.`,`Series S players get a visibly worse build with no equivalent modes.`] },
  how:[`Build one lifecycle handler for pause, resume, focus loss and device disconnect, and call it from everywhere instead of duplicating it per scene.`,`Autosave on suspend and on a timer, not only on a manual save action, so an unannounced suspend loses at most the interval.`,`Track each target platform’s current SDK or API minimum as a dated fact, and recheck it before every submission, not only at project start.`,`Design one set of modes that both halves of a console generation can run, rather than a cut-down version for the weaker one.`,`For a platform whose full checklist is NDA, build from its public outline (store policies, published requirements pages) and confirm the rest only once the team has access.`,`Test suspend, resume and controller loss on the actual device; an editor rarely reproduces a phone backgrounding or a console suspending.`],
  ai:{ yes:[`Write a lifecycle handler for a named engine that reacts to pause, resume, focus loss and device disconnect.`,`Turn a platform’s published requirements page into a checklist with an owner and a build to verify each item in.`],
       no:[`Guess the content of an NDA-covered certification checklist.`,`Decide that a requirement can be skipped because it seems unlikely to be checked.`] },
  prompts:[{l:'Lifecycle handler',p:`We are building in [ENGINE] targeting [PLATFORMS]. Write one lifecycle handler that autosaves on suspend, reacts to a controller disconnecting mid-session, and restores correctly on resume. Call out anything that has to be tested on real hardware because it cannot be reproduced in the editor.`},
    {l:'Requirement checklist from a public page',p:`Here is a platform’s public requirements page: [PASTE]. Turn it into a checklist grouped by category (saves, achievements, accessibility, SDK minimum, generation parity), with which items are testable in the editor and which need the real device or console.`}],
  verify:[`Does the lifecycle handler fire on an actual suspend or disconnect, not only on a simulated event in the editor?`,`Is the SDK or API minimum the platform’s current one, checked against today’s date, not the one from project start?`,`Does the plan avoid stating anything about an NDA checklist beyond its public outline?`],
  test:[`Force-suspend the build on the real device or console mid-session and confirm the save on resume matches expectations.`,`Disconnect the controller mid-session on the real hardware and confirm the game reacts to the disconnect itself, not to a side effect like a focus change.`,`Run the weaker half of a console generation (for example Series S) through the same test pass as the stronger half.`],
  rel:[['certification-and-review','A requirement missed here is what a review gate catches, later and more expensively.'],['accessibility','Several platform requirements are accessibility features a store has made mandatory.'],['quality-and-build-health','Suspend, resume and controller-loss handling are the platform’s own crash class.'],['platform-access','Where a requirement is NDA content, it only becomes visible once the team has access.']] });
TECH('platform-requirements',[
  {n:'Central lifecycle event handler', how:`One place in code reacts to pause, resume, focus loss and device disconnect, and every scene calls into it instead of duplicating the logic.`, fit:`Any platform that can suspend, background or lose a controller, which by now is every platform.`, cost:`Has to be verified on the real device; the editor does not reproduce a phone backgrounding or a console sleeping.`, alt:`Handle it per scene, which duplicates logic and reliably misses one screen.`},
  {n:'Autosave on lifecycle events, not only on demand', how:`Trigger a save on pause and on a timer, so a suspend with no warning loses no more than the interval between saves.`, fit:`Any save-based game on mobile or a console with an instant suspend state.`, cost:`More frequent disk writes, and a save format that has to tolerate being interrupted mid-write.`, alt:`Save only at designed checkpoints, acceptable only where a session is short enough that little is lost.`},
  {n:'Requirement checklist mapped to platform documents', how:`Turn each platform’s public requirements page, or its NDA outline, into a checklist item with an owner and the build it is verified in.`, fit:`Any multi-platform project heading towards its first certification pass.`, cost:`Upkeep: the checklist has to track the platform’s own document version and revalidate after every revision.`, alt:`Rely on the certification pass itself to surface gaps, which is slower and costs more per finding.`}
]);
ENGINE('platform-requirements',{
  godot:{ term:`Mobile suspend arrives as NOTIFICATION_APPLICATION_PAUSED and _RESUMED (Android and iOS only); desktop and Steam Deck report focus changes with NOTIFICATION_APPLICATION_FOCUS_OUT; controller loss arrives as Input.joy_connection_changed on every platform.`,
    api:['Node._notification(NOTIFICATION_APPLICATION_PAUSED / _RESUMED)','NOTIFICATION_APPLICATION_FOCUS_OUT','Input.joy_connection_changed(device, connected)','FileAccess.open("user://save.dat", ...)','get_tree().paused'],
    snippet:`extends Node

func _ready() -> void:
\tInput.joy_connection_changed.connect(_on_pad)

func _notification(what: int) -> void:
\tmatch what:
\t\tNOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_APPLICATION_FOCUS_OUT:
\t\t\t_save_now()

func _save_now() -> void:
\tvar f := FileAccess.open("user://save.dat", FileAccess.WRITE)
\tf.store_var(GameState.snapshot())
func _on_pad(device: int, connected: bool) -> void:
\tif not connected:
\t\tget_tree().paused = true`,
    pitfall:`Saving only on a manual save action. Suspend on a phone happens with no warning and no player-initiated event, so a build that never reacts to NOTIFICATION_APPLICATION_PAUSED loses everything since the last manual save, exactly the crash class certification exists to catch.`,
    map:`Godot’s NOTIFICATION_APPLICATION_PAUSED/RESUMED are Unity’s OnApplicationPause/OnApplicationFocus.` },
  unity:{ term:`The same events exist as MonoBehaviour callbacks and an Input System event: pause, focus loss and a device connecting or disconnecting, which store requirements treat as mandatory handling rather than a nice-to-have.`,
    api:['MonoBehaviour.OnApplicationPause(bool)','MonoBehaviour.OnApplicationFocus(bool)','InputSystem.onDeviceChange','Application.persistentDataPath','File.WriteAllBytes / PlayerPrefs.Save()'],
    snippet:`public class LifecycleSave : MonoBehaviour {
    void OnEnable() => InputSystem.onDeviceChange += OnDevice;
    void OnDisable() => InputSystem.onDeviceChange -= OnDevice;
    void OnApplicationPause(bool paused) {
        if (paused) Save();
    }
    void OnDevice(InputDevice d, InputDeviceChange c) {
        if (c == InputDeviceChange.Disconnected)
            Time.timeScale = 0f;
    }
    void Save() {
        var path = Application.persistentDataPath + "/save.dat";
        File.WriteAllBytes(path, GameState.Snapshot());
    }
}`,
    pitfall:`Trusting OnApplicationFocus alone on console. A controller disconnect does not always take focus from the game, so a handler that only watches focus can miss the exact event a requirement like controller-loss handling asks for: reacting to the disconnect itself, not a side effect of it.`,
    map:`Unity’s OnApplicationPause and InputSystem.onDeviceChange are Godot’s NOTIFICATION_APPLICATION_PAUSED and Input.joy_connection_changed.` }});
INTERVIEW('platform-requirements',{
  junior:[
    { q:`Why does a game need to handle “suspend and resume” as its own case?`,
      a:`Because it can happen with no warning and no player action, unlike a manual pause. If the game only saves when the player chooses to, a suspend loses everything since that save. Autosaving on the suspend event itself is what keeps that from happening.`,
      follow:`How would you test that your game handles a suspend, not just a menu pause?`,
      red:`Assumes a manual save is enough and never tests an actual suspend.` },
    { q:`What is the difference between a public requirement and an NDA-covered one?`,
      a:`A public requirement, like Xbox’s published Requirements, can be read and designed against directly. An NDA-covered one, like a console’s confidential certification checklist, can only be planned around at the level of its public outline until the team has access; guessing the private detail is worse than working from what is known.`,
      follow:`Give an example of a public requirement and one that is typically NDA-covered.`,
      red:`Claims to know NDA checklist details without having seen them.` }
  ],
  mid:[
    { q:`Design a lifecycle handler for a game that needs to run on mobile, PC and a console.`,
      a:`One handler that reacts to pause, resume, focus loss and controller disconnect, called from a single place rather than duplicated per scene, autosaving on the suspend event and on a timer. Test it on real hardware for each platform, because none of this reproduces reliably in the editor.`,
      follow:`Which part of this handler is hardest to verify without the real device?`,
      red:`Builds the handler once and assumes it behaves identically everywhere with no on-device test.` },
    { q:`A console generation splits into a stronger and a weaker model. What does “parity” require?`,
      a:`The same modes and the same access on both, rather than a cut-down experience on the weaker one; this is a real requirement on platforms that enforce it, not just good practice. Decide the shared target performance early so content is not built for the stronger model and then stripped down late.`,
      follow:`Your game runs at half the frame rate on the weaker model. What do you change first?`,
      red:`Ships a visibly worse build on the weaker model with no equivalent modes.` },
    { q:`How do you keep SDK or API minimums from becoming a surprise at submission?`,
      a:`Track the platform’s current minimum as a dated fact, recheck it before every submission rather than trusting the version the project started on, and note when a platform allows an extension window for updating. Build compliance into the release checklist, not into memory.`,
      follow:`The platform just moved its minimum SDK version up two weeks before your submission date. What do you do?`,
      red:`Discovers the current minimum only when a submission is rejected for targeting an old one.` }
  ],
  senior:[
    { q:`You inherit a project where accessibility and lifecycle handling were treated as late polish. How do you recover?`,
      a:`Audit against the platform’s public requirements first, since those are checkable now, and separately flag anything that depends on NDA content the team may not yet have full access to. Prioritize suspend/resume and controller-loss handling early because they are both a rejection risk and a real player-facing failure, then bring accessibility items in behind them rather than after certification finds them.`,
      follow:`Certification is in three weeks and half of this is unaddressed. What ships in that window and what does not?`,
      red:`Treats every item as equally urgent with no triage by review risk.` },
    { q:`How do you plan around a requirement you know exists but cannot read because it is NDA content?`,
      a:`Build to the platform’s public outline of it, budget schedule slack for the detail to differ once access is granted, and never state or imply specifics that were never confirmed, inside the team or in anything published. Treat the uncertainty as a planning risk to manage, not a gap to guess through.`,
      follow:`A team member says they “remember” the private detail from a past project. What do you do with that?`,
      red:`Documents or acts on a guessed NDA detail as if it were confirmed.` }
  ] });
FACTS('platform-requirements',[
  { claim:`Xbox Requirement XR-055 requires games to launch with at least 10 and at most 100 achievements worth 1,000 gamerscore, with semi-annual additions up to 100 achievements / 1,000 G and a lifetime cap of 500 achievements / 5,000 G; demos cannot have achievements.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/console/certification-requirements' },
  { claim:`Xbox Requirement XR-130 requires supporting the whole console generation, Xbox Series X and Series S, with equal modes and no player split between them.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/gaming/gdk/docs/store/policies/console/certification-requirements' },
  { claim:`Google Play requires new apps and updates to target Android 16 (API level 36) from 2026-08-31, with an extension to 2026-11-01 available on request; existing apps must target at least API 35 to remain visible to new users on newer Android.`, asOf:'2026-09-24', src:'https://support.google.com/googleplay/android-developer/answer/11926878' },
  { claim:`Since 2025-11-01, new Android apps and updates targeting Android 15+ with native code must support 16 KB memory pages, which affects native libraries built by Unity, Unreal and Godot.`, asOf:'2026-09-24', src:'https://android-developers.googleblog.com/2025/05/prepare-play-apps-for-devices-with-16kb-page-size.html' },
  { claim:`Since 2026-04-28, Apple requires apps to be built with Xcode 26 and the iOS 26 SDK; since 2026-09-09, iOS and iPadOS apps must target iOS 13 or later.`, asOf:'2026-09-24', src:'https://developer.apple.com/news/upcoming-requirements/' }
]);
T('certification-and-review',{ d:'platforms', t:'Certification and store review', tag:'Every platform has a gate, a clock and a list of reasons it says no. Plan the calendar around the clock, not around hope.',
  what:`The review or certification gate every platform runs before a build (and often every update) reaches players: Steam’s separate store-page and build reviews, Xbox certification, Apple App Review, Google Play review, and Nintendo and PlayStation’s confidential processes. Each has its own turnaround, its own common rejection causes, and its own resubmission cost, and a release plan has to treat the gate’s timing as a fixed calendar commitment rather than an afterthought.`,
  why:[`A rejection this week is not just a delay; it usually means a resubmission queue, so the real cost of a miss is the turnaround time twice over.`,`The gates differ enormously in speed: a same-day iteration on Apple is a different planning problem than Steam’s 3-to-5-business-day reviews or a confidential console process with no published clock.`,`Most rejections come from a short, well-known list: crashes, placeholder content, a store page promising what the build does not do, and missing privacy or content-disclosure forms.`,`On consoles and mobile stores the update path is also a gate, so passing once does not exempt a patch; Steam and Meta Quest let updates go live without a new review.`],
  think:{ q:[`Have we scheduled the review window as a fixed date on the calendar, with buffer for at least one resubmission?`,`Does the store page describe only what ships at launch, with nothing promised that the build does not do?`,`Have we run the platform’s own validator or pre-check before the real submission?`,`Is a content or privacy disclosure form (Steam’s Content Survey, Google’s Data safety form, Apple’s privacy labels) filled in and accurate?`,`What is the resubmission cost if this specific build fails, and can the schedule absorb it?`],
    trade:[`Submitting early with buffer costs calendar time up front and protects the launch date; submitting late to maximize content risks the date entirely.`,`An expedited or Fastlane review (Apple expedited review; Xbox Fastlane, 48 hours instead of 4 business days) buys days back, but it is a request the platform can refuse, so spending it on routine lateness leaves nothing for a real emergency.`],
    traps:[`Treating review turnaround as a best case rather than the number to plan around.`,`Submitting a build with placeholder content, assuming reviewers will understand it is temporary.`,`A store page that promises a feature not yet in the submitted build.`,`Forgetting that routine content updates on consoles go through certification again, not just the initial release.`,`Skipping a disclosure form because “we don’t think it applies to us.”`],
    good:[`The release plan shows the review window as a named date with a resubmission buffer already in it.`,`A pre-check or validator run catches the common rejection causes before the real submission.`],
    bad:[`The team discovers the review takes longer than assumed only after missing a launch date.`,`A rejection cites a store page claim the build does not deliver.`] },
  how:[`Look up each target platform’s published review turnaround (or the fact that it is confidential) and put the review window on the calendar as a fixed date, not a guess.`,`Add buffer for at least one resubmission cycle, sized to that platform’s own turnaround.`,`Before the real submission, run the platform’s validator or an internal pre-check against the common rejection causes: crashes, placeholder content, page-vs-build mismatch, missing forms.`,`Write the store page to describe only what ships at launch, and update it the moment the build’s scope changes.`,`Fill in every required disclosure form (content survey, data-safety form, privacy labels) accurately, even when it seems not to apply.`,`Plan post-launch updates with the same review step in the schedule; a patch is not exempt from the gate.`],
  ai:{ yes:[`Draft a submission calendar from a platform’s published review times and a target launch date.`,`Check a store page draft against the build’s actual feature list for promises the build does not keep.`],
       no:[`Guess a confidential platform’s review turnaround or certification checklist.`,`Decide to submit without buffer because the schedule is tight.`] },
  prompts:[{l:'Review calendar',p:`Our target launch date is [DATE] and we are submitting to [PLATFORMS]. Using each platform’s published review turnaround (or noting where it is confidential), build a submission calendar working backward from launch, with buffer for one resubmission per platform.`},
    {l:'Pre-submission check',p:`Here is our store page draft and a summary of what the current build does: [PASTE]. List every claim on the page the build does not yet deliver, and check for the common rejection causes: crashes, placeholder content, and missing content or privacy disclosure forms.`}],
  verify:[`Does the submission calendar use the platform’s own published turnaround, not an assumed one?`,`Does the store page match the build being submitted, item for item?`,`Is there buffer in the schedule for at least one resubmission on each platform?`],
  test:[`Run the platform’s own pre-check or validator against the build before the real submission and fix everything it flags.`,`Have someone outside the team read the store page and the build’s actual feature list side by side and flag any mismatch.`],
  rel:[['platform-requirements','A rejection traces back to a requirement missed earlier, not to the reviewer.'],['ratings-and-disclosures','The ratings and content questionnaire is one of the gates, answered once and reused.'],['pm-qa-release','Review windows are calendar commitments a release plan has to hold as fixed dates.'],['live-operations','Every post-launch patch on a console repeats this same gate.']] });
TECH('certification-and-review',[
  {n:'Buffer the calendar to the platform’s own SLA', how:`Add the platform’s published turnaround, or a conservative estimate where it is confidential, to the release date, plus slack for one resubmission.`, fit:`Every platform, every submission, not only launch.`, cost:`A schedule that looks slower than “submit and hope,” which stakeholders have to accept as the real number.`, alt:`A paid expedited or fast-lane review where the platform offers one, spent only on a genuine emergency.`},
  {n:'Pre-certification pass', how:`Run the platform’s own validator, or an internal checklist built from its public requirements, before the real submission.`, fit:`Any console or store with a known rejection pattern such as crashes, placeholder content or missing forms.`, cost:`Time spent building a check that is not the actual gate, and it can still miss what only the real review catches.`, alt:`A paid official pre-check service where the platform sells one.`},
  {n:'Staged or phased release after approval', how:`Release to a small share of players first, or through a limited channel, and widen it once nothing regresses.`, fit:`Platforms that support a staged or phased rollout after approval.`, cost:`Slower to reach the full audience, and early metrics from a partial rollout can mislead if read too soon.`, alt:`A full release on approval, when the platform offers no staged option or the risk is judged low.`}
]);
INTERVIEW('certification-and-review',{
  junior:[
    { q:`What are the most common reasons a submission gets rejected?`,
      a:`Crashes, placeholder content left in the build, a store page promising something the build does not deliver, and a missing or inaccurate privacy or content disclosure form. All four are avoidable with a pre-submission check.`,
      follow:`Which of these would your own pre-submission check catch today, and which would it miss?`,
      red:`Blames the reviewer or the platform rather than naming a checkable cause.` },
    { q:`Why does a routine patch still need to go through review on some platforms?`,
      a:`Because certification applies to updates as well as the initial release on console platforms; passing once does not exempt every later build. The schedule for any patch has to include the same gate, sized to that platform’s update turnaround rather than its full-game turnaround.`,
      follow:`How would this change your plan for a day-one hotfix?`,
      red:`Assumes only the first submission is ever reviewed.` }
  ],
  mid:[
    { q:`Build a submission calendar for a game launching on Steam and Xbox on the same date.`,
      a:`Work backward from the launch date using each platform’s published turnaround: Steam’s roughly 3 to 5 business days for the store page and the build separately, plus its required 2-week Coming Soon period, and Xbox’s roughly 4 business days for a digital base final. Add buffer on each for at least one resubmission, and submit the store-dependent path (Steam) early enough that its 2-week wait does not itself become the bottleneck.`,
      follow:`One platform’s build fails and needs a resubmission. What happens to the shared launch date?`,
      red:`Uses a single generic turnaround number for every platform.` },
    { q:`A store page was written before the build was finished. What do you check before submission?`,
      a:`Every claim on the page against what ships at launch, because a page promising a feature the build does not have is a known, avoidable rejection cause on multiple platforms. Update the page the moment scope changes rather than leaving it to catch up at submission time.`,
      follow:`A promised feature got cut two days before submission. What do you do?`,
      red:`Submits without rechecking the page against the final build.` },
    { q:`Apple’s review is often same-day; a console’s is not published at all. How does that change how you plan each?`,
      a:`Apple can be planned with a short, fairly reliable buffer since most reviews clear quickly, while a console with a confidential process needs a conservative, wider buffer and closer coordination with the platform’s own account contacts, since there is no public number to anchor a schedule to.`,
      follow:`How would you communicate that uncertainty to a producer who wants one launch date across all platforms?`,
      red:`Applies Apple’s fast turnaround as the expected number for every platform.` }
  ],
  senior:[
    { q:`Launch is six weeks out and three platforms are involved. How do you sequence the submissions?`,
      a:`Submit first to whichever platform has the longest total pre-launch requirement, such as Steam’s Coming Soon period plus review, so its clock does not become the critical path; hold buffer for at least one resubmission on each; and keep the platforms with confidential or unpublished turnaround (console) coordinated directly with the platform’s account team rather than guessed from a public page.`,
      follow:`One platform comes back with a Conditions for Resubmission and the launch date is fixed. What gives?`,
      red:`Treats all platforms as parallel with no attention to which has the longest lead time.` },
    { q:`A team keeps missing launch dates because certification “always takes longer than planned.” What is wrong?`,
      a:`Usually the schedule was built on best-case turnaround with no resubmission buffer, or on an assumption rather than the platform’s own published number, or a store page and build were finalized too close together to catch a mismatch. Fix the estimate at the source: read the real SLA, add a resubmission cycle, and separate the store-page freeze from the build freeze so each has its own check.`,
      follow:`What would you change about how this team plans its next launch date?`,
      red:`Attributes the pattern to bad luck rather than an estimating process to fix.` }
  ] });
FACTS('certification-and-review',[
  { claim:`Steam’s store page review and build review each typically take 3 to 5 business days; Valve recommends submitting each at least 7 business days before launch.`, asOf:'2026-09-24', src:'https://partner.steamgames.com/doc/store/review_process' },
  { claim:`Xbox certification SLAs are a digital base final in 4 business days (Fastlane 48 hours), a digital content update in 2 business days (Fastlane 24 hours), and a disc submission in 5 business days.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/gaming/game-publishing/concepts/certification/certification-guide' },
  { claim:`Apple states that on average 90% of App Review submissions are reviewed in less than 24 hours, with expedited review available for critical fixes and event-tied releases.`, asOf:'2026-09-24', src:'https://developer.apple.com/distribute/app-review/' },
  { claim:`Google Play review times can run up to seven days or longer in exceptional cases for certain developer accounts.`, asOf:'2026-09-24', src:'https://support.google.com/googleplay/android-developer/answer/9859751' },
  { claim:`Nintendo reviews every product before release and publishes no turnaround time.`, asOf:'2026-09-24', src:'https://developer.nintendo.com/the-process' }
]);
T('ratings-and-disclosures',{ d:'platforms', t:'Ratings, privacy forms and disclosures', tag:'The rating board and the privacy form are part of the submission, and a wrong answer blocks the release as hard as a crash does.',
  what:`The paperwork every store makes you file before players can buy the game: an age rating, a privacy or data-collection form, and, where it applies, an odds disclosure for paid random items and an AI-content disclosure. Most digital storefronts share one age-rating system, IARC, filled in once and read by several stores. Steam and Apple run their own questionnaires instead. A boxed release, and a console release in Japan, needs a rating from the local board directly, because that board is not part of the shared system. Privacy forms (Apple’s privacy labels, Google’s Data safety) ask what the game collects, including what a third-party SDK collects on your behalf, not just your own code.`,
  why:[`A store will not let a rating-less or privacy-form-less build go live, so this paperwork sits on the critical path to release, not beside it.`,`The questionnaire answers are legal statements about the game, and getting one wrong risks a takedown or a resubmission, not just a warning.`,`Odds disclosure and AI disclosure are now policy on several stores, not just good practice, so skipping them is a rejection reason.`,`Console releases in Japan and physical releases fall outside the shared rating system, so a team that only plans for IARC finds this out late.`],
  think:{ q:[`Which of our storefronts share IARC, and which run their own questionnaire?`,`Does a Japan release or a disc SKU exist in our plan, and does it have its own rating line item?`,`What does every SDK in the build collect, not just the code we wrote?`,`If the game has any paid random item, where does the odds disclosure have to appear?`],
    trade:[`Filling in the questionnaire from memory is fast and wrong; auditing every SDK and mechanic first is slower and defensible.`,`A stricter self-rating avoids a resubmission but can gate the store’s default audience down.`],
    traps:[`Assuming one IARC answer covers Steam or Apple.`,`Treating Japan as “the same as everywhere else with a different language”.`,`Declaring “no data collected” without checking the ad or analytics SDK.`,`Discovering a paid-random-item mechanic that needed disclosure only after a reviewer flags it.`,`Treating a rating board’s descriptor list as a complete warning: the ESRB’s descriptors for Doki Doki Literature Club Plus! name Blood, Strong Language, Suggestive Themes and Violence but not self-harm or suicide; only the longer rating summary describes those scenes.`],
    good:[`One rating and privacy record per build, checked against the actual mechanics and SDKs before submission.`,`The odds disclosure text matches the exact odds shipped in that build.`],
    bad:[`The privacy form was copied from the last game and never rechecked against this game’s SDKs.`,`Nobody owns the Japan or physical rating line item until it blocks a date.`] },
  how:[`List every storefront the game ships to and mark which use IARC, which run their own questionnaire (Steam, Apple), and which need a direct board rating (Japan, physical).`,`Audit every third-party SDK in the build for what it collects, before answering any privacy form.`,`If the game has a paid random item, write the odds disclosure text once and place it everywhere the relevant store requires it.`,`Answer the AI-content disclosure from the same content manifest the game’s AI-disclosure practice keeps (see ai-disclosure-policy).`,`Re-answer every form when a mechanic, an SDK, or a region changes, not only at first submission.`],
  ai:{ yes:[`Draft the privacy-form answers from a list of the SDKs in the build.`,`Draft odds-disclosure copy from the drop table’s real values.`,`Summarize a rating board’s public content descriptors against your game’s content.`],
       no:[`Decide the age rating or the content descriptors.`,`Certify legal compliance with a region’s privacy law.`,`Answer a questionnaire without the actual SDK and drop-table data in front of it.`] },
  prompts:[{l:'Privacy form draft',p:`Here is the list of SDKs in our build and what each one’s own documentation says it collects: [SDK LIST]. Draft answers to a Data safety or privacy label questionnaire and flag any SDK whose collection is unclear or missing.`},{l:'Odds disclosure copy',p:`Our paid random item’s drop table is: [TABLE]. Write the odds-disclosure text once, in the wording our stores expect (in-product, on the product page, or both), and list every store surface it needs to appear on.`}],
  verify:[`Does the privacy or Data safety form match every SDK shipping in this build?`,`Does the odds-disclosure text match the exact drop table shipped, not an earlier tuning pass?`,`Is there a rating line item for Japan or a physical SKU if either exists in the plan?`],
  test:[`Hand a build’s questionnaire answers to someone who did not fill them in. Can they trace every “no” answer to a reason?`],
  rel:[['store-presence',`Ratings and privacy answers are asked again, or referenced, when the store page goes up.`],['certification-and-review',`Missing or wrong ratings and privacy answers are a rejection reason inside the same review.`],['ai-disclosure-policy',`The AI-content disclosure on a store form reads from the same manifest this practice keeps.`],['ethics-and-responsibility',`Odds disclosure and data collection are the ethics questions this domain turns into a form.`]] });
TECH('ratings-and-disclosures',[
  {n:'Shared IARC questionnaire', how:`Answer one content questionnaire in the platform’s dashboard; it issues board ratings (ESRB, PEGI, USK and others) that several storefronts accept.`, fit:`Google Play, Microsoft Store, Meta Horizon Store, Epic Games Store, PlayStation, Nintendo.`, cost:`One wrong answer misrates the game everywhere it is reused.`, alt:`A store-specific questionnaire where IARC does not apply (Steam’s Content Survey, Apple’s own rating form).`},
  {n:'Direct board rating', how:`Submit the build straight to a board (CERO for Japan, or a long-form submission for a boxed release) instead of through the shared system.`, fit:`A console release in Japan, or any disc SKU.`, cost:`A separate fee, its own lead time, and one submission per board rather than one shared pass.`, alt:`Drop the Japan or physical SKU from the plan if the lead time does not fit the date.`},
  {n:'SDK-first privacy audit', how:`List every third-party SDK in the build and pull its own stated data collection before writing a single answer on the privacy form.`, fit:`Every mobile release, even one that adds no first-party analytics.`, cost:`Takes a build inventory pass most teams skip until a reviewer asks.`, alt:`Answer from the store’s own SDK-safety directory when the vendor’s own documentation is unclear.`}
]);
INTERVIEW('ratings-and-disclosures',{
  junior:[
    { q:`What is IARC, and which stores use it?`,
      a:`A shared questionnaire that produces board ratings (ESRB, PEGI, USK and others) accepted by several storefronts at once, so a developer answers it once instead of per board. It covers digital storefronts such as Google Play, Microsoft Store, Meta Horizon Store and console stores; it does not cover Steam or Apple, which run their own questionnaires.`,
      follow:`Our game also ships on Steam. Do we still need IARC?`,
      red:`Assumes one questionnaire covers every store the game ships to.` },
    { q:`Why does a Japan release need extra work even on a platform that uses IARC everywhere else?`,
      a:`CERO, Japan’s rating board, is not part of the shared system, so a console release in Japan needs a CERO rating obtained directly, on top of whatever IARC answer covers the rest of the world.`,
      follow:`Is a Japan release digital-only or does it include a disc?`,
      red:`Says Japan is covered because the rest of the world’s rating is done.` }
  ],
  mid:[
    { q:`A store’s privacy form asks what the game collects. Your code collects nothing, but you shipped an ad SDK. What do you answer?`,
      a:`You answer based on what the ad SDK collects, not your own code, because these forms explicitly cover third-party SDK data. You pull the SDK vendor’s own data-collection disclosure rather than guessing, and you redo this whenever the SDK version changes.`,
      follow:`The SDK vendor’s documentation is vague about one data type. What do you do before submitting?`,
      red:`Answers “no data collected” because the studio’s own code collects nothing.` },
    { q:`The game has a gacha-style paid pull. Where does the odds disclosure need to appear, and what happens if it does not?`,
      a:`In the store surfaces that require it and inside the product before the purchase completes, worded to match the exact odds shipped. Skipping it is a rejection or takedown reason on the stores that require it, not a style choice.`,
      follow:`The drop rates changed in a balance patch. What do you check before that patch ships?`,
      red:`Treats odds disclosure as optional flavour text rather than a submission requirement.` }
  ],
  senior:[
    { q:`Design a process so ratings and privacy answers stay true across every future update, not just at first submission.`,
      a:`Tie the questionnaire answers to the same content and SDK manifest the build ships, so a changed mechanic, drop table or added SDK forces a re-check before submission rather than relying on someone remembering. Give one owner the re-check step in the release checklist, and log the date each form was last verified against the manifest.`,
      follow:`A patch adds a new SDK the marketing team asked for after content lock. Does it bypass the check?`,
      red:`Treats the questionnaire as a one-time gate cleared at launch.` },
    { q:`PEGI’s expanded interactive-risk categories, or a similar rule change, can shift a game’s rating from a content change nobody in engineering touched. How do you catch that before it costs a submission?`,
      a:`Keep a dated list of the rating rules the game’s mechanics depend on (paid random items, communication features, time-pressure purchase offers) and its source, and review it whenever a rating board publishes a policy change, not only when the team changes the game. Route any mechanic that could trip a category through that list before it ships.`,
      follow:`A live-ops event temporarily adds a mechanic that was never reviewed against this list. What do you do?`,
      red:`Only rechecks the rating when the design changes, ignoring rule changes on the board’s side.` }
  ] });
FACTS('ratings-and-disclosures',[
  { claim:`IARC’s rating authorities are ACB (Australia), ClassInd (Brazil), Taiwan DGSC, ESRB (US/Canada), GAMR (Saudi Arabia), GRAC (Korea), IGRS (Indonesia), PEGI (UK/Europe) and USK (Germany). CERO (Japan) is not listed, so console releases in Japan need a CERO rating obtained directly.`, asOf:'2026-09-24', src:'https://globalratings.com/participants/' },
  { claim:`Apple runs its own age-rating questionnaire rather than IARC, with tiers 4+, 9+, 13+, 16+ and 18+ (the 13+/16+/18+ tiers and new questions on in-app controls, capabilities, medical/wellness and violent themes were added in this cycle); developers had to answer the new questions by 2026-01-31 to avoid interruption to updates.`, asOf:'2026-09-24', src:'https://developer.apple.com/news/?id=ks775ehf' },
  { claim:`Google Play requires a Data safety form for every app on closed, open or production tracks, including apps that collect no user data themselves, and the form must cover data collected by third-party SDKs; a privacy policy link is also required.`, asOf:'2026-09-24', src:'https://support.google.com/googleplay/android-developer/answer/10787469' },
  { claim:`Microsoft Store policy 10.8.4 requires disclosing the odds of receiving each item from a paid random item, in the product, on the product page, or on a linked website (Store Policies version 7.20, dated 2026-09-14).`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/windows/apps/publish/store-policies' },
  { claim:`PEGI’s expanded age-rating criteria take effect June 2026: games with paid random items default to PEGI 16 (some to PEGI 18), and other new interactive-risk categories cover time-limited purchase offers, blockchain/NFT mechanics and unrestricted player communication.`, asOf:'2026-09-24', src:'https://pegi.info/news/pegi-expands-age-rating-criteria-interactive-risk-categories' }
]);
T('store-presence',{ d:'platforms', t:'Store pages, pricing and getting paid', tag:'The store page sells the game before the game does, and the pricing and revenue terms decide what that sale is worth.',
  what:`Everything that turns a finished build into a listing someone can buy: the required capsule and screenshot assets, a Coming Soon page that opens wishlisting before launch, pre-orders or pre-registration campaigns, base and regional pricing with each store’s discount rules, the store’s cut of revenue, and the payout and tax setup behind the money arriving. Revenue share is not one number: Steam is reported to use tiers that fall as lifetime revenue rises, Apple splits standard sales from qualifying subscriptions and its Small Business Program, Google’s fee is mid-transition and differs by region, Microsoft Store on PC is a flat rate, Epic gives the first slice of revenue back entirely before splitting the rest, and most console shares are not published at all.`,
  why:[`The store page is judged before the game is played, so its assets and copy carry weight the build itself has not earned yet.`,`Wishlists and pre-orders convert attention gathered before launch into day-one volume; a page that opens late wastes that runway.`,`Revenue share and payout timing are cash-flow facts a small team has to plan around, not footnotes to check after the money is due.`,`A tax interview blocks the first payout on most stores, so leaving it late delays money that has already been earned.`],
  think:{ q:[`Does the page open with enough runway to build a wishlist before launch?`,`Which discount and price-change rules does this store enforce, and do our planned promotions fit them?`,`What does this store’s revenue share pay us at our expected volume?`,`Who owns the tax interview and bank details, and when do they need to be filed?`],
    trade:[`Opening Coming Soon early builds more wishlists but locks in page language before the game may be finished.`,`A ship-everywhere pricing strategy is simpler to manage than one tuned per region, but it leaves money and access on the table in cheaper markets.`],
    traps:[`Writing the store page after the build is done instead of alongside it.`,`Discounting inside a store’s no-discount window after a price change or launch sale.`,`Assuming a console’s revenue share matches the reported PC number.`,`Filing the tax interview after the first sale instead of before it.`],
    good:[`Wishlists climb visibly before the page needs to convert them.`,`The store page, the price and the discount plan match that store’s own rules.`],
    bad:[`The page goes up days before launch with no wishlist runway.`,`Payouts stall because the tax interview was never finished.`] },
  how:[`Build the store page assets (capsule art, screenshots, trailer) to each store’s exact required sizes and content rules.`,`Open Coming Soon or pre-registration with enough lead time to build wishlists before launch.`,`Set base pricing and check each store’s regional pricing tool and discount-timing rules before planning any sale.`,`Model revenue at your expected volume against that store’s actual share, not a headline number from a different store.`,`File the tax interview and bank details as soon as the account exists, not when the first payout is due.`],
  ai:{ yes:[`Draft store-page copy variants and capsule concepts for a human to choose between.`,`Summarise a store’s asset specs and discount rules into a checklist.`,`Model revenue at several price points against a store’s published share tiers.`],
       no:[`Decide the launch price or the wishlist-opening date.`,`Certify tax status or file the tax interview on the team’s behalf.`,`Promise a revenue number a store has not published.`] },
  prompts:[{l:'Store page checklist',p:`Here is the store we are launching on and our planned launch date: [CONTEXT]. List every required asset with its exact spec, the Coming Soon or pre-registration lead time this store expects, and the discount-timing rules that would affect a launch-week sale.`},{l:'Revenue model',p:`Here is our expected revenue by month for the first year and the store’s published fee structure: [CONTEXT]. Model take-home revenue against the store’s real tiers or fees, and flag any tier boundary a good launch could cross.`}],
  verify:[`Do the store assets match that store’s exact required sizes and content rules, not a generic set?`,`Does the discount or pricing plan respect that store’s own timing rules?`,`Is the tax interview complete before the first sale, not after?`],
  test:[`Show the finished store page to ten matched players with no other context. Do they know the price, the platform, and roughly when they could buy it?`],
  rel:[['ratings-and-disclosures',`The store page cannot go live until the rating and privacy answers behind it are filed.`],['launch-and-discoverability',`The store page is the asset discoverability work exists to fill.`],['business-model',`Regional pricing and each store’s revenue share decide what the business model can fund.`],['release-and-updates',`Coming Soon and pre-orders run out at the release button this topic hands off to.`]] });
TECH('store-presence',[
  {n:'Store asset kit', how:`Produce capsule art, screenshots and a trailer to the exact pixel sizes and content rules each store publishes (gameplay-only screenshots is a common rule).`, fit:`Every storefront listing, built once per store’s spec.`, cost:`Assets need updating whenever a store revises its spec or the game’s look changes.`, alt:`A single oversized master asset, cropped per store, when the specs are close enough.`},
  {n:'Coming Soon / wishlist funnel', how:`Open a store page ahead of launch so players can wishlist or pre-register, and track where that attention comes from.`, fit:`Any release with marketing runway before launch.`, cost:`Locks the page’s language and art before the game may be finished.`, alt:`Skip it and rely on launch-day discovery when there is no runway to build one.`},
  {n:'Regional pricing pass', how:`Use the store’s own regional pricing tool rather than one converted price, and check its discount-timing rules before planning any sale.`, fit:`Any store selling into more than one currency region.`, cost:`Ongoing upkeep as currencies and the store’s recommended prices drift.`, alt:`A single global price when regional tooling is not available or the catalogue is too small to justify tuning it.`}
]);
INTERVIEW('store-presence',{
  junior:[
    { q:`What is a Coming Soon page for?`,
      a:`It opens the store listing before the game is buyable so players can wishlist or pre-register, turning pre-launch attention into a measurable number that predicts and drives day-one sales.`,
      follow:`How far ahead of launch should it open?`,
      red:`Treats Coming Soon as a formality rather than a wishlist-building tool.` },
    { q:`Name two things that differ between stores' revenue share.`,
      a:`How the share changes with lifetime revenue (tiers that step down as revenue rises, versus a flat rate), and whether a program like a small-business rate or a limited-time full-revenue window applies. A number quoted for one store cannot be assumed for another.`,
      follow:`Our first game is unlikely to cross any tier boundary. Does the revenue share still matter to how we price it?`,
      red:`Quotes one store’s percentage as if it applied everywhere.` }
  ],
  mid:[
    { q:`Marketing wants a launch-week discount. What do you check before agreeing?`,
      a:`That store’s rules on discounting near a price change or a prior sale; several stores forbid or limit discounts for a window after a price increase or right after a launch discount ends. Confirm the exact window before committing to a date in a marketing plan.`,
      follow:`The rule blocks the exact week marketing wants. What do you propose instead?`,
      red:`Schedules the discount without checking the store’s own timing rules.` },
    { q:`You are choosing a launch price across three storefronts with different revenue shares. Walk through it.`,
      a:`Model expected revenue at each store’s real share and payout timing, not a single headline number, and account for regional pricing tools that may already localise the price for you. Treat the shares as inputs to the price and platform mix, not an afterthought calculated post-launch.`,
      follow:`One store’s share is not publicly documented. What do you do?`,
      red:`Uses one store’s percentage to model revenue on all three.` }
  ],
  senior:[
    { q:`A small team has to plan cash flow around store payouts. What do you tell them?`,
      a:`Map each store’s payout cadence and any minimum threshold, and the tax interview or verification each requires before the first payout releases at all; treat the tax interview as a launch-blocking task, not paperwork done whenever there is time. Plan the runway assuming the slowest store’s timeline, not the fastest.`,
      follow:`One store’s payout is delayed past what the plan assumed. What breaks first?`,
      red:`Assumes all stores pay out on the same schedule.` },
    { q:`How do you decide whether a store’s revenue share changes your pricing or platform strategy?`,
      a:`Model your expected volume against the real tiers, not the headline rate, since most games never cross the boundary where a step-down matters; the bigger lever is usually regional pricing and discount timing, which apply to every sale rather than only ones near a tier edge. Say plainly which lever moves more money at your actual scale.`,
      follow:`The team wants to chase a full-revenue promotional window instead. What trade-off are they making?`,
      red:`Optimizes for a revenue-share edge case that the game will never reach.` }
  ] });
FACTS('store-presence',[
  { claim:`Steam’s revenue share is reported as 30% up to $10M in lifetime revenue, 25% from $10M to $50M, and 20% above $50M, counting packages, DLC, in-game sales and Marketplace fees together.`, asOf:'2026-09-24', src:'https://gameinformer.com/2018/11/30/valve-adjusting-revenue-share-for-steams-most-popular-games' },
  { claim:`Apple’s App Store commission is 30% standard, or 15% on auto-renewable subscriptions after a subscriber’s first year of paid service. Members of Apple’s Small Business Program (no more than $1 million in proceeds in the prior calendar year, or new to the App Store; enrolment required) pay 15% on paid apps and in-app purchases.`, asOf:'2026-09-24', src:'https://developer.apple.com/app-store/small-business-program/' },
  { claim:`Microsoft Store charges a 12% fee on games sold through its own commerce platform on PC (15% for apps), with no registration fee under its current onboarding flow.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/windows/apps/publish/get-started' },
  { claim:`Developers keep 100% of the first $1M in net revenue per product per year on the Epic Games Store (the threshold resets each January 1), then splits 88/12 above that; there is a recoupable $100 submission fee per game.`, asOf:'2026-09-24', src:'https://store.epicgames.com/en-US/news/epic-games-store-updates-revenue-share-keep-100-of-the-first-1m-per-product-per-year' },
  { claim:`Google Play’s new fee structure lowers the rate on a developer’s first $1M of annual earnings to 10%, plus a billing fee where it applies, phasing in by region: US/UK/EEA from 2026-06-30, Australia and Japan from 2026-09-30, South Korea from 2026-12-31, and the rest of the world from 2027-09-30.`, asOf:'2026-09-24', src:'https://support.google.com/googleplay/android-developer/answer/16954621' }
]);
T('release-and-updates',{ d:'platforms', t:'Release day, patches and early access', tag:'Release is a button on some stores and a scheduled, staged rollout on others; either way, the save has to survive what comes after.',
  what:`How a finished build goes live, and what happens the day after. Steam release is a manual button the developer presses; Apple and Google offer managed release with phased or staged rollouts instead. Xbox, Apple and Google review every update; Nintendo and PlayStation handle patches under NDA, so a day-one patch is normal but not instant. Pre-release testing differs by store: Steam runs demos as a separate linked app and Playtests as a separate App ID, while Apple has no store-listed demo or beta at all and routes both through TestFlight. Early-access-style programs exist under different names and different rules: Steam Early Access, Xbox Game Preview, Meta Quest’s Early Access label. Through all of it, a save file has to keep working across a version the player did not ask for.`,
  why:[`A release process a team has not rehearsed turns launch day into the first time anyone presses the real button.`,`Console certification applies to every update, so “just a quick patch” still costs a review cycle.`,`Promising a demo or a beta the platform does not support (a store-listed demo on Apple, for instance) is a plan that cannot ship as written.`,`A save-format change that is not versioned corrupts every player’s progress the moment the update goes out.`],
  think:{ q:[`Who presses release, and have they done it before on this store?`,`Does our day-one patch plan account for that platform’s update-certification turnaround?`,`If we want a demo or a beta, does this platform support a store-listed one, or does it route through something else?`,`Does every save-format change ship with a migration path for saves written by the previous version?`],
    trade:[`A staged or phased rollout catches a bad build before it reaches everyone, at the cost of a slower, less controllable launch moment.`,`Early access earns feedback and revenue sooner, and risks judging the game by an unfinished slice.`],
    traps:[`Planning a day-one patch without budgeting the console’s update-certification turnaround.`,`Announcing a demo on a platform that does not allow store-listed demos.`,`Shipping a save-format change with no version check, so an old save loads as if it were new and correct.`,`Treating “released” as the end of the checklist instead of the start of the update cadence.`],
    good:[`The person releasing has rehearsed the exact button or process on that store before launch day.`,`Every save file carries a version the game checks on load.`],
    bad:[`The team discovers the console’s update SLA the week they need a hotfix.`,`A day-one patch silently breaks saves from the review build.`] },
  how:[`Write down, per platform, exactly who presses release and what the mechanism is (manual button, managed release, phased or staged rollout).`,`Budget the platform’s real update-certification turnaround into any day-one or hotfix plan.`,`Pick the pre-release testing vehicle each platform supports (a linked demo App ID, TestFlight, a Playtest, a beta program) instead of assuming one pattern works everywhere.`,`Version the save format from day one and write the migration step before the format ever needs to change.`,`Decide, before launch, whether the game will run an early-access-style program, and match it to that platform’s specific rules.`],
  ai:{ yes:[`Draft a release-day runbook per platform from that platform’s documented process.`,`Draft patch notes and a migration checklist from a diff of what changed.`,`Generate test cases for a save-migration check across the last few format versions.`],
       no:[`Decide the release date or press the release button.`,`Assume one platform’s release mechanism describes another platform.`,`Certify that a save migration is safe without a test against real old saves.`] },
  prompts:[{l:'Release runbook',p:`We are releasing on these platforms: [PLATFORMS]. For each, write the exact release mechanism (manual, managed, phased or staged), who needs to act and when, and the realistic update-certification turnaround for a day-one patch.`},{l:'Save migration check',p:`Our save format changed from version {{OLD}} to {{NEW}}: [DIFF]. Write a migration step and a test plan that loads real saves from the old version and confirms nothing is lost.`}],
  verify:[`Does the release runbook match this platform’s actual mechanism, checked against its current documentation?`,`Is the day-one patch plan budgeted against the platform’s real certification turnaround, not an assumed one?`,`Does a save written by the previous version still load correctly after the update?`],
  test:[`Load a save created on the previous build after installing the update. Does the player continue exactly where they left off?`],
  rel:[['store-presence',`Coming Soon and wishlists run out at the release button or managed rollout this topic covers.`],['certification-and-review',`An update goes through a lighter pass of the same certification gate the first submission did.`],['live-operations',`Day-one patches are the first live-operations work, on the platform’s own clock.`],['pm-qa-release',`Release trains and build-health gates on other platforms follow the same discipline this topic asks for on stores.`]] });
TECH('release-and-updates',[
  {n:'Manual release button', how:`The developer presses a single action (Steam’s Release App) once the store page and build are both approved.`, fit:`Stores where the developer, not the platform, controls the exact release moment.`, cost:`Nothing releases if the person with access is unavailable.`, alt:`A managed or scheduled release where the platform releases the build at a set date once approved.`},
  {n:'Phased / staged rollout', how:`Roll an update out to a small percentage of the install base first, then widen it if nothing regresses (Apple’s phased release ramps over about a week and can be paused).`, fit:`Any update where a silent regression would be expensive to reach every player at once.`, cost:`Slower to reach full distribution, and needs someone watching the early percentage.`, alt:`A full, immediate release when the update has already been validated in a beta or Early Access ring.`},
  {n:'Save-version migration check', how:`Store a version number with the save and run a migration step on load whenever the stored version is older than the game’s current one.`, fit:`Any game whose save format will ever change.`, cost:`Every format change needs a written migration path, not just a new writer.`, alt:`A full save-format freeze, accepting that no future save layout change is possible.`}
]);
ENGINE('release-and-updates',{
  godot:{ term:`Godot keeps two version strings that matter to a release: the project’s own application/config/version, and the export preset’s own version fields (for example the Android export’s version code and name), which is what the store reads. Neither one tells you whether a player’s save file is still readable; that needs its own stored version, checked and migrated on load.`,
    api:['ProjectSettings.get_setting("application/config/version")','ConfigFile.load / get_value','Export preset version fields (Android version code/name, etc.)'],
    snippet:`extends Node
const SAVE_VERSION := 3
func _ready() -> void:
\tvar build: String = ProjectSettings.get_setting("application/config/version", "0")
\tvar cfg := ConfigFile.new()
\tif cfg.load("user://save.cfg") != OK:
\t\treturn
\tvar saved: int = cfg.get_value("meta", "version", 1)
\tif saved < SAVE_VERSION:
\t\t_migrate(saved, build)
func _migrate(from_v: int, build) -> void:
\tprint("save v", from_v, " -> v", SAVE_VERSION, " (build ", build, ")")`,
    pitfall:`Bumping only the export preset’s platform version fields (what the store shows) without also touching application/config/version (what the game itself reports), so the in-game version and the store listing disagree; or shipping a save-format change with no stored version at all, so an old save loads as if it already matched the new layout.`,
    map:`Godot’s application/config/version plus its export-preset version fields are Unity’s PlayerSettings.bundleVersion plus its per-platform build-number fields.` },
  unity:{ term:`Unity separates the human-readable version players see (PlayerSettings.bundleVersion, which also sets Application.version at runtime) from the per-platform build numbers stores use to order submissions (Android’s bundleVersionCode must rise with every upload, and iOS’s buildNumber must be new within each version). A save-format version, stored with the save itself, is a separate check the engine does not provide for you.`,
    api:['PlayerSettings.bundleVersion','PlayerSettings.Android.bundleVersionCode','PlayerSettings.iOS.buildNumber','Application.version','PlayerPrefs.GetInt/SetInt'],
    snippet:`public class SaveMigrator : MonoBehaviour {
    const int SaveVersion = 3;

    void Awake() {
        int saved = PlayerPrefs.GetInt("save_version", 1);
        if (saved < SaveVersion) Migrate(saved);
    }

    void Migrate(int from) {
        Debug.Log("save v" + from + " -> v" + SaveVersion +
            " (build " + Application.version + ")");
        PlayerPrefs.SetInt("save_version", SaveVersion);
    }
}`,
    pitfall:`Incrementing bundleVersion (the marketing-facing version) while forgetting the platform build number (bundleVersionCode or buildNumber), which most stores reject as a duplicate or lower build; or changing what a save stores without a version check, so the old save loads into code that expects the new shape and fails or silently drops data.`,
    map:`Unity’s PlayerSettings.bundleVersion plus its per-platform build-number fields are Godot’s application/config/version plus its export-preset version fields.` }});
INTERVIEW('release-and-updates',{
  junior:[
    { q:`What is different about pressing “release” on Steam versus on the App Store?`,
      a:`Steam release is a manual action the developer takes once the store page and build are both approved; nothing goes live until that button is pressed. Apple offers a managed release option and a phased rollout that ramps up over about a week instead of one instant switch.`,
      follow:`Who on the team should have access to press that button, and why does that matter?`,
      red:`Assumes every store releases the same way once approved.` },
    { q:`Why can a “quick patch” still take a few days on a console?`,
      a:`Console updates go through the same certification process as the original submission, just usually with a shorter turnaround, so even a one-line fix has to clear that queue before players see it.`,
      follow:`What would you do differently if you knew a fix had to ship the same day?`,
      red:`Assumes a patch can go out the moment it is built, with no review step.` }
  ],
  mid:[
    { q:`The team wants a public demo on every platform we ship to. What do you tell them?`,
      a:`That the mechanism differs by store: some allow a store-listed demo as its own linked App ID, while others do not allow a store-listed demo or beta at all and expect you to route testers through their own program instead. The plan has to be written per platform, not assumed from whichever one you know best.`,
      follow:`One platform on our list has no store-listed demo option. What do we offer players there instead?`,
      red:`Assumes the same demo plan works unchanged on every store.` },
    { q:`A balance patch changes how the save file is structured. What do you check before it ships?`,
      a:`That the save carries a version number the game checks on load, and that a migration path exists from every version still in the wild to the new one; then you load an old save through the new build before calling it done, rather than trusting the migration code by inspection alone.`,
      follow:`A player’s save is two versions behind the current one. Does your migration path handle that?`,
      red:`Ships the save-format change and assumes existing saves will “probably still work”.` }
  ],
  senior:[
    { q:`Design the release runbook for a simultaneous multi-platform launch. What does it have to account for?`,
      a:`Each platform’s actual release mechanism (manual, managed, phased, staged), its realistic certification turnaround for the initial submission and for the day-one patch you should assume you will need, who has the access to act on each platform, and a rollback or pause plan for the platforms that support one. Treat the slowest platform’s timeline as the one the whole launch date has to respect.`,
      follow:`One platform’s certification queue backs up two days before launch. What is the fallback?`,
      red:`Plans the launch date around the fastest platform and hopes the others keep pace.` },
    { q:`How do you decide whether to run an early-access-style program, and does that decision change per platform?`,
      a:`Yes: the same intent (release unfinished, gather feedback, earn revenue sooner) has different rules depending on the label, so the decision has to be made per platform against that platform’s specific constraints on pricing parity, feature completeness and how the program is marked to players, not as one blanket choice for the whole release.`,
      follow:`A platform’s early-access label cannot be turned off once set. Does that change your recommendation?`,
      red:`Treats early access as one uniform program that transfers unchanged across platforms.` }
  ] });
FACTS('release-and-updates',[
  { claim:`Xbox certification SLAs are: digital base final 4 business days (Fastlane 48 hours), digital content update 2 business days (Fastlane 24 hours), and disc submission 5 business days.`, asOf:'2026-09-24', src:'https://learn.microsoft.com/en-us/gaming/game-publishing/concepts/certification/certification-guide' },
  { claim:`Apple’s phased release ramps an update over about 7 days in steps of roughly 1%, 2%, 5%, 10%, 20%, 50% and 100% of users who have automatic updates on, and can be paused for up to 30 days in total.`, asOf:'2026-09-24', src:'https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases' },
  { claim:`On the Meta Horizon Store, a binary uploaded to the Production release channel updates immediately and without review, while metadata changes are reviewed and usually take 1 to 2 business days.`, asOf:'2026-09-24', src:'https://developers.meta.com/horizon/resources/publish-after-sub/' },
  { claim:`Steam Early Access requires the game to be playable at the time of listing, forbids specific promises about future updates, and requires the price not exceed what it costs on other stores, with release on Steam no later than anywhere else.`, asOf:'2026-09-24', src:'https://partner.steamgames.com/doc/store/earlyaccess' }
]);
T('ugc-platforms',{ d:'platforms', t:'UGC platforms: Roblox and Fortnite', tag:'On a UGC platform the engine, the servers, the store and the audience all belong to someone else. You trade control for reach.',
  what:`Building a game inside another company’s platform instead of shipping your own build to a store. Roblox and Fortnite (through Unreal Editor for Fortnite, UEFN) each give you an editor, a scripting language (Luau on Roblox, Verse on Fortnite), hosted multiplayer servers, moderation, a currency and a discovery feed, in exchange for building only what their runtime allows and earning inside their economy. There is no console-style certification and no dev kit; the gates are instead identity and age checks on the creator, a content questionnaire or rating that decides which players can see the game, a moderation review (of every release on Fortnite), and a recommendation system that decides whether anyone does. Fortnite is the one library entry that is also a platform: the same client a player queues into for Battle Royale is the runtime a UEFN creator’s island runs inside, so playing the game and opening the platform are the same download.`,
  why:[`The platform’s audience is already there and already paying, so a small team can reach players in numbers no store launch would give it, if the game holds them.`,`Discovery is almost entirely algorithmic and engagement-driven, so retention and the first minute of play decide distribution more than marketing spend does.`,`The platform owns the rules, the revenue split and the payout programme, and it changes them often, so a business plan built on today’s numbers needs a dated source and a review date.`,`Everything is multiplayer and the server owns the game state by default, so the architecture questions of a live online game arrive on day one, not after launch.`],
  think:{ q:[`Does our game fit what the platform’s runtime and audience reward, or are we fighting both?`,`Which age tiers can see the game, and what does reaching the youngest players require of us as creators?`,`What does the server validate when a client asks for something, and what could an exploiter send instead?`,`How does money reach us: which products, which share, which payout programme and which threshold?`,`What do the first 60 seconds do to keep a new player, since that is what the recommendation system measures?`],
    trade:[`Building on a UGC platform gives reach, servers and payments for free and costs control: no own store page, no own price for the platform currency, and rules that can change under a live game.`,`Chasing the youngest audience widens reach and adds identity checks, fees, an evaluation and stricter content limits.`,`Server-authoritative movement stops a class of cheats and costs latency hiding and a stricter code structure.`],
    traps:[`Trusting anything a client sends because the game is “just a Roblox game”.`,`Hard-coding prices when regional pricing and subscriber discounts mean players see different ones.`,`Quoting last year’s payout programme or revenue share as if it were current.`,`Keyword-stuffing the title and description, which the platforms demote.`,`Treating an update as instant when old servers keep running old code.`],
    good:[`New players stay past the first minute and come back on day one, and distribution widens after each update.`,`Every purchase is granted on the server only after it is saved, and nothing is lost on a crash.`],
    bad:[`A high bounce rate in the first minute and exposure that shrinks after every update.`,`An exploit that grants currency by firing a remote with a forged argument.`] },
  how:[`Pick the platform whose runtime and audience fit the game, and read its current publishing requirements before you plan the release date.`,`Put all authority on the server from the first prototype: clients send intents, the server checks permission, type, value, plausibility and rate.`,`Complete the content questionnaire honestly for the most extreme content a player can meet, and retake it whenever an update changes an answer.`,`Grant purchases only in the platform’s server-side receipt handler, after the grant is saved, and read live prices instead of hard-coding them.`,`Measure the first minute, day-one retention and session length before spending on acquisition.`,`Keep a dated list of the programme rules and revenue shares the business depends on, and recheck it every quarter.`],
  ai:{ yes:[`Draft Luau or Verse boilerplate, remote validation and receipt-handling code for a human to review and test.`,`Summarise a platform’s current publishing and payout documentation into a checklist with dates.`,`Generate title, description and thumbnail variants for an A/B test.`],
       no:[`Decide which age tiers the game should target, or answer the content questionnaire.`,`Ship code that grants currency or items without a human reading the server-side checks.`,`Claim a revenue share or threshold without a dated official source.`] },
  prompts:[{l:'Remote validation review',p:`Here is a server handler for a client request in our Roblox game: [CODE]. List every argument an exploiter could forge, and for each the check the server needs (permission, type, value, range, rate). Do not add checks for state the server already owns.`},{l:'Publishing checklist',p:`Here is what the platform’s current publishing page says: [PASTE]. Turn it into a checklist with the account, age, questionnaire and fee steps in order, and mark every number as dated to today.`}],
  verify:[`Does every remote or device call that changes game state get validated on the server?`,`Are purchases granted only after the grant is saved, with a retry path if saving fails?`,`Is every revenue share and threshold in the plan backed by a dated official source?`],
  test:[`Watch five new players join with no instructions. How many are still playing after one minute, and what were the ones who left doing at the moment they left?`],
  rel:[['platform-choice',`A UGC platform is a platform choice that also picks the engine, the language and the audience.`],['server-authority',`The server owns game state on both platforms; on Roblox, clients still simulate their own character and nearby parts unless Server Authority mode is on.`],['server-anticheat',`Exploiters on a UGC platform fire remotes directly, so validation is the anti-cheat.`],['launch-and-discoverability',`Discovery on these platforms is engagement-ranked, so the first minute is the launch.`],['business-model',`The platform currency, its revenue shares and its payout programmes are the business model’s hard limits.`],['ratings-and-disclosures',`A content questionnaire decides which age tiers can see the game.`]] });
DIAGRAM('ugc-platforms', { kind:'matrix', title:'Roblox, Fortnite or your own game on a store',
  rows:['Engine and language','Servers','Who can publish','Money','Found through'], cols:['Roblox','Fortnite (UEFN)','Own game'],
  cells:[['Studio, Luau','UEFN, Verse','Any engine'],['Roblox hosts','Epic hosts','You run them'],['Age-checked creators','Adults in the program','Per store'],['Robux, cashed out','Pool and V-Bucks','Your price, store cut'],['Home feed','Discover rows','Store page, marketing']] });
TECH('ugc-platforms',[
  {n:'Server-validated remotes', how:`Clients send intents through RemoteEvents; the server checks permission, type, value, plausibility and rate before changing state. On Fortnite, players reach your Verse code only through device events, so check who triggered the event and whether the game state allows it.`, fit:`Every UGC game, from the first prototype.`, cost:`More server code and a round trip before the client sees the result.`, alt:`Server Authority mode on Roblox, which moves movement and physics to the server with client prediction and rollback.`},
  {n:'Config-gated releases', how:`Ship content early behind a server-side config and switch it on at the release moment, so the update and the event are separate.`, fit:`Timed events and launches where old and new servers run side by side.`, cost:`Config state to manage, and dead content in the build until it is switched on.`, alt:`Restart all servers at release, which interrupts every active session.`},
  {n:'First-minute funnel', how:`Instrument the join, the first action and the first reward, and cut or reorder anything that delays them, since bounce in the first minute is a ranking signal.`, fit:`Any game that depends on recommendation feeds for players.`, cost:`Analytics work before content work, and a tutorial rethought as the first seconds of play.`, alt:`Buying players through sponsored placement, which still ends in the same first minute.`}
]);
INTERVIEW('ugc-platforms',{
  junior:[
    { q:`What is the difference between a Script, a LocalScript and a ModuleScript on Roblox?`,
      a:`A Script runs on the server by default, a LocalScript runs only on one player’s client, and a ModuleScript is shared code that runs wherever it is required. Game state lives in server Scripts; LocalScripts handle input and UI and ask the server to act.`,
      follow:`Where would you put the code that awards coins for finishing a level, and why?`,
      red:`Awards currency from a LocalScript.` },
    { q:`Why should a Roblox server never trust what a client sends through a RemoteEvent?`,
      a:`An exploiter controls their own client and can fire any remote at any rate with any arguments, so the server checks who is asking, the argument types and values, whether the request is plausible, and how often it arrives.`,
      follow:`A client asks to buy an item and sends its price. What does the server use instead?`,
      red:`Validates only on the client.` }
  ],
  mid:[
    { q:`How do you grant a developer product purchase safely?`,
      a:`In MarketplaceService.ProcessReceipt on the server: save the grant first, return PurchaseGranted only after the save succeeds, and return NotProcessedYet otherwise so Roblox retries on the player’s next purchase or next join. Never grant from PromptProductPurchaseFinished, which does not prove the purchase succeeded.`,
      follow:`The data store call fails halfway through a busy weekend. What does the player see, and when do they get the item?`,
      red:`Grants the item before saving, or grants on the client.` },
    { q:`Your Roblox game’s exposure shrank after the last update. Where do you look first?`,
      a:`The ranking signals Roblox names: play-through rate, first-play bounce, play days and playtime per player, comparing the cohort after the update with the one before. An update that slowed the first minute or broke a returning player’s save shows up there before revenue does.`,
      follow:`Bounce rose but session length for those who stayed also rose. What changed?`,
      red:`Answers only with buying more ads.` },
    { q:`What changes when you move from Roblox to Fortnite’s UEFN?`,
      a:`You build at a higher level: Epic hosts the servers, characters and weapons, gameplay is composed from devices, and Verse covers what devices cannot. Publishing needs the adult-only Fortnite Developer Program, and money comes mainly from an engagement payout pool rather than direct sales.`,
      follow:`Which kinds of game are easier on Fortnite, and which are harder?`,
      red:`Treats the two as the same platform with a different language.` }
  ],
  senior:[
    { q:`A studio wants to build its next game on Roblox instead of shipping on Steam. What do you want them to decide first?`,
      a:`Whether the game fits what Roblox’s audience and runtime reward (mobile-first, multiplayer, short sessions, engagement-ranked discovery), which age tiers it targets and what that demands of the creator account, and whether the business works on the platform’s current shares and payout programmes, checked against dated sources. Also who owns the game: a group, with payout terms agreed in writing.`,
      follow:`The payout programme the plan relies on changes six months after launch. What protects the studio?`,
      red:`Plans the business on revenue numbers remembered from an old article.` },
    { q:`How do you ship updates to a live UGC game without losing players or data?`,
      a:`Keep saves backward-compatible because old servers keep running old code; gate timed content behind configs; restart only outdated servers with a delay and a countdown; and watch day-one retention and bounce for the post-update cohort, since recommendation reach widens or shrinks on it.`,
      follow:`The update must change the save format. How do you roll it out?`,
      red:`Restarts every server at once with no migration plan.` }
  ] });
FACTS('ugc-platforms',[
  { claim:`Roblox accounts are split into Roblox Kids (5 to 8), Roblox Select (9 to 15) and Roblox (16 and over), and a game must pass an evaluation before under-16s can see it.`, asOf:'2026-09-24', src:'https://create.roblox.com/docs/production/publishing/kids-and-select' },
  { claim:`Roblox’s Developer Exchange pays $0.0038 per Earned Robux for Robux earned from 2025-09-05 (older balances cash out at $0.0035), and needs age 13 or over and at least 30,000 Earned Robux.`, asOf:'2026-09-24', src:'https://create.roblox.com/docs/production/monetization/developer-exchange' },
  { claim:`Fortnite’s Engagement Pool receives 40% of eligible net revenue from the Item Shop and related real-money purchases.`, asOf:'2026-09-24', src:'https://dev.epicgames.com/documentation/en-us/fortnite/engagement-payout-in-fortnite-creative' },
  { claim:`Fortnite creators receive 50% of the V-Bucks value of in-island sales, raised to 100% from 2026-01-09 through 2027-01-31.`, asOf:'2026-09-24', src:'https://dev.epicgames.com/documentation/en-us/fortnite/in-island-transactions-overview-in-fortnite' }
]);
