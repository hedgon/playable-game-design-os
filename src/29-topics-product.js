/* =====================================================================
   PRODUCT
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'product', lens:'design', t:'Product', short:'Audience, platform, model, positioning, scope', color:'var(--d-product)',
    sum:`Who will pick this up, on what device, for how long, and why yours instead of the thousand others. Product thinking keeps design honest about scope and about what makes the game distinct.`,
    links:[['player','Audience is the player model seen through a market lens.'],['production','Scope, platform and business model set every production constraint.'],['systems','Session length and monetisation shape economy and progression.'],['experience','Positioning is a promise about the experience. The game must keep it.']] });

T('audience-and-positioning',{ d:'product', t:'Audience, positioning and differentiation', tag:'Why yours, instead of the thousand others? Answer in one sentence or you do not know yet.',
  what:`The market-facing statement of the player and the promise: who the game is for, what it does that the alternatives do not, and how a stranger would recognise that in ten seconds. Wordle’s promise is one small solvable thing a day, shared with everyone else doing the same one, and its three-colour result survives being turned into a line of emoji, so it travels as plain text. Positioning is the fantasy plus the differentiator, stated for someone who has not played.`,
  why:[`Discovery is the main failure mode of finished games. A game nobody can describe is a game nobody recommends.`,`Positioning is the scope filter seen from outside: features that do not sharpen the sentence dilute the product.`,`A differentiator that is invisible in the first ten seconds of a trailer or the first ten minutes of play does not exist for the market.`],
  think:{ q:[`Complete: “For [PLAYER] who [WANTS], this is the game that [DIFFERENTIATOR], unlike [ALTERNATIVES].”`,`Is the differentiator visible in a screenshot? A trailer? The first ten minutes?`,`Which existing games will I be compared to? What do their players complain about?`,`Is the differentiator a feature or an experience? Experiences travel further by word of mouth.`],
    trade:[`Sharp positioning attracts a niche strongly and excludes the rest.`,`Genre-standard positioning is safe to explain and easy to ignore.`],
    traps:[`“It is X meets Y” where the meeting point is not the experience.`,`Differentiating on features the player only meets after ten hours.`,`Positioning written by marketing after the design is fixed.`],
    good:[`Playtesters describe the game the way the positioning does, without seeing it.`,`Strangers ask the right question after seeing one screenshot.`,`Players campaign for the game before it is even offered to them, as Operation Rainfall did in 2011 for Xenoblade Chronicles in North America.`],
    bad:[`Every description starts with the genre and ends with a feature list.`] },
  how:[`Write the positioning sentence. Test it on strangers: what do they expect? Compare with the game.`,`Check the differentiator is in the first ten minutes of play and in one screenshot.`,`Mine the complaints about comparable games for a differentiator players already want.`,`Use the sentence as a gate: features that do not sharpen it wait.`,`If one game must serve a party and a tournament, ship the competitive ruleset as a menu option, as Super Smash Bros. for Nintendo 3DS and Wii U did with its item-free For Glory mode, rather than choosing one audience in the core rules.`],
  ai:{ yes:[`Generate positioning candidates from the fantasy and comparable games.`,`Mine reviews of comparables for unmet wants.`,`Check a feature list against the positioning and flag dilution.`],
       no:[`Choose the positioning. It is strategy.`,`Estimate market size with confidence it does not have.`] },
  prompts:[{l:'Positioning stress test',p:`Our positioning is: “[SENTENCE]”. Comparable games: [LIST]. Act as a sceptical publisher. Is the differentiator visible in a screenshot and in the first 10 minutes of the described flow ([FLOW])? Which comparable already delivers it? What would a player of each comparable say when they hear the sentence? Propose 3 sharper alternatives grounded in what players of the comparables complain about, and state what each alternative would force us to cut.`}],
  verify:[`Did it flatter the positioning or test it?`,`Are the complaints it cites real and sourced, or plausible inventions?`],
  test:[`Show strangers one screenshot and the sentence. Ask what they expect. Compare.`,`After a first session, ask testers to describe the game to a friend. Compare with the sentence.`],
  rel:[['who-is-the-player','Positioning is the player model for the market.'],['core-experience','The promise must match the experience.'],['platform-and-session','Where and how long they play is part of who they are.'],['scope-control','Positioning is the external scope filter.'],['business-model','Model and positioning must agree.'],['pitching-and-stakeholders','The positioning sentence is the core of a pitch.']] });
TECH('audience-and-positioning',[
  {n:'Positioning sentence', how:`For [player] who [want], this is the game where you [verb] …, unlike [comparables].`, fit:`A testable promise and a marketing line.`, cost:`Vague positioning hides a vague game.`, alt:`Test it on strangers. Count questions and wish-to-play.`},
  {n:'Comparison set and differentiation', how:`Name the games you will be judged against and the visible reason to pick yours.`, fit:`Making differentiation explicit.`, cost:`“Like X but better” is not differentiation.`, alt:`Use Reference Dissection.`}
]);
ENGINE('audience-and-positioning',{
  godot:{ term:`The claim gets tested against frames the build produced. A capture key writes the viewport to a PNG in user://, and an export preset feature tag marks the ten-minute slice you show strangers.`,
    api:['Viewport.get_texture().get_image()','Image.save_png()','RenderingServer.frame_post_draw','OS.has_feature() + export preset custom features','OS.get_user_data_dir()','Time.get_ticks_msec()'],
    snippet:`extends Node                                   # capture the differentiator from the build

func _unhandled_input(e: InputEvent) -> void:
\tif e.is_action_pressed("capture"):
\t\t_shot()

func _shot() -> void:
\tawait RenderingServer.frame_post_draw      # without this the image is black or stale
\tvar img := get_viewport().get_texture().get_image()
\timg.save_png("user://capsule_%d.png" % Time.get_ticks_msec())`,
    pitfall:`Grabbing the viewport texture in the same frame you asked for it. The GPU has not finished drawing, so you get a black image or the previous frame, and the screenshot you take to the positioning test shows the wrong moment. Await RenderingServer.frame_post_draw first.`,
    map:`Godot viewport capture plus export feature tags is Unity ScreenCapture plus scripting define symbols.` },
  unity:{ term:`ScreenCapture at end of frame for the capsule candidates, and a build profile with its own define for the slice you put in front of strangers. Both come from a player build, not the editor’s game view.`,
    api:['ScreenCapture.CaptureScreenshotAsTexture() / CaptureScreenshot()','WaitForEndOfFrame','Texture2D.EncodeToPNG()','Application.persistentDataPath','Scripting Define Symbols / BuildProfile','Screen.SetResolution()'],
    snippet:`public class CapsuleCapture : MonoBehaviour {
    IEnumerator Shot() {
        yield return new WaitForEndOfFrame();      // otherwise the frame is half drawn
        var tex = ScreenCapture.CaptureScreenshotAsTexture();
        var path = Path.Combine(Application.persistentDataPath,
                                "capsule_" + Time.frameCount + ".png");
        File.WriteAllBytes(path, tex.EncodeToPNG());
        Destroy(tex);
    }

    void Update() {
        if (Keyboard.current.f12Key.wasPressedThisFrame) StartCoroutine(Shot());
    }
}`,
    pitfall:`Capturing outside WaitForEndOfFrame, and forgetting to Destroy the returned Texture2D. You get a partially drawn frame and a leak of one full-resolution texture per press, which is enough to kill a capture session on a phone. Capture at end of frame and dispose what you were handed.`,
    map:`Unity ScreenCapture plus build profiles is Godot viewport capture plus export presets with feature tags.` }});
INTERVIEW('audience-and-positioning',{
  junior:[
    { q:`Give me the positioning sentence for a game you know well.`,
      a:`Use the shape: for this player who wants this, it is the game that does this, unlike these alternatives. Name the alternatives honestly, because the sentence only means something against them. Then say whether the differentiator would be visible in one screenshot.`,
      follow:`Is that differentiator visible in the first ten minutes, or only after ten hours?`,
      red:`Answers with a genre label and a feature list.` },
    { q:`Why does it matter whether your differentiator is a feature or an experience?`,
      a:`Experiences travel by word of mouth because a player can describe how it felt in a sentence. Features have to be listed, compared and usually met after hours of play. A feature differentiator also gets copied faster than an experience does.`,
      follow:`Give an example of each from games you play.`,
      red:`Names a bullet from the store page and calls it positioning.` },
    { q:`What can you learn from the complaints about comparable games?`,
      a:`They show wants the audience has that nothing currently serves, which is a differentiator someone has already demonstrated demand for. Read reviews and forums for the recurring ones rather than the loudest ones. Then check whether answering that complaint is something your design can do.`,
      follow:`How do you tell a genuine unmet want from a vocal minority’s preference?`,
      red:`Treats their own dislikes as the market’s complaints.` }
  ],
  mid:[
    { q:`Your differentiator only becomes visible after ten hours. What do you do?`,
      a:`For the market it does not exist, so you have three options: pull it forward into the first ten minutes, reposition on something that is visible, or accept it and find a different hook for the store page. Pick by cost and by whether the earlier version still represents the game honestly. Test the new sentence on strangers before committing.`,
      follow:`Pulling it forward means rebuilding a system. How do you decide?`,
      red:`Assumes the trailer can convey what the game cannot show in ten minutes.` },
    { q:`How do you use positioning as a scope gate?`,
      a:`Every candidate feature has to sharpen the sentence. If it does not, it waits, because it dilutes the thing that makes the game findable and describable. Run the backlog against the sentence on a fixed cadence, and keep the list of things it excluded so the decisions are visible.`,
      follow:`A well-liked feature dilutes the sentence. How do you handle that conversation?`,
      red:`Keeps the sentence as a marketing artifact and never applies it to the backlog.` },
    { q:`How do you test positioning cheaply?`,
      a:`Show strangers one screenshot and the sentence and ask what they expect the game to be. Then, after a first session, ask testers to describe the game to a friend and compare with your sentence. The gap between what the sentence promises and what the play delivers is the finding.`,
      follow:`Testers describe a different game than the sentence. What does that mean?`,
      red:`Surveys existing fans, who already know what the game is.` }
  ],
  senior:[
    { q:`A publisher wants the positioning widened to reach more players. How do you respond?`,
      a:`Explain what sharp positioning buys: a niche that recommends you and a sentence people can repeat. Widening usually means the differentiator stops being visible, which is the failure mode that kills games. Bring the stranger test results, offer a version that widens the audience without softening the hook, and be clear about what you would cut instead.`,
      follow:`They control the funding and they are not persuaded. What do you do?`,
      red:`Widens the sentence on request and stops testing it.` },
    { q:`Three years in, a comparable ships your differentiator. Now what?`,
      a:`Re-dissect it and find what they delivered versus what they announced, because the gap is usually the opportunity. Look at the complaints their version generates and position against those. If nothing remains, say so early rather than shipping into a space someone else owns, and name what would have to change for the project to still make sense.`,
      follow:`What evidence would make you recommend cancelling?`,
      red:`Adds more features to out-scope the competitor.` }
  ] });

T('platform-and-session',{ d:'product', t:'Platform, session length and context', tag:'Where and for how long decides pacing, input, readability and save design before you draw a level.',
  what:`The physical and temporal frame of play: device, input method, screen size and distance, typical session length, interruption pattern, and whether play is continuous or in bursts. These are design constraints, not afterthoughts. Subway Surfers is a phone game whose run reduces every decision to which of three lanes and whether to jump or roll. Wordle fits the session as well as the device: it asks for one move a day, not a sitting.`,
  why:[`A loop that needs 20 minutes to become interesting fails on a platform where sessions are 5.`,`Input precision decides which skills you can demand.`,`Screen size and distance decide how much information the player can read.`],
  think:{ q:[`What is the median session? What must be satisfying inside it?`,`How does a session end: at a natural stopping point, or by interruption? Does the game survive interruption?`,`What can the player see and press on this device, in this posture?`,`Which platform conventions does the player expect? Which will I break, and why?`],
    trade:[`Designing for the smallest session includes more contexts and caps depth per session.`,`Multi-platform reach widens the audience and forces lowest-common-denominator input and readability.`],
    traps:[`Testing on a monitor, shipping on a phone.`,`Sessions that only end at boss fights.`,`Save systems designed after the levels.`],
    good:[`Players finish a satisfying unit inside a typical session.`,`Players quit at natural points and resume without friction.`],
    bad:[`Players lose progress to interruptions or say “I never have time to get anywhere”.`] },
  how:[`Write the session profile: median length, interruption pattern, device, posture.`,`Define the satisfying unit that fits inside the median session. Structure the game around it.`,`Design saving and resuming as core features.`,`Test on the target device, in the target posture, with realistic interruptions.`],
  ai:{ yes:[`Audit a level and progression plan against the session profile.`,`Propose session-unit structures for a given loop and length.`,`Check readability and input demands against device constraints.`],
       no:[`Choose the platform. That is strategy.`] },
  prompts:[{l:'Session fit audit',p:`Session profile: median [MINUTES], interruptions every [MINUTES], device [DEVICE], posture [POSTURE]. Here is our level and progression plan: [PLAN]. Identify the satisfying unit that fits inside a median session, or state that none does. Flag stretches that cannot be interrupted safely and skills that exceed the input precision of the device. Propose the smallest restructuring that gives every session a complete unit.`}],
  verify:[`Did it account for the actual device constraints, or assume a desktop?`],
  test:[`Log real session lengths and end reasons.`,`Test with interruptions: what is lost?`,`Test on device and at distance.`],
  rel:[['goals-horizons','The session goal must fit the session.'],['readability-and-hierarchy','Screen and distance set readability.'],['controls-and-friction','Input method sets skill demands.'],['return-and-quit','Interrupted sessions are a churn source.'],['platform-choice','Which platforms to ship on first, and what each costs to reach.']] });
TECH('platform-and-session',[
  {n:'Session-shape design', how:`Design the loop and save points around the session length players on that platform have, taken from your own telemetry or a comparable’s, not from a rule of thumb.`, fit:`Every platform choice. Drives structure, save and pacing decisions.`, cost:`Multi-platform support forces compromises and separate tuning.`, alt:`Pick a lead platform and design to its session shape first.`},
  {n:'Input and posture fit', how:`Match control scheme, text size and UI density to the device and posture (one thumb, controller, desk).`, fit:`Readability and friction. Mobile especially.`, cost:`Porting UI is not free. Needs redesign, not scaling.`, alt:`Design for the tightest target and expand outward.`},
  {n:'Platform services integration', how:`Achievements, cloud saves, multiplayer services, and store requirements.`, fit:`Certification and expected features per platform.`, cost:`Certification and per-platform work. Late integration is a common slip.`, alt:`Plan services integration as production scope, not a polish task.`}
]);
ENGINE('platform-and-session',{
  godot:{ term:`The session profile becomes notification handling. The resume point is written when the OS pauses the app or the back button is pressed, because on a handheld those are the only moments you are guaranteed.`,
    api:['Node._notification()','NOTIFICATION_APPLICATION_PAUSED / NOTIFICATION_APPLICATION_FOCUS_OUT','NOTIFICATION_WM_GO_BACK_REQUEST / NOTIFICATION_WM_CLOSE_REQUEST','SceneTree.auto_accept_quit / quit_on_go_back','DisplayServer.screen_get_dpi()','FileAccess + JSON for the resume point'],
    snippet:`extends Node

func _ready() -> void:
\tget_tree().auto_accept_quit = false        # a window close no longer quits by itself
\tget_tree().quit_on_go_back = false         # nor does the Android back button
func _notification(what: int) -> void:
\tmatch what:
\t\tNOTIFICATION_APPLICATION_PAUSED:
\t\t\t_write_resume_point()              # the only save point the OS guarantees on a handheld
\t\tNOTIFICATION_WM_CLOSE_REQUEST, NOTIFICATION_WM_GO_BACK_REQUEST:
\t\t\t_write_resume_point()
\t\t\tget_tree().quit()                  # quit only after the save

func _write_resume_point() -> void:
\tvar f := FileAccess.open("user://resume.json", FileAccess.WRITE)
\tf.store_string(JSON.stringify({"level": Game.level, "checkpoint": Game.checkpoint}))
\tf.close()`,
    pitfall:`Saving only on NOTIFICATION_WM_CLOSE_REQUEST. The Android back button sends NOTIFICATION_WM_GO_BACK_REQUEST instead, and with quit_on_go_back at its default the app quits at the end of that frame, so a save that waits on a signal or a request never finishes and the player loses the session they were three minutes into. Handle the go-back notification and write the resume point synchronously, or turn quit_on_go_back off and quit after the save.`,
    map:`Godot’s _notification with NOTIFICATION_APPLICATION_PAUSED is Unity’s OnApplicationPause.` },
  unity:{ term:`OnApplicationPause is the save point, and the frame rate cap is part of the session budget because it decides how warm the device gets and how long the battery lasts in a commute-length session.`,
    api:['OnApplicationPause(bool) / OnApplicationFocus(bool)','Application.targetFrameRate','QualitySettings.vSyncCount','Application.persistentDataPath','Screen.dpi / SystemInfo.deviceType','JsonUtility.ToJson()'],
    snippet:`public class SessionGuard : MonoBehaviour {
    void Awake() {
        QualitySettings.vSyncCount = 0;           // targetFrameRate is ignored while vSync is on
        Application.targetFrameRate = 60;         // battery is part of the session budget
    }

    void OnApplicationPause(bool paused) {
        if (paused) WriteResumePoint();           // OnApplicationQuit never runs on mobile
    }

    void WriteResumePoint() =>
        File.WriteAllText(Path.Combine(Application.persistentDataPath, "resume.json"),
                          JsonUtility.ToJson(Game.Snapshot()));
}`,
    pitfall:`Leaving Application.targetFrameRate at its default on a phone. Android and iOS ignore vSyncCount, and a target of -1 means a fixed 30 fps, so a game tuned at 60 in the editor ships at 30, and a cap raised to 120 drains the battery the session was sized around. Set targetFrameRate explicitly for mobile, remember that on desktop a non-zero vSyncCount makes Unity ignore the target, and confirm the rate on the device.`,
    map:`Unity’s OnApplicationPause is Godot’s NOTIFICATION_APPLICATION_PAUSED.` }});
INTERVIEW('platform-and-session',{
  junior:[
    { q:`Why is session length a design constraint rather than a marketing detail?`,
      a:`It decides the size of the satisfying unit. A loop that takes twenty minutes to become interesting fails where the median session is five. Write the session profile first, then structure the game so every typical session contains a complete unit.`,
      follow:`What is the satisfying unit in a game you have worked on?`,
      red:`Treats session length as something to be measured after launch.` },
    { q:`What changes between a television at three metres and a phone at thirty centimetres?`,
      a:`Readable text size, information density, the precision the input can deliver, and how often play gets interrupted. The same HUD that works on one is unusable on the other, and the hierarchy has to be re-ranked rather than scaled. Posture matters too, because a phone is held with the thumbs over the screen.`,
      follow:`Which of those bites first when you port?`,
      red:`Answers only with resolution and aspect ratio.` },
    { q:`How does a game survive interruption?`,
      a:`Treat saving and resuming as core features rather than as plumbing. Let a session end at a natural point rather than only at a boss or a checkpoint an hour in. Then resume without a load screen full of menus, because the friction on return is what turns one interruption into churn.`,
      follow:`What do you do for a competitive match that cannot be paused?`,
      red:`Designs save points around level structure and calls interruption a player problem.` }
  ],
  mid:[
    { q:`Run a session fit audit on a plan.`,
      a:`Write the profile: median length, interruption frequency, device and posture. Identify the unit that fits inside the median session, or state that none does. Flag stretches that cannot be interrupted safely and skills that exceed the input precision of the device. Propose the smallest restructuring that gives every session a complete unit.`,
      follow:`Your unit is twenty-five minutes and the median session is twelve. What changes?`,
      red:`Audits the level plan without ever stating the session profile.` },
    { q:`Multi-platform. What do you hold constant and what do you allow to diverge?`,
      a:`Hold the loop, the grammar and the progression constant, because those are the game. Allow readability, input mapping, density and session structure to diverge, because those are the frame. Decide the divergence deliberately rather than discovering it in certification, and be explicit about which platform sets the floor for what.`,
      follow:`What happens to that answer if the platforms share progression?`,
      red:`Designs for the strongest platform and treats the others as ports.` },
    { q:`Which platform conventions would you break, and how do you decide?`,
      a:`Break one only when the game needs it and the cost of relearning is smaller than the gain. Back button semantics, confirm and cancel placement and store conventions are where players are least forgiving. Test the break with players who are fluent on that platform, not with the team.`,
      follow:`Certification requires the convention you wanted to break. Now what?`,
      red:`Breaks conventions because the team prefers a different layout.` }
  ],
  senior:[
    { q:`Port a game designed for forty-minute sessions to a handheld. Plan it.`,
      a:`Re-derive the satisfying unit for the new profile and restructure the content around it. Add save anywhere and fast resume, run a readability pass at the real distance, and re-map inputs for the precision available. Instrument real sessions early so the restructure is tested against behaviour rather than against the assumed profile.`,
      follow:`What would you cut rather than port?`,
      red:`Ships the same structure with a smaller UI scale.` },
    { q:`Telemetry says the median session is half your design assumption. What now?`,
      a:`Check the end reasons before redesigning: interruption, a natural stop, frustration and a crash look identical in a duration histogram. Then check whether players resume and how quickly. If the shortfall is structural, re-derive the unit. If it is friction on resume, that is far cheaper to fix than the content plan.`,
      follow:`Which of those two would you test first, and how?`,
      red:`Shortens levels immediately on the strength of one aggregate number.` }
  ] });

T('business-model',{ d:'product', t:'Business model and monetisation', tag:'The model should pay for the fun without becoming the design. Where they conflict, players notice first.',
  what:`How the game earns: premium, free-to-play with purchases, subscription, ads, DLC, live service. Each model applies pressure to the design economy, progression, session design and social systems. Ethical monetisation sells things players value without manufacturing the pain it relieves. Plants vs. Zombies shows one design under two models: the 2009 original sold once, its shop taking only coins earned in play, while the free mobile edition Electronic Arts released in 2014 now sells those same coins in packs. Grand Theft Auto V bundles a third pattern inside one premium purchase: Grand Theft Auto Online is free once the game is bought, and Rockstar sells Shark Cards for its economy instead, a live-service mode that Take-Two counts among its largest contributors to net bookings through the recurrent consumer spending it reports, sustained across more than a decade of updates.`,
  why:[`Monetization pressure is the most common corrupter of design: timers to sell skips, grind to sell boosts, gacha to sell hope.`,`Players sense when a system exists to sell rather than to play, and it poisons trust in adjacent systems.`,`The model decides what “retention” means and which metrics the team will be pushed to optimise.`],
  think:{ q:[`What does the player pay for, and would they value it if the game had no store?`,`Which design decisions exist only because of the model? Would the game be better without them?`,`What pain does a purchase relieve, and did the design create that pain on purpose?`,`Which metric will the model push us to optimise, and does that metric align with fun?`],
    trade:[`Premium aligns incentives with fun and limits reach and revenue tail.`,`Free-to-play widens reach and creates constant pressure to monetise friction.`],
    traps:[`Designing the store before the loop.`,`Metrics (ARPU, session count) optimized at the cost of the experience.`,`“Ethical” monetisation declared rather than tested with players.`],
    good:[`Players describe purchases as wanted, not needed.`,`Non-payers describe the game as complete.`,`Fans who build on your characters can tell from one published page what they may sell without asking and when they must make contact, as Touhou Project’s fan guideline sets out for doujin events and shops versus companies acting for profit.`],
    bad:[`Players describe the game as “pay to win” or “designed to annoy you into paying”.`] },
  how:[`List every system that exists for the model. For each, ask whether the game would be better without it.`,`Ensure the loop is voluntarily replayed before any monetisation is added.`,`Sell value (expression, convenience players did not need to be annoyed into wanting, content) rather than relief.`,`Test with payers and non-payers. Ask both what the store feels like.`,`When a model change splits the audience, consider splitting it by edition: Halfbrick removed Fruit Ninja’s Starfruit currency from the paid version in December 2015 while the free version kept it.`,`When a modding community proves demand for new content years after launch, consider commissioning some of it directly, as Bethesda did with Skyrim’s Creation Club in 2017, but keep whatever free route already exists open: 2015’s attempt to sell mods directly on Steam Workshop drew a petition of over 130,000 signatures and was withdrawn within a week.`,`When a fan team’s own work quietly becomes the product, consider hiring the team directly: Microsoft turned Age of Empires II’s fan-made Forgotten Empires mod into an official 2013 expansion, then into the studio credited on 2019’s Definitive Edition and its DLC since.`],
  ai:{ yes:[`Model revenue under different structures and player behaviour assumptions.`,`Audit the design for monetization-induced friction.`,`Summarize regulatory and platform policy constraints (as a starting point. Verify with counsel).`],
       no:[`Decide monetisation ethics. That is a values decision.`,`Optimize a metric without you deciding whether the metric is right.`] },
  prompts:[{l:'Monetization friction audit',p:`Here are our systems and our business model: [SYSTEMS, MODEL]. Identify every system or number that exists primarily to create a purchase opportunity. For each, describe the player pain it creates, whether the design manufactured that pain, and what the game would feel like without the system. Then propose monetisation that sells value players would want in a game with no store, given the fantasy “[FANTASY]”.`}],
  verify:[`Did it defend friction as “industry standard”?`,`Did it distinguish value from relief?`],
  test:[`Ask non-payers whether the game feels complete.`,`Ask payers why they bought. “Wanted” versus “had to”.`,`Where do players mention the store unprompted, and in what tone?`],
  rel:[['economy-and-resources','The model pressures the design economy.'],['progression','Grind is where monetisation pressure shows.'],['social-experience','Social systems and spending interact.'],['audience-and-positioning','Model and positioning must agree.'],['soft-launch-and-playable-ads','Soft launch is where the model’s retention and revenue assumptions first meet a real market.'],['monetisation-design','Store, random rewards, passes and pricing are designed inside the model, under store and country rules.']] });
TECH('business-model',[
  {n:'Premium / one-time purchase', how:`Charge once. The design can be tuned to respect the player’s time.`, fit:`Craft-driven, finite or narrative games. Trust-sensitive audiences.`, cost:`Needs reach. No live revenue to fund long-term content.`, alt:`Premium plus paid expansions.`},
  {n:'Free-to-play with monetisation', how:`Free entry, revenue from cosmetic, convenience or progression sales. Economy design becomes central.`, fit:`Large live audiences and long retention.`, cost:`Pressure to design paywalls and grind. Risks perceived manipulation and churn.`, alt:`Cosmetic-first and transparent, with no power purchase.`},
  {n:'Subscriptions / season passes / live service', how:`Recurring revenue tied to ongoing content cadence.`, fit:`Games with a content pipeline and a live team.`, cost:`Requires sustained production. Punishing if cadence slips.`, alt:`Only if the team can ship on schedule indefinitely.`}
]);
ENGINE('business-model',{
  godot:{ term:`Godot has no first-party store layer. Billing arrives as a platform plugin exposed through Engine.get_singleton, and the client’s job stops at handing the purchase token to your server.`,
    api:['Engine.has_singleton() / Engine.get_singleton()','Android billing plugin signals such as purchases_updated','HTTPRequest for receipt verification','OS.get_name() for the store branch','ConfigFile / FileAccess for the offer cache','acknowledge and consume calls on the plugin'],
    snippet:`extends Node                                   # the store plugin, not the entitlement
var _billing: Object

func _ready() -> void:
\tif not Engine.has_singleton("GodotGooglePlayBilling"):
\t\treturn
\t_billing = Engine.get_singleton("GodotGooglePlayBilling")
\t_billing.purchases_updated.connect(_on_purchases)
\t_billing.startConnection()

func _on_purchases(purchases: Array) -> void:
\tfor p in purchases:
\t\t_verify_on_server(p.purchase_token)    # the server grants, then acknowledges`,
    pitfall:`Granting the item when purchases_updated fires and never acknowledging or consuming the purchase. Google Play refunds any purchase left unacknowledged for three days, so the player pays, gets the item locally, and loses both. A client-side grant is also the easiest thing in the game to fake.`,
    map:`Godot’s platform billing singleton is Unity IAP’s store listener.` },
  unity:{ term:`Unity IAP holds a purchase as pending until you confirm it. In IAP 4 ProcessPurchase returns Pending; IAP 5 deprecates the store listener, and StoreController raises OnPurchasePending with a PendingOrder instead. Either way the server verifies the receipt and grants, and only then does the client confirm the transaction with the store.`,
    api:['IDetailedStoreListener.ProcessPurchase()','PurchaseProcessingResult.Pending / Complete','IStoreController.ConfirmPendingPurchase()','ConfigurationBuilder + UnityPurchasing.Initialize()','Product.receipt','CrossPlatformValidator'],
    snippet:`public class Store : MonoBehaviour, IDetailedStoreListener {
    IStoreController controller;

    public PurchaseProcessingResult ProcessPurchase(PurchaseEventArgs e) {
        StartCoroutine(Grant(e.purchasedProduct));
        return PurchaseProcessingResult.Pending;   // Complete here loses a failed grant
    }

    IEnumerator Grant(Product p) {
        yield return Backend.VerifyReceipt(p.receipt);   // the server decides, not the client
        if (Backend.LastGrantOk) controller.ConfirmPendingPurchase(p);
    }
}`,
    pitfall:`Returning PurchaseProcessingResult.Complete before the grant is confirmed. The store marks the transaction finished and stops redelivering it, so any failure between the purchase and the grant loses the item permanently and the only fix is a manual support ticket per player. Return Pending and confirm after the server says yes.`,
    map:`Unity IAP’s pending purchase plus server verification is Godot’s billing plugin plus your own receipt endpoint.` },
  note:`Both engine tabs stop at the same line. The client surfaces the offer, hands the receipt over and waits. What the player owns is a server fact, because anything the client decides is a value the player can edit. The design questions in this topic (what does a purchase relieve, and did the design create that pain) are answered in the economy on the server, not in the store UI.` });
INTERVIEW('business-model',{
  junior:[
    { q:`Name three business models and what each pressures in the design.`,
      a:`Premium aligns incentives with making the game good and limits reach and the revenue tail. Free to play widens reach and creates constant pressure to monetise friction. Subscription pressures cadence and retention rather than any single purchase. Say which metric each pushes the team to optimise.`,
      follow:`Which metric would your team be pushed towards, and does it align with fun?`,
      red:`Describes the models as pricing choices with no design consequence.` },
    { q:`Explain the difference between selling value and selling relief.`,
      a:`Value is something the player would want in a game that had no store: expression, content, convenience they never needed to be annoyed into wanting. Relief is a purchase that removes pain the design manufactured. The test is whether the system would still exist if nobody could pay.`,
      follow:`Give one example of each from a game you have played.`,
      red:`Defends a timer as a pacing feature without asking who designed the wait.` },
    { q:`Why validate the loop before adding a store?`,
      a:`Monetisation attached to a loop nobody voluntarily repeats measures nothing and corrupts the design while you are still learning what it is. Prove the loop is replayed first, then design the model onto a thing that works. Otherwise every metric is about the store and none is about the game.`,
      follow:`What if the store model is the core of the pitch?`,
      red:`Designs the store first because that is what the business plan describes.` }
  ],
  mid:[
    { q:`Audit a design for monetisation-induced friction.`,
      a:`List every system and every number that exists primarily to create a purchase opportunity. For each, describe the pain it creates and whether the design manufactured that pain. Then describe what the game would feel like without it. The output is a list of systems that would improve the game by leaving, with the revenue they carry named honestly.`,
      follow:`One of them carries a large share of the revenue. What do you propose?`,
      red:`Calls the friction an industry standard and moves on.` },
    { q:`Non-payers should describe the game as complete. How do you test that?`,
      a:`Ask non-payers whether anything feels withheld and where. Ask payers why they bought, and code the answers as wanted or had to. Then watch for unprompted mentions of the store and note the tone. Behaviour and unprompted language are the evidence, not a satisfaction score.`,
      follow:`Non-payers say it feels complete and churn on day seven anyway. What does that tell you?`,
      red:`Reports conversion rate as evidence the model is healthy.` },
    { q:`Which metric will the model push you to optimise, and how do you keep it honest?`,
      a:`Name it in advance, then pair it with a countervailing signal so nobody can move one without showing the other. Session count paired with voluntary return, revenue per player paired with non-payer sentiment, retention paired with what players say they came back for. Report both in the same review.`,
      follow:`Leadership sets a revenue target that the countervailing signal contradicts. What do you do?`,
      red:`Optimises the metric handed down without ever asking whether it tracks the experience.` }
  ],
  senior:[
    { q:`You are asked to add a mechanic you believe is manipulative. Walk me through it.`,
      a:`Name specifically what makes it manipulative: manufactured pain, hidden odds, pressure rather than information. Propose an alternative that sells value and cost both. Bring evidence about trust and long-term retention rather than an appeal to principle alone. Then say where your own line is, because a line you never state is one nobody can plan around.`,
      follow:`They ship it anyway. What do you do next?`,
      red:`Refuses without proposing anything, or complies and stops raising it.` },
    { q:`The model changes from premium to free to play mid-development. What changes in the design?`,
      a:`The economy, the progression pacing, the session structure, the social systems, the content cadence and the metrics all change, because the model decides what retention means. Treat it as a redesign of the loop’s surroundings rather than a store bolted on. Re-validate the loop under the new pacing before building any store content.`,
      follow:`What would you refuse to change, and why?`,
      red:`Adds a shop and a currency and treats the rest of the design as unaffected.` }
  ] });
FACTS('business-model',[
  { claim:`On 11 December 2025 the US Ninth Circuit upheld the finding that Apple was in contempt of the Epic v. Apple injunction. On the US App Store, Apple may not block links to outside purchases or require them to be less prominent than its own purchase buttons, though it may stop them being more prominent. A total ban on commission for those purchases went too far: Apple may charge one limited to its genuine costs of handling the links, with the details sent back to the district court.`, asOf:'2026-09-23', src:'https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf' },
  { claim:`On 30 June 2026 the US Supreme Court agreed to hear Apple’s appeal of the contempt ruling, limited to the first question in Apple’s petition; Apple filed its brief on 14 September 2026.`, asOf:'2026-09-23', src:'https://www.supremecourt.gov/docket/docketfiles/html/public/25-1311.html' }
]);
DIAGRAM('business-model', { kind:'economy', title:'Where the store meets the play economy',
  nodes:[{id:'play', t:'Play rewards', type:'source'},{id:'buy', t:'Real-money purchase', type:'source'},{id:'soft', t:'Soft currency', type:'pool'},{id:'premium', t:'Premium currency', type:'pool'},{id:'items', t:'Items', type:'pool'},{id:'store', t:'Store', type:'converter'},{id:'use', t:'Upgrades used up', type:'sink', row:2}],
  edges:[['play','soft','earned'],['buy','premium','bought'],['soft','store','spend'],['premium','store','spend'],['store','items','grant'],['items','use','consume']],
  note:'Each extra currency is another pool to balance. Where money buys what play earns, players notice first.' });

T('scope-control',{ d:'product', t:'Scope control', tag:'Scope should follow validated value, not imagination. AI makes this harder, not easier.',
  what:`The discipline of deciding what the game contains, based on what has been shown to work rather than what could be built. The healthy sequence is idea, prototype, evidence, commit. The unhealthy one is idea, production commitment. AI makes implementation cheap enough that huge amounts of mediocre content can be produced before anyone asks whether the core is fun. Flappy Bird shows the far end of tight scope: Nguyen built it in two to three days around one input and one obstacle, and his reported change during development was to tuning, making an easier first version harder because he found it boring. Overwatch 2 was announced in 2019 on the promise of story PvE missions, then cancelled its Hero Mode in May 2023 after director Aaron Keller said the concept had become unfocused: a sequel sold on scope it had not yet proved it could build.`,
  why:[`Scope is the most common cause of games that never ship or ship hollow.`,`Cheap implementation removes the natural brake on scope. The brake must become deliberate.`,`Every feature carries costs beyond building it: teaching, balancing, maintaining, and diluting the core.`],
  think:{ q:[`What has been validated with players? Scope grows from there, not from the pitch.`,`What is the smallest version of this game that delivers the core experience?`,`For each feature: what would we lose by not building it? Be specific about the player experience.`,`What is on the “not this game” list? Is it written down?`],
    trade:[`Tight scope ships and may feel thin. Wide scope feels ambitious and may never cohere.`,`Cutting late saves the project and wastes the cut work.`],
    traps:[`Scope defined by the pitch deck.`,`“AI can build it in a day” as an argument to build it.`,`Content pipelines started before the system is validated.`,`Never writing the not-list.`],
    good:[`The team can name the three things the game is about and the ten it is not.`,`Cut features have a documented reason and a player-evidence trigger for revisiting.`],
    bad:[`Feature list grows every sprint. Core loop metrics do not move.`] },
  how:[`Write the core experience statement and the not-list.`,`Order features by dependency on validated evidence: what needs the loop proven first, then what needs progression proven, then whatever depends on both.`,`Gate each production commitment on a prototype and playtest result.`,`Review the feature list monthly: what has evidence, what is imagination?`,`Treat cheap AI implementation as a reason to prototype more, not to ship more.`],
  ai:{ yes:[`Map feature dependencies and identify what can be validated first.`,`Estimate total cost including teaching, balance and maintenance, not just build.`,`Draft the not-list from the positioning and flag features that violate it.`],
       no:[`Decide what to cut. That is the human’s most important job.`,`Argue that low build cost justifies building.`] },
  prompts:[{l:'Scope triage',p:`Here is our feature list and what has been validated with players so far: [FEATURES, EVIDENCE]. For each feature, state which validated result it depends on, its full cost (build, teach, balance, maintain, dilution of core), and what the player would lose without it. Sort into: build now (evidence supports), prototype first (evidence missing), defer (depends on unvalidated features), and cut (does not serve “[CORE EXPERIENCE]”). Argue against your own “build now” list once.`}],
  verify:[`Did it count build cost only?`,`Did it defer decisions to “it depends” instead of sorting?`],
  test:[`Does removing a feature in a prototype change player behaviour? If not, it may not need to exist.`,`Which features do players never mention or use?`],
  rel:[['prototyping','Prototypes are how scope earns its place.'],['content-multiplies','Content is where scope explodes.'],['core-experience','The experience statement is the scope filter.'],['ai-failure-modes','Feature inflation and content spam are AI-era scope failures.'],['should-we-build-this','The decision tree operationalizes scope control.'],['soft-launch-and-playable-ads','Hyper-casual ad-first testing is the most extreme version of gating production on validated evidence.']] });
TECH('scope-control',[
  {n:'Vertical slice', how:`Build a thin, polished, end-to-end slice that proves the full experience at production quality.`, fit:`De-risking the whole pipeline before mass production.`, cost:`Expensive. Does not prove content volume.`, alt:`Slice for pipeline risk. Prototype for mechanic risk.`},
  {n:'Cut list discipline and scope ladders', how:`Rank features by value/effort and pre-agree what is cut first when time runs out.`, fit:`Any fixed-date project.`, cost:`Hard to hold when a feature is loved. Needs a decision owner.`, alt:`Decide the cut order while calm, before crunch.`},
  {n:'Content budget from validated value', how:`Commit content volume only after the system is shown fun and the pipeline is measured.`, fit:`Preventing content pipelines from outrunning the design.`, cost:`Slows commitment. Some stakeholders want the volume promised early.`, alt:`Idea → prototype → evidence → commit.`}
]);
ENGINE('scope-control',{
  godot:{ term:`A feature is a PackedScene that boot instances only when its tag is present. Cutting one means removing the tag and the scene, and a leftover reference fails loudly at startup instead of in a menu nobody opened.`,
    api:['OS.has_feature() + custom feature tags on an export preset','ResourceLoader.exists()','preload() vs load() with a built path','PackedScene.instantiate()','Export preset resource filters','push_error()'],
    snippet:`extends Node                                   # one PackedScene per feature, gated at boot
@export var features := {"photo_mode": "res://feat/photo_mode.tscn"}

func _ready() -> void:
\tfor feat in features:
\t\tif not OS.has_feature(feat):           # custom feature tag on the export preset
\t\t\tcontinue
\t\tvar path: String = features[feat]
\t\tif not ResourceLoader.exists(path):
\t\t\tpush_error("cut feature still referenced: %s" % path)
\t\t\tcontinue
\t\tadd_child(load(path).instantiate())`,
    pitfall:`Cutting a feature by excluding it in the export preset filters while a string path still points at it. preload would have failed at parse time, but load with a built path fails at the moment the player opens that menu, in a build that passed every editor test. Check existence at boot, or keep the reference a preload so the cut breaks immediately.`,
    map:`Godot export preset feature tags are Unity scripting define symbols and build profiles.` },
  unity:{ term:`Scripting define symbols per build profile decide whether the feature compiles, and an Addressable reference decides whether its assets ship. A direct prefab field ships the content regardless of the define.`,
    api:['Scripting Define Symbols / BuildProfile','AssetReferenceGameObject + InstantiateAsync()','Addressables groups and labels','asmdef Define Constraints','[Conditional] attributes','Editor log build report for what shipped'],
    snippet:`public class FeatureGate : MonoBehaviour {
    [SerializeField] AssetReferenceGameObject photoMode;  // Addressable, not a direct reference

    async void Awake() {
#if FEATURE_PHOTO_MODE                                    // define set by the build profile
        var go = await photoMode.InstantiateAsync(transform).Task;
        go.name = "PhotoMode";
#endif
        // A direct prefab field would pull the whole feature in even with the define off.
    }
}`,
    pitfall:`Believing a define cut the content. Serialised references pull assets into the build whether or not the code that uses them compiles, so a cut feature still costs download size and load time. Read the build report in the Editor log to see what shipped, and move optional content behind Addressables.`,
    map:`Unity scripting define symbols plus Addressables groups are Godot export preset feature tags plus resource filters.` }});
INTERVIEW('scope-control',{
  junior:[
    { q:`What is the healthy sequence for adding a feature?`,
      a:`Idea, prototype, evidence, commit. The unhealthy one is idea straight to production commitment, which is how feature lists grow while the loop stays flat. Each step should be able to end the feature, and the cheapest steps come first.`,
      follow:`What is the unhealthy sequence, and where have you seen it?`,
      red:`Describes a planning process with no evidence step in it.` },
    { q:`What does a feature cost beyond building it?`,
      a:`Teaching it, balancing it, maintaining it as everything around it changes, and diluting the core by taking attention from it. Those costs recur, while the build cost happens once. Most estimates count only the build.`,
      follow:`Which of those is forgotten most often?`,
      red:`Estimates in engineering days and stops.` },
    { q:`What is a not-list and why write it down?`,
      a:`The written list of things this game is not going to be, with the reason. It converts a hundred future arguments into one decision and gives the team a way to say no without relitigating the vision. It also records the trigger that would make you revisit each item.`,
      follow:`Who owns it and when is it reviewed?`,
      red:`Keeps the exclusions as a shared understanding nobody has written down.` }
  ],
  mid:[
    { q:`Someone says AI can build the feature in a day, so we should build it. Respond.`,
      a:`Cheap implementation removes the natural brake on scope, so the brake has to become deliberate. The build was never the expensive part: teaching, balancing, maintaining and dilution are, and none of them got cheaper. The right conclusion from cheap building is to prototype more and commit less.`,
      follow:`The prototype already exists and looks good. Does that change your answer?`,
      red:`Accepts low build cost as the argument for building.` },
    { q:`The feature list grows every sprint and the loop metrics do not move. Diagnose it.`,
      a:`Sort the list by the validated result each feature depends on. Most of it will depend on something nobody has tested, which is the actual problem. Gate new production commitments on a prototype result, and run a monthly review that separates what has evidence from what is imagination.`,
      follow:`What do you cut first, and how do you defend the choice?`,
      red:`Proposes better prioritisation without adding any evidence gate.` },
    { q:`How do you cut a feature the team loves?`,
      a:`Show the evidence and the cost side by side rather than arguing taste. Document the reason and the player-evidence trigger that would bring it back, so the work is shelved rather than dismissed. Preserve what can be reused and say so, because the sting is usually about the effort, not the feature.`,
      follow:`It is the creative director’s favourite. How does the conversation go?`,
      red:`Cuts it quietly and lets people discover it missing.` }
  ],
  senior:[
    { q:`Six months from ship and clearly over scope. Build the cut list.`,
      a:`Order by dependency so you are not cutting something three other things need. Protect the core experience and cut whole features rather than shaving quality everywhere, because uniform quality reduction shows up in every review. Count the teaching and balance cost you recover, and publish the list with the reason attached to each line.`,
      follow:`How do you choose between cutting a feature and cutting quality?`,
      red:`Reduces polish across the board and keeps every feature.` },
    { q:`How do you make scope control a team habit rather than a lead’s nagging?`,
      a:`Put the evidence gate into the process the team already follows, so a commitment needs a prototype result to move forward. Keep the not-list visible and update it in public. Budget prototype time explicitly, because a team with no time to test will commit by default. Then show one case where the gate saved the schedule.`,
      follow:`What does the first month of that look like?`,
      red:`Relies on a strong lead saying no and calls that the process.` }
  ] });

T('learning-from-success',{ d:'product', t:'Dissect games that succeeded', tag:'Your idea is only as good as its answer to “why would they play this instead of that?” Find “that” and take it apart.',
  what:`A method for judging an idea before building it: pick the games your player already plays that satisfy a similar want, dissect each with one template (want served, core verb, first 30 seconds, decision per minute, engines, why it worked, what players complain about), then cross-reference your concept against them: which proven want you share, what you do that none of them do, which complaint you answer, which patterns you are borrowing and whether you re-derived them, where a fan of theirs would find you weaker, and whether your team can reach the quality bar they set. Slay the Spire is a good subject: it became the reference point for roguelike deckbuilders by fusing a roguelike run with deck-building (the developers cite Dream Quest, Dominion and Netrunner as influences), not by being first.`,
  why:[`A successful comparable is evidence that the audience and the want exist. Without one, your idea is a bet on a want nobody has demonstrated.`,`Most weak ideas are a comparable with a cosmetic difference. The dissection makes that visible before months of work.`,`Copies fail on what they leave out, not on what they add. Knowing what the original’s success rested on tells you what you cannot skip.`],
  think:{ q:[`Which three games would my player stop playing to play mine? Have I taken them apart?`,`What is the one decision per minute that made each of them work? Do I have one that is at least as frequent and as readable?`,`Which recurring complaint about them does my concept answer? Is that a want, or my taste?`,`What am I borrowing? For each borrowed pattern: did I re-derive it from my player and constraints, or copy it because it was there?`,`Where would a fan of the comparable find mine weaker? Can I afford that, or does it kill the concept?`,`Can my team reach the quality bar they set on the things that matter for the want?`],
    trade:[`Close comparables prove the market and make differentiation harder. Distant comparables leave room and prove less.`,`Dissecting deeply takes days. Building the wrong game takes months.`],
    traps:[`Reading success as features (“it has a shop, a map and a three-card choice”) rather than as mechanisms (“every reward is a reasoned decision”).`,`Citing sales figures as design lessons. Numbers say it sold. The dissection says why it kept people.`,`Choosing comparables you admire instead of the ones your player plays.`,`Letting AI invent postmortem details. Ask for sources or “unknown”.`],
    good:[`You can state, for each comparable, the mechanism its success rested on in one sentence and point to your equivalent.`,`Your differentiator is visible in one screenshot and answers a complaint players of the comparable make.`,`You can name, as a mechanism, what separates a praised spin-off from a weaker one on the same property, as Touhou Luna Nights’ carried-over graze system and the combat critics faulted in Touhou: Scarlet Curiosity show.`,`You can point to where one game split its own reviews, as Sonic Unleashed’s praised daytime stages and faulted Werehog nights did, and say which half your idea copies.`],
    bad:[`Your pitch is “like X but with Y” where Y is a theme, a setting or more content.`] },
  how:[`Use the Reference Dissection tool. Add the three to five games your player plays for this want. Start from the library entries or dissect your own with the template.`,`For each, fill the template. Where you do not know, ask AI to dissect from public postmortems and interviews, with sources, and verify the ones you rely on.`,`Answer the seven cross-reference questions honestly. The verdict tells you whether the idea is promising, derivative, unproven or undeliverable, and names the next test.`,`Take the differentiator and the answered complaint into the want tests (stranger pitch, one-pager, one-day loop). Take the borrowed patterns into the Behaviour Ladder to re-derive them.`,`Separate what a hit borrowed from what it added: Shariki already had Bejeweled’s swap in 1994, so what later match-3 games took from the Bejeweled line was Bejeweled 2’s special gems, not the swap.`,`Read a series against itself, not just one comparable: Mega Man kept bosses whose weapons beat each other in an order the player picks across eleven main entries while its art style, hardware and team changed, which shows the one system its formula never let go.`,`Where a series cut a mechanic and later restored it, study what stood in for it between: Persona dropped demon negotiation for Persona 3 and 4 (2006, 2008), Atlus staff described Social Links and parts of fusion as a “disguised” version of it, and Persona 5 (2016) brought it back as Hold Up, so the stand-in shows which part of the mechanic the team thought it could not lose.`],
  ai:{ yes:[`Dissect a named game from public postmortems, talks and interviews, using the template, citing sources or marking unknowns.`,`Cluster player complaints about a comparable from reviews and forums into wants.`,`Steelman the comparables against your concept: argue why a fan would not switch.`,`Compare your concept and the comparables on the template dimensions in a matrix.`],
       no:[`Decide which comparables matter. That depends on your player, whom AI has not met.`,`Assert why a game succeeded without sources. Success narratives are where hallucination thrives.`,`Declare your idea good. The want tests do that.`] },
  prompts:[{l:'Dissect a comparable',p:`Dissect [GAME] as a designer, using public postmortems, GDC talks, developer interviews and critical consensus. Fill this template with one to three sentences each: the player want it served, the core verb. The first 30 seconds. The decision the player faces every minute. The engines it runs on (for example mastery, discovery, expression or social play). Why it worked, as the developers and critics explain it. What players most often complain about. The transferable lesson. And what copies of it usually miss. Cite a source for every claim about why it worked, or write “unknown”. Do not cite sales figures.`},
    {l:'Cross-reference my concept',p:`My concept: [POSITIONING SENTENCE, FANTASY, CORE VERB, DECISION PER MINUTE]. Comparables my player plays, dissected: [DISSECTIONS]. Build a matrix comparing my concept and each comparable on: want served, core verb, decision per minute, first 30 seconds, engines. Then answer: which proven want do I share, what do I do that none of them do, and is it visible in one screenshot. Which recurring complaint do I answer. Which patterns am I borrowing and which of those did I re-derive from my player and constraints. Where would a fan of each comparable find mine weaker. Can a team of [CONSTRAINTS] reach the quality bar they set on the things that matter. Be adversarial. Finish with the single cheapest test that would show my player wants this.`}],
  verify:[`Did the AI cite sources for every “why it worked” claim, or narrate plausibly?`,`Is the differentiator it credits you with mechanical, or cosmetic?`,`Did it steelman the comparables, or flatter the concept?`],
  test:[`Stranger pitch to players of the comparable: do they ask how it plays, or say “so it is like X”?`,`Show the one-pager next to a screenshot of the comparable: can they say what is different without being told?`,`One-day loop with fans of the comparable: do they replay, and what do they say it lacks?`],
  rel:[['finding-an-idea','Dissection is how a raw idea becomes a testable concept.'],['audience-and-positioning','The differentiator you find here is the positioning sentence.'],['who-is-the-player','Comparables are chosen by what your player plays.'],['feature-vs-experience','Borrowed patterns must be re-derived on the ladder.'],['scope-control','The quality bar the comparables set is a scope decision.']] });
TECH('learning-from-success',[
  {n:'One-template dissection', how:`Take apart a comparable on one template: want served, core verb, first 30 seconds, decisions per minute, why it worked, complaints, what copies miss.`, fit:`Extracting transferable mechanisms without copying surface.`, cost:`Success narratives are heuristics. Survivorship bias.`, alt:`Use the Reference Dissection tool.`},
  {n:'Cross-reference questions', how:`Test your concept against the comparable on shared want, differentiator, answered complaint, quality bar and audience evidence.`, fit:`Deciding promising / derivative / unproven / undeliverable.`, cost:`Only as good as your comparables.`, alt:`Answer with evidence, not optimism.`}
]);
ENGINE('learning-from-success',{
  godot:{ term:`Decisions per minute is a measurement, not an estimate. A logger writes every meaningful action with a timestamp so your prototype and the comparable are compared on the same number.`,
    api:['Node._unhandled_input()','InputEvent.is_action_pressed()','FileAccess.open("user://…", WRITE) / store_line()','Time.get_ticks_msec()','OS.has_feature("editor") to separate editor runs'],
    snippet:`extends Node                                   # measured in an export build, not the editor
var _log := FileAccess.open("user://decisions.csv", FileAccess.WRITE)
const MEANINGFUL := [&"attack", &"dodge", &"swap", &"buy"]   # in priority order
func _unhandled_input(e: InputEvent) -> void:
\tfor a in MEANINGFUL:
\t\tif e.is_action_pressed(a):          # allow_echo is false by default, so held keys log once
\t\t\t_log.store_line("%d,%s" % [Time.get_ticks_msec(), a])
\t\t\tbreak                           # one press is one decision, even if bound to several actions`,
    pitfall:`Logging every action an input matches. One key bound to several actions (Space for both dodge and swap, say) matches several entries in the list, so a single press writes several rows and your prototype appears denser than the game you are measuring it against. Log one row per press, and count only the actions that change the plan.`,
    map:`A Godot _unhandled_input action log is a Unity InputAction callback log.` },
  unity:{ term:`Subscribe to performed on the actions you called meaningful, and write the rows out at the end of the session. Interactions on an action fire three separate callbacks, so only one of them is a decision.`,
    api:['InputAction.performed / started / canceled','InputActionAsset.FindActionMap()','InputAction.CallbackContext','Time.realtimeSinceStartup','File.WriteAllLines() + Application.persistentDataPath','Development Build for honest frame times'],
    snippet:`public class DecisionLog : MonoBehaviour {
    [SerializeField] InputActionAsset actions;
    readonly List<string> rows = new();

    void OnEnable() {
        foreach (var a in actions.FindActionMap("Meaningful"))
            a.performed += Row;            // performed only, or a Hold triples the count
    }

    void Row(InputAction.CallbackContext c) =>
        rows.Add(Time.realtimeSinceStartup.ToString("F3") + "," + c.action.name);

    void OnDisable() =>
        File.WriteAllLines(Path.Combine(Application.persistentDataPath, "decisions.csv"), rows);
}`,
    pitfall:`Subscribing to started, performed and cancelled on the same action. Any action with a Hold or Press interaction fires all three, so one dodge is logged as three decisions and the rate you compare against the comparable is inflated threefold. Pick the callback that matches what you decided counts as a decision.`,
    map:`Unity’s InputAction callbacks are Godot’s action presses in _unhandled_input.` }});
INTERVIEW('learning-from-success',{
  junior:[
    { q:`Pick a game your target player already plays and dissect it.`,
      a:`Use one template: the want it serves, the core verb, the first thirty seconds, the decision the player faces every minute, the engines it runs on, why it worked, and what players complain about. Then say what a copy of it would most likely leave out. The dissection is about mechanisms, not features.`,
      follow:`What is the mechanism its success rested on?`,
      red:`Lists the features it shipped with and calls that the reason it worked.` },
    { q:`Why is a pitch of the form this game but with a different theme weak?`,
      a:`Because the difference is cosmetic and the player’s reason to switch has to be mechanical or experiential. A theme is not a want. Most weak ideas are a comparable with a cosmetic difference, and the dissection is what makes that visible before months of work.`,
      follow:`What would make the difference strong instead?`,
      red:`Defends the theme as the differentiator with no mechanical change behind it.` },
    { q:`Where do you get trustworthy information about why a game succeeded?`,
      a:`Postmortems, conference talks, developer interviews and critical consensus, with a source attached to each claim or an explicit unknown. Sales figures say it sold, not why it kept people. Success narratives are where confident invention thrives, so verify anything you plan to rely on.`,
      follow:`An AI assistant gives you a confident postmortem detail with no source. What do you do?`,
      red:`Cites sales numbers as the design lesson.` }
  ],
  mid:[
    { q:`Cross-reference a concept against three dissected comparables. What do you ask?`,
      a:`Which proven want you share, what you do that none of them do, which recurring complaint you answer, which patterns you borrowed and whether you re-derived them from your own player and constraints, where a fan of each would find you weaker, and whether the team can reach the quality bar they set. Then name the cheapest test of the answer.`,
      follow:`Your differentiator is not visible in a screenshot. What changes?`,
      red:`Runs the comparison and concludes the concept is stronger on every dimension.` },
    { q:`Copies fail on what they leave out. Give a concrete case.`,
      a:`Pick a game whose imitators kept the structure and dropped the mechanism: the readability that made each placement a reasoned decision, or the pace that made each failure legible. Name the load-bearing part and show what happens to the loop without it. Then point at your own equivalent.`,
      follow:`How do you identify the load-bearing mechanism rather than guessing?`,
      red:`Reproduces the feature list of the original and expects the same result.` },
    { q:`How do you choose which comparables to dissect?`,
      a:`The games your player would stop playing to play yours, not the games you admire. That means asking your player model what they play for this want. Include the uncomfortable ones, because they are the direct competition for the same hours.`,
      follow:`Your player plays a genre your team cannot build. What does that tell you?`,
      red:`Chooses critically acclaimed games the target audience does not play.` }
  ],
  senior:[
    { q:`The comparables set a quality bar your team cannot reach. What do you do?`,
      a:`Be specific about which dimensions matter for the want and which do not, because a team rarely has to match on everything. Then either narrow the game so the team can be excellent on the dimensions that matter, reposition on a want with a lower bar, or recommend not making it. Say which evidence would settle which dimensions matter.`,
      follow:`How do you establish which dimensions the want depends on?`,
      red:`Assumes hard work will close a gap in production capacity.` },
    { q:`Your studio treats studying comparables as copying. How do you change that?`,
      a:`Separate dissection from imitation explicitly: the output is a mechanism and an unmet want, and every borrowed pattern has to be re-derived from your own player and constraints before it enters the design. Run the first session yourself on a game everyone respects and finish with a steelman against your own concept. The credibility comes from the steelman.`,
      follow:`How would you run that first session?`,
      red:`Presents comparables as templates to match feature for feature.` }
  ] });

T('launch-and-discoverability',{ d:'product', t:'Launch and discoverability', tag:'A game nobody finds is not a game. The store page is the first level.',
  what:`How players discover and choose the game: the store page and capsule, wishlists, the demo, festivals and streamer moments, the trailer, and the first impression. Discoverability is a design constraint because it decides what the first minute has to prove. Discoverability can turn inward too: in 2023 Rovio renamed its 99-cent rebuild of the original Angry Birds and pulled it from Google Play, citing its impact on the free-to-play Angry Birds games it competed with in the same stores.`,
  why:[`Most games fail on discovery, not on craft.`,`The store page is where the game is judged before it is played, and it must match the real hook.`,`Wishlists and demos convert attention into launch volume.`,`The first impression sets what the game is allowed to be.`],
  think:{ q:[`Can a stranger explain the hook from the capsule alone?`,`Does the page promise what the first ten minutes deliver?`,`What does the first minute of the trailer show the player doing?`,`Which beats build an audience before launch, and which are too late?`],
    trade:[`A bold capsule wins clicks and can mislead. An honest one converts fewer and keeps them.`,`Marketing spends time that could be spent making the game better, and without it the game is unseen.`],
    traps:[`Marketing that describes a different game.`,`Launching with no audience built beforehand.`,`Treating the store page as an afterthought.`,`A trailer that shows nothing the player does.`,`Picking a web portal as if it were only hosting: Poki splits revenue from traffic it sends 50/50 and asks for web exclusivity, so the portal is a distribution decision made before launch.`],
    good:[`A fan can say what the game is from the capsule.`,`Wishlists grow before launch and the demo converts them.`],
    bad:[`Nobody can tell what the game is.`,`The page is a feature list.`] },
  how:[`Write the hook as one sentence and keep it honest.`,`Build the capsule around the core verb.`,`Make a demo or a festival beat that shows the loop.`,`Grow wishlists and test the page language as you go.`,`Align the page, the trailer and the first minute.`,`Count where a game is sold as part of its ceiling: Danganronpa: Trigger Happy Havoc sold 258,250 copies on PSP in Japan, then passed one million on Steam alone by October 2021, after a 2016 PC port put it on a store a far larger audience already used.`,`A one-time platform giveaway can multiply reach for free: Subnautica was the Epic Games Store’s first free game, given away for two weeks in December 2018, and roughly 4.5 million copies were claimed then, against a little over 5 million paid copies sold by January 2020.`],
  ai:{ yes:[`Draft store copy and trailer beat sheets.`,`Generate capsule concepts and A/B variants.`,`Mine reviews of comparables for the language players use.`],
       no:[`Decide the hook.`,`Promise something the game does not deliver.`] },
  prompts:[{l:'Hook and page',p:`Here is our game, its player and its core loop: [CONTEXT]. Write one hook sentence a stranger could repeat, a short store description that promises only what the first ten minutes deliver, and a list of the three things a trailer must show. Mark anything you were unsure of.`},{l:'Discoverability plan',p:`Our genre, platform and timeline are: [CONTEXT]. List the realistic beats that could build an audience before launch, ordered by cost and expected effect, and the one demo or festival moment that would best show our loop.`}],
  verify:[`Does the page promise match the first minutes of play?`,`Is the hook mechanical rather than a theme?`],
  test:[`Show the capsule to ten matched players. Can they say what the game is and what they would do in it?`],
  rel:[['audience-and-positioning','Discoverability tests the positioning in public.'],['business-model','The store page states the model before players commit.'],['learning-from-success','Comparables show how similar games were framed.'],['onboarding','The first minute must deliver on the page promise.'],['ai-disclosure-policy','The store page is where your AI disclosure lives.'],['store-presence','Assets, wishlists, pricing and the rules each store sets for the page.'],['soft-launch-and-playable-ads','A playable ad or trailer makes the same promise the store page does, and can break it the same way.']] });
TECH('launch-and-discoverability',[
  {n:'Hook sentence', how:`One mechanical sentence a stranger could repeat.`, fit:`Capsule, page and press together.`, cost:`Forces the game to have one clear idea.`, alt:`A positioning statement from the comparables.`},
  {n:'Demo beat', how:`A short playable or festival moment that shows the loop rather than the story.`, fit:`Building wishlists before launch.`, cost:`Content that must be maintained and kept current.`, alt:`A trailer built from real gameplay when no demo is possible.`},
  {n:'Wishlist funnel', how:`Track where attention comes from and how it converts to wishlists and then sales.`, fit:`Any game with a marketing runway.`, cost:`Ongoing measurement and page iteration.`, alt:`Listen to comparables and festival feedback when the audience is small.`}
]);
ENGINE('launch-and-discoverability',{
  godot:{ term:`The demo and the trailer are both export presets. A trailer feature tag switches on a scripted camera rig, and the engine’s movie writer renders deterministic frames at a fixed rate instead of screen-recording a laggy session.`,
    api:['Export preset custom features + OS.has_feature()','godot --write-movie file.avi --fixed-fps 60','Movie Maker mode in Project Settings','SceneTree.quit()','ProjectSettings application/config/version','Marker3D camera path'],
    snippet:`extends Node                       # run the exported "trailer" preset: game.exe --write-movie trailer.avi --fixed-fps 60
@export var path: Array[Marker3D] = []
@export var seconds := 20.0
var _t := 0.0

func _process(delta: float) -> void:
\tif not OS.has_feature("trailer"):
\t\treturn
\t_t += delta                    # delta, never wall clock: the movie writer fakes time
\tvar u := clampf(_t / seconds, 0.0, 1.0)
\t$Camera3D.global_position = path[int(u * (path.size() - 1))].global_position
\tif u >= 1.0:
\t\tget_tree().quit()`,
    pitfall:`Driving anything in the trailer rig from real time. Movie Maker mode advances a simulated clock so every frame can be rendered slowly and still land on the timeline, so Time.get_ticks_msec and system time race ahead of the recorded frames. Timers and effects that read them play at the wrong speed in the capture and nowhere else.`,
    map:`Godot export presets with feature tags and Movie Maker are Unity build profiles with defines and Unity Recorder.` },
  unity:{ term:`A build profile with its own defines produces the demo, and Unity Recorder captures the trailer from the game view at a fixed frame rate. The demo is built as its own scene list so it does not carry the full game.`,
    api:['BuildProfile + Scripting Define Symbols','Unity Recorder package','EditorBuildSettings.scenes / the profile scene list','Addressables groups per build','Application.version','Application.Quit()'],
    snippet:`public class TrailerRig : MonoBehaviour {
    [SerializeField] CinemachineSplineCart cart;   // Unity Recorder captures the game view
    [SerializeField] float seconds = 20f;
    float t;

    void Update() {
#if !TRAILER_BUILD
        enabled = false;                           // define comes from the trailer profile
#else
        t += Time.deltaTime;
        cart.SplinePosition = Mathf.Clamp01(t / seconds);
        if (t >= seconds) Application.Quit();
#endif
    }
}`,
    pitfall:`Building the demo from the full project. Everything under a Resources folder is included whole regardless of what the demo’s scenes reference, so a short slice downloads at close to full game size and the store page’s file size contradicts the pitch. Move optional content to Addressables and check the build report.`,
    map:`Unity build profiles with Unity Recorder are Godot export presets with Movie Maker mode.` }});
INTERVIEW('launch-and-discoverability',{
  junior:[
    { q:`What is the store page’s job?`,
      a:`It is where the game is judged before anyone plays it, so it must state the hook in a sentence a stranger can repeat and promise only what the first ten minutes deliver. Build the capsule around the core verb rather than around a logo. Treat it as the first level, because it is the first thing the player has to read.`,
      follow:`A stranger sees only the capsule. What do they say the game is?`,
      red:`Describes the page as a marketing deliverable outside the design’s responsibility.` },
    { q:`What should the first minute of a trailer show?`,
      a:`What the player does. The verb, the decision and the consequence, in that order, with enough clarity that someone can imagine their own hands on it. A trailer that shows only cinematics tells the viewer nothing about the game they would buy.`,
      follow:`Your loop takes ten minutes to become interesting. What do you show?`,
      red:`Opens with a logo and a cinematic and considers the hook covered.` },
    { q:`What are wishlists and demos for?`,
      a:`They convert attention into volume at launch and give you a measurable signal before you commit to the date. A demo also tests whether the page promise and the first minutes agree. Both produce numbers you can act on while there is still time.`,
      follow:`The demo has plenty of downloads and poor conversion. Where do you look?`,
      red:`Treats them as marketing tasks with no design signal in them.` }
  ],
  mid:[
    { q:`The page promises something the first ten minutes do not deliver. Options?`,
      a:`Change the page, change the first ten minutes, or accept the mismatch and expect refunds and early negative reviews. Measure which is cheaper and which is honest. The mismatch is usually cheapest to fix in the game’s first minutes, because that work also improves onboarding.`,
      follow:`The promise is what built the wishlists. Does that change the answer?`,
      red:`Keeps the promise because it converts and treats the refunds as unrelated.` },
    { q:`Build a discoverability plan with no budget.`,
      a:`List the beats that could build an audience, ordered by cost and expected effect, and pick the one demo or festival moment that best shows the loop. Use the language players of the comparables use rather than your internal vocabulary. Make sure the loop is legible on a stream, because that is free reach you either earn or forfeit.`,
      follow:`Your loop is not legible to a viewer who is not playing. What do you change?`,
      red:`Lists channels and posting frequency with no reference to what the game shows.` },
    { q:`How do you test the capsule?`,
      a:`Show it to ten matched players with no other context and ask what the game is and what they would do in it. Compare with your hook sentence. Wrong verbs and vague genres are the failure, and they point at the capsule rather than at the game.`,
      follow:`They name the right genre and the wrong verb. What do you change?`,
      red:`Polls the team and the existing community about which capsule they prefer.` }
  ],
  senior:[
    { q:`Discovery is the main failure mode of finished games. How do you make it a design constraint from month one?`,
      a:`Require that the hook is visible in one screenshot and provable in the first minute, and hold the design to that as you would to a platform constraint. Put the audience-building beats in the milestone plan rather than in a marketing plan attached at the end. Then decide what you will not design because it cannot be shown.`,
      follow:`What have you refused to build on those grounds?`,
      red:`Treats discoverability as something marketing solves after content lock.` },
    { q:`The launch underperforms. What do you learn, and what do you refuse to conclude?`,
      a:`Separate discovery from conversion from retention: page views, wishlist conversion, demo to purchase, refund rate and day-one retention each point at a different failure. Do not conclude the game is bad from a low top-line number until you know which step leaked. Then act on the leaking step rather than on the loudest opinion.`,
      follow:`The team wants to patch in more content immediately. What do you say?`,
      red:`Concludes the content was too thin without checking whether anyone reached it.` }
  ] });
FACTS('launch-and-discoverability',[
  { claim:`Steam’s content survey asks developers to disclose AI-generated content that ships with the game and reaches players (art, sound, narrative, localisation and any other content players see or hear), split into pre-generated content, made with AI tools during development, and live-generated content, made while the game runs. Efficiency gains from AI development tools are not covered. Valve rewrote the survey in January 2026.`, asOf:'2026-09-23', src:'https://partner.steamgames.com/doc/gettingstarted/contentsurvey' }
]);

T('live-operations',{ d:'product', t:'Post-launch and live operations', tag:'Release is a milestone, not a finish line. Decide what the game becomes after players arrive.',
  what:`What happens after launch: update cadence, balance and bug patches, seasons or events, community and support, and how ongoing content funds itself. A premium game, an update-driven game and a live-service game need different post-launch designs. Subway Surfers is the long-run case: since January 2013 its World Tour has changed the city every three or four weeks while the run underneath stays the same. Final Fantasy XIV (2010) is the rescue case: after a launch so broken that Square Enix suspended its own subscription fees, the team chose in 2011 to rebuild the game from scratch while still patching the live version, relaunching it as A Realm Reborn in 2013 and turning it into the series’ most profitable entry. Hearthstone is the rotation case: from April 2016 its Standard format retired older card sets from its main ranked format, which Blizzard said would keep the metagame moving, give designers room and let new players catch up, while a Wild format kept every card playable.`,
  why:[`Players find balance and exploit problems that testing missed.`,`Post-launch decisions are still design decisions, and they change what the game is.`,`Promising ongoing support is a design commitment, not a marketing line.`],
  think:{ q:[`What does the first update fix, and what does it add?`,`What cadence can the team sustain?`,`How do players report problems, and who answers?`,`Does the content model fund the updates?`,`What do we owe the players who arrived first?`],
    trade:[`Live content retains players and risks a treadmill, fatigue and scope.`,`Fast patches are responsive and can thrash the balance.`],
    traps:[`Launching a live plan with no capacity to run it.`,`Nerfing in silence.`,`Ignoring the community.`,`Monetizing the fix for a problem the design created.`],
    good:[`A realistic cadence.`,`A channel for feedback.`,`Updates that keep the original promise.`],
    bad:[`Radio silence.`,`Contradictory patches.`,`A roadmap nobody can build.`] },
  how:[`Plan the first ninety days before launch.`,`Separate fixes from features and say which a patch is.`,`Set a cadence you can keep and protect it.`,`Give players a channel and answer it visibly.`,`Watch the same signals you watched before launch and decide with the evidence.`,`Size the cadence to what players do, not to the plan: King doubled Candy Crush Saga’s level output, to 45 new levels a week by 2022, after finding many players waiting at the end of the map.`],
  ai:{ yes:[`Cluster community feedback and summarise sentiment.`,`Draft patch notes and update plans.`,`Simulate balance changes against player data.`],
       no:[`Decide what to change in response to the community.`] },
  prompts:[{l:'First update plan',p:`Here is our launch state, player feedback and team capacity: [CONTEXT]. Propose the first update split into fixes and additions, each with the player problem it addresses and the signal you would watch to know it worked. Flag anything the cadence cannot sustain.`}],
  verify:[`Does the promised cadence match the team?`,`Is there a feedback channel and an owner?`],
  test:[`Publish patch notes for one planned update. Can a player tell what changed and why?`],
  rel:[['business-model','The model determines what post-launch has to fund.'],['metrics-and-success','Post-launch you decide with the same signals.'],['launch-and-discoverability','The first players set the community tone.'],['iteration-and-evidence','Live updates are iterations on a larger stage.'],['soft-launch-and-playable-ads','The first-90-days plan starts from whatever the soft launch already proved or left unproven.'],['live-design-seasons-and-data','How to choose what a season contains from cohorts and guardrails.']] });
TECH('live-operations',[
  {n:'First-90-days plan', how:`Fixes and additions mapped to the first quarter after launch.`, fit:`Every launch, premium included.`, cost:`Commits capacity after the launch push.`, alt:`A smaller hotfix plan when live content is not intended.`},
  {n:'Feedback channel', how:`One visible place where players report problems and one owner who answers.`, fit:`Building trust and catching issues early.`, cost:`Triage load and expectation management.`, alt:`A public changelog and a monitored community thread.`},
  {n:'Update cadence', how:`A patch and content rhythm sized to the team after fixes are counted, with the slower of review time and build time setting the floor.`, fit:`Live games and update-driven games.`, cost:`Promise made in public.`, alt:`Milestone-sized updates rather than a fixed clock.`}
]);
ENGINE('live-operations',{
  godot:{ term:`Content ships after launch as a .pck resource pack downloaded into user:// and mounted at runtime. The engine binary cannot change this way, so anything needing a new engine feature still goes through the store.`,
    api:['ProjectSettings.load_resource_pack(path, replace_files)','HTTPRequest for the download','FileAccess.file_exists() / user:// cache','SceneTree.change_scene_to_file()','ProjectSettings application/config/version','push_error() on a rejected pack'],
    snippet:`extends Node                                   # ship content without a store review

func apply_patch(pck_path: String) -> bool:
\tif not FileAccess.file_exists(pck_path):
\t\treturn false
\t# replace_files = false: a patch adds, it never silently overwrites res://
\tif not ProjectSettings.load_resource_pack(pck_path, false):
\t\tpush_error("pack rejected, build version mismatch")
\t\treturn false
\tget_tree().change_scene_to_file("res://patched/season_2.tscn")
\treturn true`,
    pitfall:`Loading a pack with replace_files left at its default. It overrides existing res:// paths, so a pack built against a newer binary can swap a script or scene under a client that cannot run it, and the crash happens at scene load with no clue that a pack caused it. Pin every pack to an exact build version and prefer adding paths over replacing them.`,
    map:`Godot .pck resource packs are Unity Addressables remote content.` },
  unity:{ term:`Addressables with a remote catalogue. The client checks for catalogue updates at boot, downloads only the bundles whose hashes changed, then loads the new content by address.`,
    api:['Addressables.CheckForCatalogUpdates() / UpdateCatalogs()','Addressables.LoadAssetAsync() / LoadSceneAsync()','RemoteLoadPath / RemoteBuildPath','addressables_content_state.bin','Addressables.GetDownloadSizeAsync()','Addressables.ClearDependencyCacheAsync()'],
    snippet:`public class ContentUpdate : MonoBehaviour {
    IEnumerator Start() {
        var check = Addressables.CheckForCatalogUpdates(false);
        yield return check;
        if (check.Result.Count == 0) yield break;
        // Built with Update a Previous Build against addressables_content_state.bin,
        // so only the changed bundles get new hashes.
        yield return Addressables.UpdateCatalogs(check.Result, false);
        yield return Addressables.LoadSceneAsync("Season2");
    }
}`,
    pitfall:`Doing a full Addressables rebuild for a content update instead of “Update a Previous Build” against the saved content state. Every bundle gets a new hash, so returning players re-download the entire catalogue for a one-asset balance fix, and on mobile a large share of them never finish it. Keep the content state file in version control with the release.`,
    map:`Unity Addressables remote catalogues are Godot .pck packs mounted from user://.` },
  note:`The client half is a download and a mount. The decisions in this topic (what the first update fixes, what cadence the team can hold, how a nerf is announced) live in the backend and in the calendar. The engine work matters because it decides whether a fix takes a store review or an hour, and that single fact sets the cadence you are allowed to promise.` });
INTERVIEW('live-operations',{
  junior:[
    { q:`What goes into the first update after launch, and how do you decide?`,
      a:`Split it into fixes and additions and label which is which, because players read them differently. Prioritise the problems real players found that testing missed, especially exploit and balance issues that get worse with time. Say what signal you will watch to know each change worked.`,
      follow:`How do you choose a cadence you can keep?`,
      red:`Leads with new content while the launch-week defects are still open.` },
    { q:`Why is a roadmap a design commitment rather than a marketing asset?`,
      a:`Publishing it promises support the team has to be able to deliver, and players plan their time around it. A roadmap the team cannot build costs more trust than no roadmap at all. Size it against real capacity, including the time the same people spend on fixes.`,
      follow:`You have published one you can no longer keep. What do you do?`,
      red:`Publishes an ambitious roadmap to sustain interest and works out the capacity later.` },
    { q:`What is wrong with nerfing in silence?`,
      a:`Players notice the change and learn that the patch notes do not describe the game, which makes every future note suspect. Say what changed and why, including the uncomfortable ones. Communication costs nothing and is the main thing a live community judges you on.`,
      follow:`How do you communicate a nerf that a lot of players will dislike?`,
      red:`Leaves balance changes out of the notes to avoid an argument.` }
  ],
  mid:[
    { q:`Plan the first ninety days before launch. What is in it?`,
      a:`A cadence the team can sustain alongside fixes, a feedback channel with a named owner, the signals you will keep watching from before launch, and a split between fixes and features for each planned update. Decide in advance what an emergency looks like and who can call one. Write down what you owe the players who arrived first.`,
      follow:`The same team is also starting the next project. How does the plan change?`,
      red:`Plans content drops with no capacity reserved for the problems players will find.` },
    { q:`The community demands a change your data says is wrong. How do you handle it?`,
      a:`Cluster the feedback to find the underlying problem rather than the requested solution, because players report symptoms accurately and prescribe poorly. Check whether the loudest segment is the largest one. Then test the change or an alternative that addresses the same problem, and explain the reasoning in public either way.`,
      follow:`The loudest players are a small fraction of the base. Does that settle it?`,
      red:`Ships the requested change because the forum is unanimous.` },
    { q:`How do you avoid the live content treadmill?`,
      a:`Set a cadence you can hold indefinitely rather than the one that looks best in the first season. Invest in evergreen systems that keep producing play, and treat seasonal content as the smaller layer on top. Watch the dip between seasons, because that is where the treadmill shows up as churn.`,
      follow:`Retention dips sharply between seasons. What do you change?`,
      red:`Answers a fatigue problem by increasing the content rate.` }
  ],
  senior:[
    { q:`You inherit a live game with a five-year-old economy and a backlog of exploit reports.`,
      a:`Instrument first so you can see the flows, then triage the exploits by impact on the economy and on other players rather than by how egregious they look. Stage the fixes and communicate each one, because a sudden correction reads as a punishment to players who did nothing wrong. Balance the repair against what players already earned and say plainly where you are choosing trust over correctness.`,
      follow:`Fixing it devalues items long-standing players worked for. What do you do?`,
      red:`Corrects everything at once and treats the community reaction as noise.` },
    { q:`When do you sunset a live game, and how?`,
      a:`When the cost of running it no longer matches what it returns and no plausible change fixes that. Then the work is honest notice, stopping sales of anything that will not be honoured, and considering an offline or final version for the players who stayed. Decide it openly rather than letting the game decay into silence.`,
      follow:`Who should make that call, and who has to be in the room?`,
      red:`Lets updates quietly stop and never tells the players.` }
  ] });

T('soft-launch-and-playable-ads',{ d:'product', t:'Soft launch and playable ads', tag:'Prove the loop retains, earns and runs clean in a cheap market before spending real money to find that out everywhere else.',
  what:`A staged release to one or two small markets before global user acquisition spend, run to answer four questions in order: does the build run clean (crashes, load time, IAP and ad plumbing), do players come back (D1/D7/D30 retention), does the game earn more than it costs to acquire a player (CPI against LTV), and only then, should it scale. King’s own data staff describe the same trade in Candy Crush Saga: make a level easier and you convert fewer players, though retention always wins. Hyper-casual publishers such as Voodoo run a cheaper version of the same idea earlier still: before most of a game exists, they cut a rough prototype of the core mechanic and run real ad creative against it, reading cost per install and click-through rate as a verdict on the mechanic alone, before anything else is built. A playable ad is the instrument both stages lean on once a build exists: a small, self-contained, interactive slice of the game shown inside another app’s ad space, usually through the MRAID standard (Meta and Google Ads use their own call-to-action functions), ending on a store call to action. Because a playable, a trailer or a store page is drawn, coded or edited rather than screen-recorded honestly, it is also where a studio can quietly promise gameplay the shipped game does not have, which the UK’s advertising regulator has already ruled misleading rather than a marketing style choice.`,
  why:[`For a mobile game that buys its players, global user acquisition is usually the largest and least reversible spend; a soft launch buys the evidence to commit that spend, or not, before it is spent.`,
    `Retention and monetisation benchmarks published by any one source vary by genre, region and methodology, so a soft launch produces the studio’s own numbers rather than borrowing someone else’s.`,
    `A hyper-casual concept can be shown to be commercially dead, or worth building further, for the cost of a few ad campaigns, before a single system beyond the core mechanic exists.`,
    `Many soft-launched games are cancelled rather than scaled. Supercell’s CEO wrote in 2023 that it had launched 5 hit games and killed more than 30, which makes a soft launch a real decision gate, not a formality before a guaranteed launch.`,
    `A playable ad or trailer that shows gameplay the game does not have is a regulatory risk as well as a design dishonesty: the UK’s Advertising Standards Authority has already banned mobile-game ads whose gameplay did not represent the game.`],
  think:{ q:[`What is the one number, written down before launch, that would make us kill this game in soft launch?`,
      `Which test markets actually resemble our eventual paying audience, and which are only cheap volume for an early retention or technical read?`,
      `Is our soft-launch CPI a real preview of global CPI, or an artefact of a smaller, cheaper market that pays differently?`,
      `Does the playable ad show a moment that exists in the shipped game, on the path an ordinary player would actually reach it?`,
      `If a stranger played only the ad’s fifteen seconds, could they describe the real game accurately afterwards?`],
    trade:[`A longer soft launch produces better evidence and costs months of runway and a live competitor’s head start.`,
      `A playable ad that shows an invented highlight can convert more installs than an honest one showing the slower real opening, but those extra installs tend to churn early once the game does not deliver it.`],
    traps:[`Setting the kill bar after the first week of disappointing data arrives, once everyone attached to the project has an opinion about what the numbers should mean.`,
      `Reading a Philippines or Southeast Asia CPI as a preview of US or UK CPI, when the two markets do not pay the same way at all.`,
      `Building the playable ad from marketing’s idea of the fun part rather than an actual, reachable moment in the current build.`,
      `Skipping soft launch because the studio “already knows” the game works, when even Supercell, with five hits behind it, has killed more than 30 games, Rush Wars among them after a public beta.`],
    good:[`The kill, iterate and scale criteria for every phase were written down before the first soft-launch user was even acquired.`,
      `Every scene the playable ad shows is a moment a player will actually reach, at roughly the point it is shown.`],
    bad:[`The team moves the retention bar down after the data disappoints, instead of moving on from the game.`,
      `Players who installed from the ad describe the shipped game as “nothing like” it.`] },
  how:[`Write the kill, iterate and scale criteria for each phase before acquiring a single test-market user: the D1/D7/D30 line, the CPI ceiling, and the LTV:CPI ratio that must hold to scale.`,
    `Pick test markets for what they actually tell you, not out of habit: a market close to the eventual paying audience for a monetisation read (commonly Canada, Australia, New Zealand or the Nordics, all English-fluent and economically closer to a US audience than most markets; Supercell tested Rush Wars in Finland, Australia, Canada and New Zealand), a cheap, English-fluent volume market for an early technical and retention read (commonly the Philippines), and usually not the market the global launch most depends on.`,
    `Run the technical phase first and alone. No retention or monetisation number is allowed to matter until crashes, load time, and the IAP and ad plumbing are clean.`,
    `For a hyper-casual concept, test before building past the mechanic: cut a rough prototype of the core loop alone and run it as real ad creative to read CPI and click-through before committing to a fuller build.`,
    `Build the playable ad from an actual moment in the current build, keep it to one self-contained file under the tightest network limit you plan to run on, and route its call to action through the network’s own click API, never a generic link.`,
    `Test the playable itself the way you test the game: watch strangers play it cold, and change or kill it on the same evidence discipline as the soft launch it feeds.`,`Pick the engine with the ad network’s size cap in mind: Defold’s empty HTML5 build is a compressed download of under 1 MB, and Cocos Creator’s Web Mobile build is the usual base that community tools package into one-file playable ads.`],
  ai:{ yes:[`Draft phase-by-phase kill, iterate and scale criteria from the studio’s genre and named comparables, marked as a draft for a human to commit to before any data arrives.`,
      `Summarise soft-launch telemetry into the four standing questions (technical, retention, monetisation, scale) and flag which one the data still cannot answer.`,
      `Check a playable ad’s script or storyboard against the current build for a scene, a difficulty spike or content that does not exist yet, or exists only much later than shown.`],
     no:[`Decide the kill bar once disappointing data already exists. That is exactly the moment a bar chosen in advance is supposed to hold against.`,
      `Approve a playable ad or trailer as “representative enough”. That judgement is legal and reputational, not a summarising task.`] },
  prompts:[{l:'Playable-ad honesty check',p:`Here is our playable ad’s script or storyboard: [DESCRIPTION]. Here is what the current build actually contains: [BUILD STATE]. For every scene or mechanic the ad shows, name the exact place in the shipped game a player would reach it, and roughly how many minutes or levels in. Flag anything shown that does not exist in the build yet, exists only very late, or needs a skill the average first-session player will not have. Do not soften the answer.`},
    {l:'Soft-launch gate draft',p:`Our genre is [GENRE], our comparables are [LIST], and our intended scale markets are [MARKETS]. Draft kill, iterate and scale criteria for each of the four soft-launch phases (technical, retention, monetisation, scale), each as a specific number or range, and name which published benchmark or comparable each number came from. Flag every number that is a guess rather than sourced, and state plainly where benchmarks disagree.`}],
  verify:[`Did it cite a real, named benchmark or comparable for every number, or invent a plausible-looking retention curve?`,
    `Did it check the playable’s claims against the actual current build, or take the storyboard’s word for what exists?`],
  test:[`Show the muted playable ad to someone who has never seen the game and time how long it takes them to reach the store button unprompted.`,
    `Run the exported playable through the target network’s own preview or validator before submission, on the same device tier the campaign will target.`,
    `Ask a soft-launch cohort to describe the game after their first session, and compare it with what the store page and any ad promised.`],
  rel:[['business-model','The model decides what the monetisation gate must prove; this topic tests it in a real market.'],
    ['launch-and-discoverability','The store page and any ad make the same honesty promise a playable does, at global scale.'],
    ['live-operations','A game that clears soft launch still needs the first-ninety-days plan this topic assumes exists.'],
    ['metrics-and-success','Soft launch is where the kill criteria and instrumentation that topic argues for get their first real test.'],
    ['scope-control','Hyper-casual ad-first testing is the most extreme form of gating production on validated evidence.'],
    ['ethics-and-responsibility','Showing gameplay the game does not have is the same store-promise dishonesty that topic treats as a design decision.']] });
TECH('soft-launch-and-playable-ads',[
  {n:'Phased soft launch', how:`Release to one or two small markets and gate the game by technical health, then retention, then monetisation, before opening the market you actually want.`, fit:`A game with a marketing runway and a model (live-service or premium with DLC) that can afford weeks to months of staged testing.`, cost:`Costs calendar time and gives a well-resourced competitor a head start while the game is public but unfinished.`, alt:`A single combined market, chosen to read both retention and monetisation at once, when time is tighter than money.`},
  {n:'Hyper-casual ad-first testing', how:`Cut a rough prototype of the core mechanic alone and run real ad creative against it to read CPI and click-through before committing to a fuller build.`, fit:`Concepts cheap enough to prototype in days, where the mechanic alone can be judged from an ad.`, cost:`The ad numbers alone say nothing about retention or monetisation (Voodoo reads retention and playtime from the installed prototype separately), and little about a game with a real meta or narrative layer.`, alt:`A short internal playtest first, so media budget is not spent on a mechanic nobody can even operate.`},
  {n:'Playable ad as a design test', how:`Build the ad from an honest slice of the real game and iterate it with the same before-and-after discipline as any other prototype.`, fit:`Any game running paid user acquisition, hyper-casual or not.`, cost:`An honest playable that shows a slower real opening can under-convert against a rival’s exaggerated one.`, alt:`Pair an honest playable with a demo, so the two prove the same promise at two different scales.`}
]);
ENGINE('soft-launch-and-playable-ads',{
  godot:{ term:`Godot ships no ads network, analytics or remote-config SDK of its own, and its HTML5 export is not a playable-ad candidate as it stands: a build exports as separate .html, .wasm, .pck and .js files rather than the single self-contained HTML file Unity Ads and AppLovin demand (Meta and Google Ads take a small ZIP, still capped at 5 MB), and the baseline size alone can exceed the tightest network limits before a single game asset is added. Studios building a Godot game therefore usually rebuild the playable as a separate, lightweight web slice; if a size-trimmed custom export template does fit a network’s limit, the one piece of engine code that matters is the bridge to the ad network’s own click API, shown below.`,
    api:['JavaScriptBridge.eval()','OS.has_feature("web")','Button.pressed','Export preset: Web (produces .html/.wasm/.pck/.js, not one file)','HTTPRequest (game telemetry only: Meta and AppLovin ban network calls in a playable)'],
    snippet:`extends Button                        # the store CTA in a size-trimmed Godot playable
@export var store_url := "https://play.google.com/store/apps/details?id=demo"

func _ready() -> void:
\tpressed.connect(_on_cta)

func _on_cta() -> void:
\tif not OS.has_feature("web"):
\t\treturn
\t# call the network's own click API, never a raw link, or the install goes unattributed
\tJavaScriptBridge.eval(
\t\t"if(window.mraid){mraid.open('%s');}else if(window.FbPlayableAd){FbPlayableAd.onCTAClick();}" % store_url,
\t\ttrue)`,
    pitfall:`Driving the CTA with a raw navigation call (window.location, or a plain link) instead of the network’s required function. The ad runs inside the network’s own webview or MRAID container, which intercepts a click through mraid.open() or its own onCTAClick() to attribute the install and close the ad correctly; a raw navigation can be blocked by the container or never counted as a click, and Meta’s spec bans JavaScript redirects outright.`,
    map:`Godot’s JavaScriptBridge.eval is Unity’s [DllImport("__Internal")] call into a .jslib plugin; both exist only to hand one click to code neither engine controls.` },
  unity:{ term:`Unity’s Web export hits the same wall from the other side: in measurements published by a former Unity engineer, an empty Unity 6 project from the default 3D URP template built to about 10.7 MB, and only heavy stripping (Built-in pipeline, High managed stripping, no Input System or UI package, Disk Size with LTO) brought it near 2 MB before any game content. Unity’s own route to a playable is its Playworks plugin, which converts a scene and its existing game code for the ad networks and takes its call to action through Luna.Unity.Playable.InstallFullGame(). A trimmed Web build shipped as it is needs the bridge below instead: a .jslib call into the network’s click function, never Application.OpenURL, which an ad’s sandboxed webview usually blocks or ignores.`,
    api:['[DllImport("__Internal")]','.jslib plugin under Assets/Plugins/WebGL','UnityEngine.UI.Button.onClick','PlayerSettings.WebGL.compressionFormat (Brotli) and Build Profiles Code Optimization: Disk Size with LTO','Application.OpenURL() (avoid inside a playable)'],
    snippet:`using System.Runtime.InteropServices;
using UnityEngine;

public class PlayableCta : MonoBehaviour {
    [DllImport("__Internal")] static extern void openStoreCta();
    // defined in a .jslib: calls mraid.open(url) or FbPlayableAd.onCTAClick()

    public void OnCtaTapped() {
        openStoreCta();          // never Application.OpenURL inside a playable
    }
}`,
    pitfall:`Calling Application.OpenURL() for the store link because it works in an ordinary WebGL build. Inside an ad network’s sandboxed iframe or in-app webview that call is usually blocked as a popup or does nothing, and even where it fires it bypasses the network’s own click accounting, so the network cannot attribute the install and can reject the creative outright. Route the tap through a .jslib plugin into the network’s required function instead.`,
    map:`Unity’s [DllImport("__Internal")] into a .jslib plugin is Godot’s JavaScriptBridge.eval; each is the one sanctioned hole in the engine’s sandbox for a fact only the host page holds.` },
  note:`Neither engine’s default web export is the small, self-contained artefact a playable ad has to be. Godot studios usually rebuild the playable in lightweight web code or trim a custom export template; Unity studios can run a scene through Unity’s own Playworks plugin instead. Whichever route builds it, the piece worth getting right is the click bridge: wiring the call to action to the network’s own function, because a raw link can get a creative rejected or leave its installs unattributed.` });
INTERVIEW('soft-launch-and-playable-ads',{
  junior:[
    { q:`What does a soft launch actually test, in order?`,
      a:`Technical health first (crashes, load time, IAP and ad plumbing), then retention (do players come back), then monetisation (does the game earn more than it costs to acquire a player), and only then whether to scale. Each phase is a gate: a game can be cancelled at any of them, not only at the very end.`,
      follow:`Which of those four would you test first if the team could only afford one?`,
      red:`Jumps straight to CPI and revenue with no mention of whether the game even runs cleanly.` },
    { q:`Why does a hyper-casual publisher test ad creatives before the game is built?`,
      a:`Because the core mechanic alone, cut as a rough prototype, can be judged from how cheaply and reliably an ad for it turns into an install. If cost per install and click-through rate are poor, no amount of later content fixes a mechanic nobody wants to try, so it is cheaper to learn that before building anything else.`,
      follow:`What can that test not tell you about the eventual game?`,
      red:`Treats a good prototype-ad CPI as proof the finished game will retain or monetise.` },
    { q:`What is a playable ad, and what does MRAID have to do with it?`,
      a:`A small, self-contained interactive slice of the game, usually one HTML file, shown inside another app’s ad space and ending on a store call to action. MRAID is the IAB standard API that lets that HTML talk to the host app’s ad SDK: opening the store page through mraid.open(), resizing or closing the ad, and knowing when it is on screen. Unity Ads and AppLovin build on it; Meta and Google Ads ask for their own call instead, FbPlayableAd.onCTAClick() and ExitApi.exit().`,
      follow:`Why does the file have to be self-contained, with no outside requests?`,
      red:`Describes a playable ad as just a video with a button on it.` }
  ],
  mid:[
    { q:`A soft-launch cohort in the Philippines shows a strong CPI. Can you scale on that number?`,
      a:`Not directly. A cheap, English-fluent market is good for an early technical and retention read, but its CPI and spend behaviour do not predict what a Canadian, Australian or UK cohort will do, let alone the US. Use it to catch problems early and cheaply, and read monetisation from a market that actually resembles where you intend to scale.`,
      follow:`What would make you trust a low-CPI market’s number more?`,
      red:`Presents a cheap market’s CPI as the number that will hold at global scale.` },
    { q:`Design the kill criteria for a soft launch before it starts. What goes wrong if you wait?`,
      a:`Write the specific D1/D7/D30 line, the CPI ceiling and the LTV:CPI ratio that must hold, for each phase, before a single test-market user is acquired. Waiting means the criteria get negotiated once disappointing numbers already exist, and by then everyone attached to the project has a reason to move the bar instead of the game.`,
      follow:`The numbers land right on the line you set. What do you do?`,
      red:`Treats “let’s see how it feels” as a substitute for a written number.` },
    { q:`You are building a playable ad. Where does it usually go wrong?`,
      a:`Either technically, because the file is not truly self-contained, reaches for an external asset, or redirects directly instead of through the network’s click API, and gets rejected or under-reports installs; or honestly, because marketing ships a moment that is not actually in the build, the same failure the ASA has banned mobile-game video ads for. Check both before submission.`,
      follow:`How would you check the second failure without reading every line of the HTML?`,
      red:`Approves a playable because it looks impressive, without checking it against the current build.` }
  ],
  senior:[
    { q:`You inherit a soft launch with no written kill criteria and disappointing D7 retention. What do you do?`,
      a:`Separate what the aggregate number is hiding: is the loop genuinely not retaining, is the test market’s cohort simply unrepresentative, or is a technical issue (load time, a crash on a common device) suppressing a real number. Write the missing criteria now, even retroactively, and defend the game’s right to be killed on the same evidence a healthier game would have been scaled on.`,
      follow:`The team wants to extend the soft launch again to see if the number improves. When do you agree, and when do you refuse?`,
      red:`Extends indefinitely because nobody wants to be the one who kills it.` },
    { q:`Marketing wants the playable ad and the trailer to show a boss fight that is three months from being in the build. How do you handle it?`,
      a:`Say plainly that this is the exact pattern regulators have already ruled against: showing gameplay that is not representative of what most players will actually reach, disclaimer or not. Offer the honest alternative, an early, real moment that still sells the hook, and add the boss fight to the campaign only once it ships and is reachable in a normal first session, not a curated one.`,
      follow:`The boss fight converts far better in early tests than anything from the real early game. What does that tell you?`,
      red:`Ships it with a “gameplay not representative” disclaimer and calls the risk covered.` },
    { q:`A hyper-casual concept passes every ad test, but the studio has never built anything past the mechanic before. What do you insist on before greenlighting production?`,
      a:`That the ad test answered exactly one question, whether a stranger will tap install for this mechanic, and name everything it did not test: retention past session one, monetisation, and whether the mechanic survives being played for more than a minute. Insist on a short, cheap prototype of session two before committing production budget, since that gap is what separates a viral ad from a game.`,
      follow:`The publisher wants to greenlight on the ad numbers alone, to move fast. How do you respond?`,
      red:`Treats a strong ad-test CPI as equivalent to a validated game.` }
  ] });
FACTS('soft-launch-and-playable-ads',[
  { claim:`Playable ads are commonly built on MRAID (Mobile Rich Media Ad Interface Definitions), the IAB Tech Lab’s standard JavaScript API between a rich-media ad and its host app. The current version, MRAID 3.0, was finalised in June 2018.`, asOf:'2026-09-25', src:'https://iabtechlab.com/standards/mobile-rich-media-ad-interface-definitions-mraid/' },
  { claim:`Unity’s own playable-ad specification requires a single, inlined and minified index.html file, with no links to other files or folders, under 5 MB.`, asOf:'2026-09-25', src:'https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications' },
  { claim:`AppLovin requires each playable ad to be a single HTML file of 5 MB or smaller, with every resource embedded as base64 or base122; external resources are not allowed.`, asOf:'2026-09-25', src:'https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines' },
  { claim:`For Google Ads App campaigns, an HTML5 or playable asset is uploaded as a single .ZIP of up to 5 MB containing no more than 512 files.`, asOf:'2026-09-25', src:'https://support.google.com/google-ads/answer/9981650' },
  { claim:`Meta accepts a playable either as one HTML5 file with every asset inlined as data URIs, or as a ZIP with index.html at its root and no more than 100 files, capped at 5 MB either way. It must work without mraid.js, make no external network calls or dynamic asset loads, and should call FbPlayableAd.onCTAClick() for the call to action.`, asOf:'2026-09-25', src:'https://en-gb.facebook.com/business/help/412951382532338' },
  { claim:`On 30 September 2020 the UK’s Advertising Standards Authority upheld complaints against two paid-for Facebook video ads by PLR Worldwide Sales Ltd t/a Playrix, for Homescapes and Gardenscapes, that showed pin-pulling puzzles. Despite on-screen text saying “Not all images represent actual gameplay”, it ruled them misleading: the games mostly consisted of match-three levels and a renovation storyline, and players had to get through a lot of different content to reach the featured puzzles. The ads must not appear again in that form.`, asOf:'2026-09-25', src:'https://www.asa.org.uk/rulings/plr-worldwide-sales-ltd-g20-1061644-plr-worldwide-sales-ltd.html' },
  { claim:`Godot’s web export produces separate .html, .js, .wasm and .pck files, plus a boot-splash .png, rather than one self-contained file; the docs note the WebAssembly engine module compresses to about a quarter of its original size with gzip.`, asOf:'2026-09-25', src:'https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html' }, { claim:`An open Godot issue reported that in Godot 4.0 beta 4 the web export of a single empty 2D node came to over 40 MB, against over 20 MB in Godot 3.5, before any game asset was added.`, asOf:'2026-09-25', src:'https://github.com/godotengine/godot/issues/68647' },
  { claim:`A June 2024 Deconstructor of Fun write-up on Voodoo’s own site, drawn from an interview with its VP Gaming, says Voodoo tests around 1,000 prototypes a year with roughly 100 in progress at once, and that only about 0.4%, around four games a year, reach full launch. In its hybrid-casual process a prototype aims for a sustainable return on ad spend of at least 150%, while retention and CPI are tuned, before soft launch.`, asOf:'2026-09-25', src:'https://voodoo.io/news/voodoo-s-secret-sauce-from-0-to-250m-hybridcasual-revenue-in-3-years' },
  { claim:`In a 15 February 2023 post, Supercell CEO Ilkka Paananen wrote that the company had launched 5 hit games but killed more than 30.`, asOf:'2026-09-25', src:'https://supercell.com/en/news/next-chapter/' },
  { claim:`Supercell put Rush Wars into beta on 26 August 2019, testing it in Finland, Australia, Canada and New Zealand.`, asOf:'2026-09-25', src:'https://supercell.com/en/news/welcome-rush-wars/7177/' }, { claim:`On 5 November 2019 Supercell said it would not continue the Rush Wars beta: updates made after players called the game repetitive had not made it fun enough, and the team felt that even with more work it would not reach Supercell’s bar of a game played for years and remembered forever. The beta ran until 30 November 2019.`, asOf:'2026-09-25', src:'https://supercell.com/en/news/rush-wars-closing/7225/' },
  { claim:`GameAnalytics’ 2026 benchmark report, from a sample of over 16,000 mobile games (minimum 1,000 monthly active users) across 9 regions through 2025, put median Day 1 retention at around 22% (the top 1% of games reached 64 to 68%), median Day 7 at just under 4%, and median Day 30 at 0.7 to 0.8%. The report states genre-level breakdowns are not available in this edition, so treat any genre-specific D1/D7/D30 numbers quoted elsewhere as unverified for the current year.`, asOf:'2026-09-25', src:'https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks' }
]);
DIAGRAM('soft-launch-and-playable-ads', { kind:'flow', title:'Soft launch: the phases and the gate at each one',
  steps:[{id:'technical', t:'Technical launch', d:'crashes, load time, IAP and ad plumbing'},
    {id:'retention', t:'Retention test', d:'do players come back on D1, D7, D30'},
    {id:'monetisation', t:'Monetisation test', d:'does the game earn more than it costs to acquire a player'},
    {id:'scale', t:'Scale', d:'open the market this was all done to reach'},
    {id:'kill', t:'Cancelled', d:'players did not come back often enough'},
    {id:'kill2', t:'Cancelled', d:'each player costs more than they earn'}],
  edges:[['technical','retention'],['retention','monetisation','clears the bar'],['retention','kill','falls short'],['monetisation','scale','LTV > CPI'],['monetisation','kill2','falls short']],
  note:'Many soft-launched games are cancelled at the retention or monetisation gate rather than scaled. The bar has to be written down before the first cohort arrives, or it quietly moves instead.' });

T('localization-and-culture',{ d:'product', t:'Localisation and culturalisation', tag:'Text, layout and meaning all change between languages and markets. Design for it before it is expensive.',
  what:`Designing text, interface and content to survive translation and cultural change: string expansion and contraction, gendered and plural grammar, text baked into images or spoken aloud, right-to-left layout, icons and colours that carry meaning, and the platform or age requirements of each market. Tetris is the extreme case: an abstract game with no invented world, so only its menu text needed translating.`,
  why:[`German runs longer than English and breaks tight layouts; Chinese runs shorter but needs larger glyphs, so neither fits an English-sized box.`,`Meaning does not always translate, and references can fail or offend.`,`Retrofitting localisation costs far more than designing for it.`,`A market can refuse a launch for a rating or payment reason.`],
  think:{ q:[`How much can this string grow, and does the layout absorb it?`,`Is the meaning in text, in an icon, or in a voice line?`,`What in our art or writing is culture-specific?`,`What does each target market require for rating, language and payment?`,`Who approves the translated tone?`],
    trade:[`Designing for all languages constrains voice and layout.`,`Localizing everything costs and reaches more players.`],
    traps:[`Text baked into images.`,`Hard-coded grammar assumptions.`,`Symbols and colours treated as universal.`,`Translation started at the end.`],
    good:[`Layouts survive the longest translation.`,`Tone guides exist and strings are externalized.`],
    bad:[`The interface breaks in German.`,`Jokes fall flat.`,`A market cannot launch for a rating reason.`] },
  how:[`Externalize every string.`,`Budget for text expansion and test the longest language.`,`Annotate context for translators, including tone and speaker.`,`Use locale-aware formatting for numbers, dates and currency.`,`Check platform and rating requirements early.`,`Weigh what adapting a game removes as well as what it smooths: Atlus USA’s 1996 Revelations: Persona renamed characters and the town, changed the hero’s hairstyle and several characters’ ethnic origins, and cut the whole Snow Queen route for fear Japanese references would alienate Western players; GameSpot faulted the localisation, and the 2009 PSP remake restored the route and kept close to the original script.`,`Record why a relocation was made and what it keeps, because later instalments inherit it: Ace Attorney’s 2005 English release set the series in California “without thinking a lot about it”, and as later games grew more visibly Japanese the setting had to become an alternative Los Angeles where Japanese culture flourished.`,`Keep every line of text out of code from the first build: Ren’Py’s translate command writes each line to tl/<language> files, which turns localisation into a file handoff instead of a code change.`],
  ai:{ yes:[`Pre-translate drafts and flag expansion risk.`,`Explain cultural references and adapt tone against a guide.`,`Generate pseudo-localized strings to test layout.`],
       no:[`Sign off the final localised tone or the cultural fit.`] },
  prompts:[{l:'Localization prep',p:`Here are our UI strings and their layout constraints: [LIST]. For each, state the maximum expansion the layout allows, whether the meaning depends on grammar, gender or word order, and the terms that need a glossary entry. Flag strings whose meaning is carried by an image or a voice line.`}],
  verify:[`Are all strings externalized?`,`Has the longest target language been tested in layout?`,`Are platform and rating requirements known?`],
  test:[`Pseudo-localize every string with a longer language and open every screen. Note what overflows or clips.`],
  rel:[['ux-as-design','Localization is a layout and information problem.'],['readability-and-hierarchy','Translation changes the length and weight of everything.'],['premise-and-world','Cultural references live in the writing and the art.'],['platform-and-session','Markets bring their own platform and rating rules.']] });
TECH('localization-and-culture',[
  {n:'String externalization', how:`All display text separated from code and layout.`, fit:`Any game that may ship in more than one language.`, cost:`Up-front engineering and discipline.`, alt:`A late extraction pass for tiny projects, at higher cost.`},
  {n:'Pseudo-localization', how:`Replace strings with a longer, accented version to test layout before translation.`, fit:`Catching overflow early and cheaply.`, cost:`Another build variant to maintain.`, alt:`Design with the longest known language in mind.`},
  {n:'Cultural review', how:`A pass on references, symbols, colours and representation per target market.`, fit:`Markets and content where meaning is not universal.`, cost:`Slows a launch and can require art changes.`, alt:`Flag risky content and localise only what is necessary.`}
]);
ENGINE('localization-and-culture',{
  godot:{ term:`Strings live in translation files imported as Translation resources, and the game asks for them with tr. One key carries the whole sentence including its placeholders, so word order stays with the translator.`,
    api:['tr() / tr_n() / atr()','TranslationServer.set_locale() / get_loaded_locales()','String.format() with named placeholders','POT generation in Project Settings > Localization','Node.auto_translate_mode (Godot 4.3+)','OS.get_locale()'],
    snippet:`extends Label

func _ready() -> void:
\tauto_translate_mode = Node.AUTO_TRANSLATE_MODE_DISABLED   # translate once, here
\tTranslationServer.set_locale(OS.get_locale())

func refresh(found: String, count: int) -> void:
\t# One key with placeholders inside it. Fragments freeze English word order.
\ttext = tr("HUD_FOUND").format({"item": tr(found), "n": count})
\t$Plural.text = tr_n("ITEM_ONE", "ITEM_MANY", count)`,
    pitfall:`Building sentences by concatenating translated fragments. Languages put the number, the object and the verb in different places, so tr(“YOU_FOUND”) plus a name is untranslatable and the translator has no way to fix it. Ship one key per sentence with named placeholders, and use tr_n for every string that contains a count, because the translator’s language, not English, decides how many plural forms it needs.`,
    map:`Godot’s tr with imported translation resources is Unity’s Localization package with string tables.` },
  unity:{ term:`The Localization package holds locales, string tables and smart strings. A LocalizeStringEvent binds a table entry to a label, and the font asset has to cover the glyphs every target locale needs.`,
    api:['LocalizedString / LocalizeStringEvent','LocalizationSettings.SelectedLocale','StringTable + Smart String arguments','TMP_FontAsset fallback list / TMP_Settings.fallbackFontAssets','Pseudo-Locale for the layout pass','LocalizationSettings.InitializationOperation'],
    snippet:`public class Hud : MonoBehaviour {
    [SerializeField] LocalizeStringEvent found;    // string table entry, Smart String
    [SerializeField] TMP_FontAsset cjkFallback;    // Latin-only atlases render CJK as boxes

    void Awake() {
        TMP_Settings.fallbackFontAssets.Add(cjkFallback);
    }

    public void Refresh(string item, int count) {
        found.StringReference.Arguments = new object[] { new { item, n = count } };
        found.RefreshString();                     // plural and gender handled in the entry
    }
}`,
    pitfall:`Shipping a TextMeshPro font asset baked with a Latin character set. Pseudo-localisation passes because it is still Latin, and the first CJK or Cyrillic build renders every glyph as a box with no error in the console. Configure the fallback chain and test with a real translated string, not an accented one.`,
    map:`Unity’s Localization package with string tables is Godot’s tr with imported translation resources.` }});
INTERVIEW('localization-and-culture',{
  junior:[
    { q:`What breaks in an interface when you translate English into German?`,
      a:`Strings expand, so labels clip, buttons overflow and layouts that were tight become broken. Chinese contracts in width instead, but its glyphs need a larger point size and taller lines to stay legible, so boxes that fit German can still clip vertically. Budget expansion per string and test the longest target language rather than assuming the English fits everywhere.`,
      follow:`What else changes for a right-to-left language?`,
      red:`Assumes a font change and a smaller size will absorb it.` },
    { q:`Why must strings be externalised?`,
      a:`Because anything baked into an image, a scene or a hard-coded line cannot be translated without a rebuild by the original discipline. Externalising is cheap at the start and expensive to retrofit across a finished project. The same applies to text in textures and to information carried only by a voice line.`,
      follow:`What do you do about text already baked into art?`,
      red:`Plans to hand the translator a build and a spreadsheet extracted at the end.` },
    { q:`What is culturalization, as distinct from translation?`,
      a:`Translation moves the words. Culturalization checks that the meaning survives: references that do not land, gestures and symbols that read differently, colours that carry another association, and content a market’s rating or payment rules will not accept. It can change art and design, not only strings.`,
      follow:`Give one example where a mechanic, not a line, had to change.`,
      red:`Treats it as the same job as translation with a longer deadline.` }
  ],
  mid:[
    { q:`What is pseudo-localization and what does it catch?`,
      a:`Replacing every string with a longer, accented version and opening every screen. It catches overflow, clipping, hard-coded strings that do not change, concatenation that breaks, and layouts that cannot absorb expansion. It runs before a single real translation exists, which is the point.`,
      follow:`What does it not catch?`,
      red:`Waits for the first real translation to find layout problems.` },
    { q:`Give examples of hard-coded grammar assumptions and how you fix them.`,
      a:`Sentences assembled from fragments, plural forms that assume one rule, gendered nouns and adjectives, and number, date and currency formatting glued in by hand. The fix is full sentences per case as message templates with named variables, plus locale-aware formatting. It raises the string count, which is the cost of a sentence that is correct in every language.`,
      follow:`Your string count triples. How do you justify that?`,
      red:`Keeps string concatenation and asks translators to work around it.` },
    { q:`How do you brief a translator?`,
      a:`Give context per string: who is speaking, to whom, in what tone, on what screen, with what maximum length. Supply a glossary for terms that must stay consistent, and mark which strings are UI and which are voice. A translator working from a bare spreadsheet is guessing, and the guesses show up as tonal drift.`,
      follow:`Quality varies between vendors. How do you check it without speaking the language?`,
      red:`Sends the string table with no context and reviews only the word count.` }
  ],
  senior:[
    { q:`Plan localisation for six languages from month one.`,
      a:`Externalise everything and forbid text in textures from the start. Put pseudo-localization into the build so layout regressions are caught the day they appear. Budget expansion per layout, maintain a glossary and a tone guide, and schedule a culturalization review per market alongside the rating and payment requirements. The reviews belong before content lock, not after.`,
      follow:`One market requires a content change to be rated at all. How do you decide?`,
      red:`Schedules translation as a phase at the end and treats layout as a localisation vendor problem.` },
    { q:`A market cannot launch because of a rating requirement discovered late. Walk me through it.`,
      a:`Establish exactly what the requirement is rather than the summary of it, then find the cheapest compliant change and cost its design implications. Weigh that against what the market is worth. If the change breaks something central, be explicit that the honest options are a separate build or not launching there.`,
      follow:`The compliant change breaks a core mechanic. What do you recommend?`,
      red:`Assumes the requirement can be negotiated or worked around at submission.` }
  ] });

T('ethics-and-responsibility',{ d:'product', t:'Ethics and responsibility', tag:'Dark patterns, compulsion and data are design decisions. Make them on purpose, or make them by accident.',
  what:`The ethical constraints a design chooses: monetisation that respects the player, engagement versus compulsion, gambling-like mechanics, data and privacy, representation, and honest claims. Treat these as constraints in the same family as scope or platform, applied early rather than reviewed at the end. Flappy Bird’s creator applied this test to his own hit: he told Forbes the game “happened to become an addictive product” instead of something played for a few minutes when relaxed, and removed it from both app stores in February 2014, saying his guilt had been costing him sleep. Valve’s own weapon-skin market shows the reactive alternative to designing the constraint up front: it took a 2016 gambling scandal built on Steam’s own trading API before Valve sent cease-and-desist letters to the sites exploiting it.`,
  why:[`The same loop that retains can manipulate, and the difference is whether the player would endorse it knowing the design.`,`Player trust is a long-term asset and a short-term temptation.`,`The evidence on harm is correlational. A Reddit-recruited survey of 7,422 players (Zendle and Cairns, PLOS ONE 2018) linked loot-box spending to problem-gambling severity more strongly than other in-game spending did, but it cannot say which causes which. Enforcement is concrete: Epic Games paid USD 520 million in December 2022 over children's privacy and deceptive interfaces such as one-button purchases and hidden refunds.`,`Regulation and platform rules keep moving, so designing late means costly rework.`],
  think:{ q:[`Would the player consent to this design if they could see it?`,`Does this pressure the player or inform them?`,`Does it respect their time, money and data?`,`Who is excluded or stereotyped by the defaults?`,`Does the store promise match what the game does?`,`If a regulator, a journalist or a parent asked, who is accountable for this design, and does that person know how it works?`,`Does a playable ad or trailer show gameplay a player will actually reach, or a moment built only to sell the ad?`],
    trade:[`Respectful design can earn less per player and more trust.`,`Aggressive design can earn more now and cost the audience later.`],
    traps:[`Fear of missing out used as the retention engine.`,`Reward mechanics that blur their own value.`,`Pay to skip a problem the design created.`,`Opaque data use.`,`Default characters who quietly exclude.`,`Treating the business asked for it as the reason. The designer who built the loop is accountable for it.`,`Accountability that belongs to everyone, so nobody can stop a release.`],
    good:[`The model is explainable and the player would accept it.`,`The values sit next to the pillars.`],
    bad:[`The game is easier to describe as a habit than as an experience.`] },
  how:[`Write the design values next to the pillars.`,`Review the monetisation loop for pressure rather than value.`,`Look at who pays. For each offer, list how much of its revenue comes from the top handful of spenders. In the largest survey on loot boxes (Zendle and Cairns 2018, 7,422 players recruited on Reddit) players with problem-gambling scores spent far more on loot boxes than others (average self-reported band USD 20-40 a month for problem gamblers against USD 1-10 for non-problem gamblers), and loot-box spending tracked gambling severity much more than other spending did (eta squared 0.054 against 0.004). The study is correlational, so it cannot say loot boxes cause harm, but it says where to look. An offer that leans on a few heavy spenders needs a review.`,`Audit every purchase flow against the FTC's Epic Games allegations (December 2022): buttons that charge with one press, purchases that happen on loading or sleep screens, and refund or cancel paths that are hard to find. Fix them before a regulator does.`,`Make odds and data use explicit.`,`Watch the target player for discomfort in a test.`,`Revisit before launch and at each update.`,`Name who on the team is accountable for player-facing risk, and give them the right to stop a release.`,`Keep a short decision record for each monetisation or data choice: the pattern, who approved it, the guardrail and the date to revisit. A senior designer should be able to hand it to a lawyer or a journalist without embarrassment.`,`Say no in the terms the room uses: fines, store rejection, refund rate, trust, and the retention of the players who pay longest. Offer an alternative that still meets the revenue goal.`,`Run the consent test on your own work last, and ask a peer to run it first. It is easier to see in a colleague's loop than in yours.`],
  ai:{ yes:[`Stress-test a loop for manipulative patterns.`,`Draft clear disclosure copy.`,`Review content and defaults for representation gaps.`,`Flag regulation risk as a starting point.`],
       no:[`Decide the ethical line.`,`Claim legal compliance.`] },
  prompts:[{l:'Ethics stress test',p:`Here is our loop, monetisation and data flow: [CONTEXT]. Identify where the design pressures rather than informs, where a player might feel misled or ashamed, and where the defaults exclude or stereotype. For each, propose the smallest change that keeps the experience and removes the pressure.`}],
  verify:[`Can the model be explained to a player without embarrassment?`,`Are odds and data use disclosed?`,`Can a player who bought by mistake find the refund path in under a minute, and does no single press ever charge money?`,`Were the defaults reviewed for representation?`],
  test:[`Describe the loop to a matched player without defending it. Note hesitation, discomfort or a sense of being tricked.`,`Pick one live offer and find who approved it, what its guardrail is, and when it was last reviewed. Missing answers are the finding.`,`Rank one live offer's buyers by spend. If the top few accounts pay for most of it, review the offer with the player-risk owner (the site's rule of thumb, drawn from the Zendle and Cairns link between heavy spend and gambling severity).`],
  rel:[['business-model','The model is where most ethical pressure is designed in.'],['player-motivation','Compulsion and intrinsic motivation pull in opposite directions.'],['return-and-quit','Players eventually leave the loop they do not endorse.'],['design-pillars','Values belong beside the pillars, not in a review at the end.'],['ai-disclosure-policy','Telling players what AI made is an honesty duty with store and legal rules behind it.'],['monetisation-design','The store rules and odds disclosure that limit what you may build.'],['live-design-seasons-and-data','Guardrails and the list of decisions data does not get to make.']],
  facts:[{claim:`Zendle and Cairns (PLOS ONE 13(11), 2018) surveyed 7,422 gamers after cleaning 14,182 responses, recruited through 29 gaming subreddits on Reddit (89 percent male, 48 percent aged 18-24, 44 percent US). Loot-box spending was linked to Problem Gambling Severity Index score (eta squared 0.054), much more than spending on other in-game purchases (0.004). Players with problem-gambling scores reported spending on average in the USD 20-40 a month band against USD 1-10 for players with no gambling problem (self-reported bands). The authors say the link is correlational and could run either way, and that recruitment bias limits generalisation.`,asOf:'2026-09-30',src:'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0206767'},{claim:`On 19 December 2022 the US FTC announced that Epic Games would pay USD 520 million: USD 275 million for children's privacy (COPPA) violations and USD 245 million in refunds for deceptive billing. The FTC alleged one-button purchases, accidental charges and obscured cancellation and refund features. A settlement, so the allegations were not tried.`,asOf:'2026-09-30',src:'https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations'}] });
TECH('ethics-and-responsibility',[
  {n:'Consent test', how:`Ask whether the player would endorse the design if they could see it.`, fit:`Reviewing monetisation and engagement loops.`, cost:`Kills some profitable ideas.`, alt:`A written values statement beside the design pillars.`},
  {n:'Disclosure', how:`Explicit odds, data use and honest claims.`, fit:`Randomized rewards, currencies and personal data.`, cost:`Can reduce conversion in the short term.`, alt:`Plain-language summaries alongside the legal text.`},
  {n:'Representation review', how:`Check the defaults, characters and content for who is included or stereotyped.`, fit:`Any content with characters or player identity.`, cost:`Requires care and sometimes redesign.`, alt:`A diverse review group before content is locked.`}
]);
ENGINE('ethics-and-responsibility',{
  godot:{ term:`Nothing leaves the device until the player answers. The consent flag is read before the analytics client will send anything, and the identifier sent is one you generated and the player can reset.`,
    api:['ConfigFile.load() / get_value() in user://','HTTPRequest.request()','JSON.stringify()','OS.get_unique_id() (the identifier not to send)','crypto or randi() for a resettable local id','OS.get_locale() for region rules'],
    snippet:`extends Node                                   # nothing leaves the device before consent
const ENDPOINT := "https://telemetry.example.com/v1/events"
var _consent := false

func _ready() -> void:
\tvar cfg := ConfigFile.new()
\tif cfg.load("user://privacy.cfg") == OK:
\t\t_consent = cfg.get_value("privacy", "analytics", false)

func track(event: String, props: Dictionary) -> void:
\tif not _consent:
\t\treturn                                 # dropped, not queued for later
\tprops["event"] = event
\tprops["pid"] = _stable_random_id()         # never OS.get_unique_id(), and resettable
\t$HTTPRequest.request(ENDPOINT, [], HTTPClient.METHOD_POST, JSON.stringify(props))`,
    pitfall:`Keying players on OS.get_unique_id(). It is a device identifier that survives reinstalls, which is exactly the property that makes it a privacy liability and a platform policy problem, and it is unavailable on some targets so the code also breaks. Generate a random id, store it in user://, and let the player reset it.`,
    map:`Godot’s HTTPRequest client behind a user:// consent flag is Unity’s analytics service gated on StartDataCollection.` },
  unity:{ term:`The service is initialised early so the consent screen can show, but collection waits for the answer: StartDataCollection before Analytics SDK 6.1, and from Analytics SDK 6.1 EndUserConsent.SetConsentState with AnalyticsIntent, which also stores the answer between sessions. Nothing is gathered until the player says yes, and a no is followed by a deletion request rather than silence.`,
    api:['UnityServices.InitializeAsync()','AnalyticsService.Instance.StartDataCollection() / StopDataCollection()','AnalyticsService.Instance.RequestDataDeletion()','PlayerPrefs for the recorded answer','SystemInfo.deviceUniqueIdentifier (the identifier not to send)','Application.RequestAdvertisingIdentifierAsync()'],
    snippet:`public class Telemetry : MonoBehaviour {
    async void Start() {
        await UnityServices.InitializeAsync();
        // Initialise early, collect late. The first session is the one people forget.
        if (PlayerPrefs.GetInt("consent.analytics", -1) == 1)
            AnalyticsService.Instance.StartDataCollection();
    }

    public void OnConsent(bool yes) {
        PlayerPrefs.SetInt("consent.analytics", yes ? 1 : 0);
        if (yes) AnalyticsService.Instance.StartDataCollection();
        else AnalyticsService.Instance.RequestDataDeletion();
    }
}`,
    pitfall:`Starting collection in the same call that initialises the service. The first session is captured before the consent dialog is even drawn, so whatever the player then chooses, you already took it. Initialising and collecting are two calls for this reason, and the gap between them is where the question belongs.`,
    map:`Unity’s analytics service gated on StartDataCollection is Godot’s HTTP client gated on a user:// consent flag.` },
  note:`The consent answer is not only a client setting. It has to reach the server that stores the events and the one that can delete them, which is why the client keeps a local flag and the account keeps the authoritative one. A build that drops events locally while the server still holds last week’s is compliant in the UI and not in fact.` });
INTERVIEW('ethics-and-responsibility',{
  junior:[
    { q:`What is a dark pattern in a game, concretely?`,
      a:`A design that pressures rather than informs: an expiring offer engineered to rush a decision, a purchase that relieves pain the design manufactured, odds the player cannot see, a currency layer that hides what something costs. The common thread is that the player would object if they could see the design.`,
      follow:`Name one you have met as a player and what it did to your trust.`,
      red:`Defines it as anything that makes money.` },
    { q:`What is the consent test?`,
      a:`Ask whether the player would endorse this design if they could see it from the inside. It converts an argument about intentions into a question about the player’s view, which is checkable. Where you would be embarrassed to explain the mechanism, that is the finding.`,
      follow:`How would you check that with players?`,
      red:`Answers that players accept it because they keep playing.` },
    { q:`Distinguish engagement from compulsion.`,
      a:`Engagement is a player choosing to return because the experience is worth their time. Compulsion is a player returning because leaving costs them something the design created. Retention numbers look the same for both, which is why the distinction has to be asked as a design question.`,
      follow:`Which metric hides the difference most effectively?`,
      red:`Uses the two words as synonyms because both show up as daily active players.` }
  ],
  mid:[
    { q:`Stress-test a loop for manipulation. What do you look for?`,
      a:`Where the design pressures rather than informs, where pain was manufactured to be relieved, where the value of a reward is deliberately blurred, what data is collected and whether the player knows, and which defaults exclude or stereotype. For each finding, propose the smallest change that keeps the experience and removes the pressure.`,
      follow:`Which finding would you escalate rather than fix quietly?`,
      red:`Audits the store page wording and leaves the loop untouched.` },
    { q:`Your game has randomised rewards. What do you disclose and why?`,
      a:`The odds, in a place the player sees before they commit, plus the real cost in real money rather than only in a currency layer. Show cumulative spend, and gate by age where required. Regulation and platform rules keep moving, so design for disclosure rather than retrofitting it when a rule changes.`,
      follow:`Legal says the minimum is less than you propose. How do you argue for more?`,
      red:`Discloses the legal minimum and treats clarity as a competitive disadvantage.` },
    { q:`How do you review defaults for representation?`,
      a:`Look at who the default character, the default voice and the default assumptions exclude, and at where a shorthand has become a stereotype. Do it while the content is being made, because it is a design question and not a compliance pass. Bring people who are not in the room’s majority into the review.`,
      follow:`The team is homogeneous. How do you get a useful review?`,
      red:`Adds an options screen and considers the question answered.` }
  ],
  senior:[
    { q:`You are writing the design values next to the pillars. What goes in and how do they bind decisions?`,
      a:`Concrete lines rather than sentiments: what the game will not sell, what it will always disclose, what data it will not collect. Each value should name something it forbids, so it can decide an argument. Put them in the same review as the pillars and revisit them at each update, because the pressure arrives with the live economy.`,
      follow:`A value costs measurable revenue. How do you hold it?`,
      red:`Writes aspirational values that forbid nothing in particular.` },
    { q:`You are asked to ship something you believe crosses the line. What do you do?`,
      a:`State exactly where the line is and why, in terms of the player rather than of taste. Bring the trust and retention evidence, propose an alternative that meets the business need, and escalate once with the argument written down. Then decide what you personally will do if the answer stands, because a line you will not act on is a preference.`,
      follow:`The answer is no and the feature ships. What then?`,
      red:`Objects in a meeting, leaves no record, and implements it unchanged.` }
  ] });
FACTS('ethics-and-responsibility',[
  { claim:`Apple’s App Store Review Guidelines (3.1.1) require apps that sell loot boxes or other randomised virtual items to disclose the odds of receiving each type of item before purchase, a rule in place since December 2017.`, asOf:'2026-09-23', src:'https://developer.apple.com/app-store/review/guidelines/' },
  { claim:`Google Play has required games that sell randomised virtual items to disclose the odds before purchase since May 2019.`, asOf:'2026-09-23', src:'https://www.gamedeveloper.com/business/games-on-the-google-play-store-now-required-to-disclose-loot-box-odds' },
  { claim:`Since April 2020 the ESRB adds the notice “In-Game Purchases (Includes Random Items)” to games that sell randomised items for real money.`, asOf:'2026-09-23', src:'https://www.esrb.org/blog/in-game-purchases-includes-random-items/' },
  { claim:`In January 2025 Genshin Impact’s developer, Cognosphere, agreed to pay $20 million to settle FTC charges; the order bans selling loot boxes to players under 16 in the US without a parent’s consent.`, asOf:'2026-09-23', src:'https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental' },
  { claim:`The FTC’s amended COPPA Rule, published on 22 April 2025, requires full compliance from 22 April 2026: separate parental consent before a child’s data is disclosed to third parties such as advertisers, and biometric identifiers now count as personal information.`, asOf:'2026-09-23', src:'https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule' }
]);

T('monetisation-design',{ d:'product', t:'Monetisation design', tag:'Business model picks how the game earns. Monetisation design is the store, the prices, the random rewards and the passes, and the rules you must follow when you build them.',
  what:`The design of the things players pay for inside a game. In-app purchases (IAP) sell currency, items or convenience. Random rewards, called loot boxes or gacha, sell a chance at an item. A battle pass sells a track of rewards earned by playing over a season. Pricing sets what each of these costs and how prices are tiered. Candy Crush Saga offers extra moves and lives at the moment a level is lost, so the failure screen is a purchase point. Fortnite sells only cosmetics and a Battle Pass. Players who spend a great deal, often called whales, are a small group that some games depend on for most of their revenue. Ethics and law set the limits: several regulators and every major app store now have rules on random rewards, and the rules differ by country. The business model topic chooses how the game earns. This topic designs the parts of the store.`,
  why:[`Without a design for it, the store is bolted on late, and the loop bends to serve it: timers that sell skips, grind that sells boosts, a drop rate that sells hope.`,`Random paid rewards attract legal attention. Apple has required odds disclosure since 2017, Google Play since 2019, and some countries treat certain loot boxes as gambling. Getting this wrong can mean removal from a store or a market.`,`Prices and pass lengths set the economy. A pass that must be finished in a season sets how much time a player has to spend, and a pity rule sets what a pull really costs. If nobody designs these numbers, the economy is balanced by accident.`,`Revenue that depends on a small group of heavy spenders is fragile and can harm them. Players, press and regulators react to games that look built to extract money.`],
  think:{ q:[`What does each item sell: something the player wants for its own sake, or relief from a problem the game created?`,`What is the real chance of the top reward, once pity and other rules are counted, and can we state it in one sentence?`,`Which country rules and store rules apply to the markets we plan to ship in?`,`If the top 1 percent of spenders left, would the game still work? If they spend far more than they meant to, would we notice, and what would we do?`,`How does the battle pass treat a player who cannot play daily? Does it demand time or reward it?`,`What would we be embarrassed to explain to a parent, a regulator or a journalist?`],
    trade:[`Cosmetic-only sales are easy to defend and keep the game fair, and they may earn less than sales that speed up or strengthen play.`,`Random rewards can earn a lot and create excitement, and they carry the highest legal and reputation risk, and they can feed compulsive spending.`,`A battle pass gives a clear, fair-looking deal and steady revenue, and it can create a feeling of obligation to play every day, and it needs a new season on time.`,`Direct-price items are transparent, and they sell less to people who enjoy uncertainty.`],
    traps:[`Publishing the base rate when the real rate depends on pity, on hidden multipliers or on the player's account. State the effective rates.`,`Copying a competitor's rates without knowing the rules of your markets.`,`Adding a second and third currency so nobody can tell what a real price is. Each currency is another balance problem.`,`Treating spending limits and age checks as a later feature.`,`Designing the pass around the daily-login streak, so missing a day feels like a loss.`,`Setting a price by guessing, with no test. Price is a hypothesis to measure.`],
    good:[`A player can say in one sentence what they get for their money and what the odds are.`,`Players who never pay call the game complete and fair.`,`The odds shown on screen match the measured rates of the running system.`],
    bad:[`Players say they feel forced to buy to keep up, or that the odds cannot be found.`,`Support tickets show players spending far beyond what they say they can afford.`,`The store team cannot say which country rules the game follows.`] },
  how:[`List everything the store will sell and give each item a class: cosmetic, convenience, progression power, random. Decide which classes the game will never sell.`,`For each random reward, write the rules as a table: the base rate of every outcome, any pity or guarantee rule, and how the counter resets. Then work out the effective rate for a player and check it with a simulation on the real code (see the engine tabs).`,`Show the rates before purchase, in a place a player can find without hunting. Store rules require it and it costs little to do well. Read the current store rules for each store you ship on.`,`Look up the rules for each market. Belgium, the Netherlands, China, Japan and the UK have all approached loot boxes differently. Take advice from a lawyer before launch, since laws and their enforcement change.`,`Design a battle pass in four steps: set a season length, set the total reward and the time a typical player needs, let a casual player finish with a modest play pattern, and give a way to catch up if a player misses days.`,`Set prices in tiers that match the store's price tiers. Test price and pack contents on a small audience (see soft launch), and track spending by cohort.`,`Add protections for the heaviest spenders: spending limits players can set, clear purchase history, a plain refund route, and a rule that flags accounts with sudden very high spending for review.`,`Keep the server in charge. It rolls the random reward, records the roll and grants the item. The client shows the result.`],
  ai:{ yes:[`Model how a pity rule changes the effective rate, and produce a table of expected pulls to the top reward.`,`Draft a checklist of store and market rules to verify, with each item pointing to an official source you then read.`,`Write a simulation harness that compares a stated rate with the rate a rules table really produces.`],
       no:[`Tell you what is legal in a market. It cannot give legal advice, and its memory of rules is often out of date. Read the regulator or store page and ask a lawyer.`,`Decide the ethics of the store. That is a values decision for the team.`,`Choose prices. Measure them with real players.`] },
  prompts:[{l:'Effective rate check',p:`Here is our random reward table and its rules (base rates, pity, guarantees, reset behaviour): [TABLE]. Write a simulation that plays 1,000,000 players through it and reports the effective rate of each outcome, the average and the 99th percentile of pulls to the top reward, and how the rate changes if the player stops and returns. Then write the one-sentence odds statement a player would see. Flag anywhere the statement would mislead someone who does not know the pity rule.`}],
  verify:[`Does the odds statement match the simulation output, including pity?`,`Every legal or store-rule claim: does it cite an official page you opened, with a date?`,`Did the AI describe an "industry standard" price or rate as if it were evidence? Ask for the source.`],
  test:[`Run the simulation on the real code, not a copy, and compare it with the stated rate. Rerun it after every change to the table.`,`Show a new player the store and ask them to say what a single purchase gives and what the odds are. If they cannot, redesign the screen.`,`Have a player who never pays and a player who pays weekly each describe how the game treats them.`,`Check the spending of the top group in soft launch. Compare what they spend with what they say they can afford, where the game can ask.`],
  facts:[{claim:`Apple’s App Store Review Guidelines (section 3.1.1) require apps that offer loot boxes or other mechanisms giving randomised virtual items for purchase to disclose the odds of receiving each type of item before the purchase. The requirement was added in December 2017.`,asOf:'2026-09-30',src:'https://developer.apple.com/app-store/review/guidelines/#in-app-purchase'},
    {claim:`Google Play’s monetisation policy has required apps with randomised items from a purchase to clearly disclose the odds in advance of purchase since May 2019.`,asOf:'2026-09-30',src:'https://www.pocketgamer.biz/google-play-developers-must-now-disclose-loot-box-odds'},
    {claim:`In April 2018 the Belgian Gaming Commission concluded that loot boxes in FIFA 18, Counter-Strike: Global Offensive and Overwatch broke Belgian gambling law, and said publishers could face fines and prison (secondary source; the commission’s own report was not opened). Enforcement has since been patchy: a 2022 academic study reported that most of the 100 highest-grossing Belgian iPhone games still had loot boxes.`,asOf:'2026-09-30',src:'https://www.pcgamesn.com/belgium-loot-box-laws-study'},
    {claim:`On 9 March 2022 the Dutch Council of State (Administrative Jurisdiction Division) overturned the Netherlands Gambling Authority’s penalty payments against Electronic Arts over FIFA Ultimate Team player packs. It held that the packs were not a game of chance separate from the game mode they belong to, so they were not gambling on their own. Loot boxes are not automatically gambling under Dutch law. Source checked is a law firm summary; the Council of State page returned 403.`,asOf:'2026-09-30',src:'https://akd.eu/insights/loot-boxes-are-legal-in-the-netherlands'},
    {claim:`In April 2020 the ESRB began using an "In-Game Purchases (Includes Random Items)" interactive element, and PEGI began using an "Includes Paid Random Items" notice, for games that sell random items for real money.`,asOf:'2026-09-30',src:'https://reedsmith.com/en/perspectives/2020/04/esrb-and-pegi-introduce-loot-box-warnings'},
    {claim:`China’s Ministry of Culture rules, in force from 1 May 2017, required online game publishers to publish the odds of random-draw items. A draft of new NPPA online game measures issued on 22 December 2023 would have banned minors from loot boxes and capped spending, and was removed from the regulator’s website on 23 January 2024. Nothing final was enacted from it as far as the sources checked show. The 2017 rule rests on a secondary report; the PCGamesN page returned 403 on 2026-09-30.`,asOf:'2026-09-30',src:'https://www.pcgamesn.com/loot-box-odds-china'}],
  rel:[['business-model','This topic designs the store parts inside the model that business-model chooses.'],['economy-and-resources','Currencies, sinks and pity rules are economy design; price is a sink.'],['ethics-and-responsibility','The limits on what to build are set by ethics before they are set by law.'],['live-operations','Seasons and passes are live-operations work with a delivery date.']] });
ENGINE('monetisation-design',{
  godot:{ term:`The rules table is plain data in a script, and the reward roll is a pure function of the counter and a random number generator. Keeping it pure lets a test run millions of trials in seconds and check the disclosed rate. In a shipped game the roll runs on the server, not in the client. The numbers here are made up for the example.`,
    api:['RandomNumberGenerator.randf() / seed','class_name + static func','const','minf()','float division of ints'],
    snippet:`class_name Gacha
extends RefCounted
const BASE := 0.006          # example numbers, not a recommendation
const SOFT_START := 74
const HARD := 90
const STEP := 0.06

static func rate(pity: int) -> float:    # pity = failed pulls since the last top prize
\tvar n := pity + 1
\tif n >= HARD: return 1.0
\tif n >= SOFT_START: return minf(1.0, BASE + STEP * (n - SOFT_START + 1))
\treturn BASE

static func effective_rate(pulls: int, rng: RandomNumberGenerator) -> float:
\tvar pity := 0
\tvar wins := 0
\tfor i in pulls:
\t\tif rng.randf() < rate(pity):
\t\t\twins += 1
\t\t\tpity = 0
\t\telse:
\t\t\tpity += 1
\treturn float(wins) / pulls`,
    pitfall:`Stating the base rate (0.6 percent in this example) as the rate. With the soft and hard pity rules above, the average rate across pulls is higher, and a player who reads only the base rate is misled about their real chance. Run effective_rate on the real table, print both numbers, and write the odds statement from the measured one, saying what the pity rule does. Also, never roll in client code: a client roll is a value the player can edit.`,
    map:`A Godot static rate function with a seeded RandomNumberGenerator is Unity's pure static method with a System.Random instance.` },
  unity:{ term:`The same idea: rules as constants, the roll as a pure static method taking its random source. Use System.Random with an explicit seed for tests. UnityEngine.Random is global state and hard to test. As always, the roll belongs on the server.`,
    api:['System.Random.NextDouble()','static class','const','Mathf.Min()','NUnit [Test] for the simulation'],
    snippet:`using UnityEngine;

public static class Gacha {
    const float Base = 0.006f;              // example numbers, not a recommendation
    const int SoftStart = 74, Hard = 90;
    const float Step = 0.06f;

    public static float Rate(int pity) {    // pity = failed pulls since the last top prize
        int n = pity + 1;
        if (n >= Hard) return 1f;
        if (n >= SoftStart) return Mathf.Min(1f, Base + Step * (n - SoftStart + 1));
        return Base;
    }

    public static float EffectiveRate(int pulls, System.Random rng) {
        int pity = 0, wins = 0;
        for (int i = 0; i < pulls; i++) {
            if (rng.NextDouble() < Rate(pity)) { wins++; pity = 0; }
            else pity++;
        }
        return (float)wins / pulls;
    }
}`,
    pitfall:`Writing the odds by hand in a UI string and changing the table later. The string and the rules drift apart, and the mismatch is what a store reviewer or a regulator finds. Build the disclosure text from the same constants or data the roll reads, and add a test that fails when EffectiveRate moves away from the published figure. Using UnityEngine.Random in the same method makes that test hard to repeat, because its state is global.`,
    map:`Unity's static Gacha with a System.Random is Godot's static rate function with a RandomNumberGenerator.` },
  note:`Both tabs test the rule table, not the store. The purchase flow is in the business model topic: the client hands a receipt to the server, and the server grants. Add the roll to the same server step, and store a record of every roll so a dispute can be checked.` });
INTERVIEW('monetisation-design',{
  junior:[
    { q:`What is the difference between selling a cosmetic and selling a boost?`,
      a:`A cosmetic changes how the player looks or feels and gives no gameplay advantage, so buying it does not change other players’ games. A boost changes power or speed and can make the game unfair to those who do not buy it. Cosmetics are easier to defend and may earn less. Which one fits depends on the game, its audience and its rules.`,
      follow:`Where does a time-saver fall between the two?`,
      red:`Says the difference does not matter because players choose to pay.` },
    { q:`What must a game with loot boxes do on the major mobile stores?`,
      a:`Apple’s App Store guidelines require odds to be disclosed before purchase for randomised items, and Google Play requires the same in its monetisation policy. Some countries add their own rules. Read the store pages for the date and wording you are shipping under, because they change.`,
      follow:`Where should the odds appear in the game?`,
      red:`Says odds are optional if the item pool is small.` },
    { q:`What is a pity rule, and why does it matter for the disclosed rate?`,
      a:`A pity rule raises the chance of a top reward after a number of failures, or guarantees it at a limit. It means the real average chance is higher than the base rate. A disclosure based on the base rate alone would be misleading, so state the effective rate and describe the rule.`,
      follow:`How would you measure the effective rate?`,
      red:`Publishes the base rate and leaves the pity rule out.` }
  ],
  mid:[
    { q:`Design a battle pass for a game with sessions of ten minutes.`,
      a:`Set a season length, decide how long a typical player takes to finish (long enough to matter, short enough not to demand daily play), tie progress to play rather than to a login streak, let missed days be caught up, and keep the free and paid tracks each worth having. Test completion rates in soft launch. Measure whether players feel rewarded or obliged.`,
      follow:`What happens to a player who buys the pass and does not finish it?`,
      red:`Adds a daily streak because it lifts retention.` },
    { q:`A regulator asks how you know the published odds are right. What do you show?`,
      a:`The rules table, the code that reads it, the roll log from production, and the simulation test that compares the effective rate with the published figure. The server rolled, the roll is stored, and the published text is generated from the same data. Show the test running in the build.`,
      follow:`What would you do if the log showed a rate that differed from the published number?`,
      red:`Says the odds were set by the designer and cannot be verified.` },
    { q:`How would you price a first item for a new market?`,
      a:`Start from the store’s price tiers and what comparable games charge, then treat the price as a hypothesis. Test two or three prices on small cohorts in soft launch, watch conversion, repeat purchase and refunds, and decide from the pattern, not one week. Local income and rules can change the answer.`,
      follow:`What would make you drop the price even if revenue per buyer fell?`,
      red:`Copies the price of the biggest game in the genre.` }
  ],
  senior:[
    { q:`Your revenue depends on a small group of very heavy spenders. What do you do?`,
      a:`Say plainly what share of revenue that is, and what it means for the business and for those players. Add protections: spending limits, clear history, easy refunds, and review for sudden extreme spending. Grow the wider base so the total does not rest on them. Decide in advance the line above which the team will intervene, and have a person own it.`,
      follow:`Leadership asks you to raise the limit that triggers a review. Do you agree?`,
      red:`Treats the heaviest spenders as the target market and does not look further.` },
    { q:`You are launching in Belgium, the Netherlands and China. How does the monetisation design change?`,
      a:`Check each market with a lawyer. Belgium’s Gaming Commission said in 2018 that some loot boxes broke gambling law, so random paid rewards may need to be removed or changed there. The Dutch Council of State ruled in 2022 that loot boxes are not gambling in themselves, but rules can change. China required odds disclosure from 2017 and consulted on more in 2023. Design the store so random items can be turned off per market without rewriting the economy.`,
      follow:`What in your economy breaks if a market removes the random items?`,
      red:`Assumes one global store design is enough.` }
  ] });

T('live-design-seasons-and-data',{ d:'product', t:'Live design: seasons, cadence and reading the data', tag:'Plan a season from cohorts and guardrails, and know which questions data can answer and which it cannot.',
  what:`Live design is deciding what a running game adds, when, and why, using what players actually did. A season is a fixed window (often 6 to 12 weeks, a common range and a rule of thumb, not a standard) with a theme, new content, a reward track and a clear end. Hearthstone renews itself by rotation: its Standard format retires old card sets, so the card pool and the rules around it change together. In Fortnite a live event can wreck a named place on the map, and the damage stays for at least the rest of that season. Cadence is how often something new arrives. This topic sits on top of live-operations, which covers the 90-day plan and the calendar, and metrics-and-success, which defines the metrics. Here the work is the judgement: which cohort to trust, what a retention curve does and does not say, when an A/B test result is real, and when a decision should not be made by data at all. Data answers questions like which version retains more. It cannot say what the game should be, which players you want, or whether a profitable pattern is one you are willing to run. Treat every chart as a lens.`,
  why:[`A season is a promise. Without a plan built on cohorts, teams ship what is easiest to build and call it a roadmap.`,`Data fools careful people. Stopping a test the moment it looks good, mixing cohorts from different weeks, or reading an average that hides two groups all produce confident, wrong decisions.`,`Live games run for years. Small decisions to squeeze a metric compound, and monetisation can slowly eat the fun that made players stay.`,`Peeking is measured, not just feared. Johari, Pekelis and Walsh (Optimizely, arXiv 2015, revised 2019) write that with 10,000 samples, a common size, continuous monitoring of a fixed-horizon test can easily raise the false-positive rate fivefold. Miller's worked case reached 26.1 percent against a 5 percent level.`,`Two cheap defences exist, both from large web experiments and not game-specific. Pre-test data cut noise: Deng and colleagues (Microsoft, WSDM 2013) report about 50 percent lower variance on Bing metrics, the same power with half the users or half the time. A split check catches broken tests: Fabijan and colleagues (KDD 2019) find about 6 percent of Microsoft experiments, and about 10 percent of triggered analyses at LinkedIn, have a sample ratio mismatch.`,`Novelty is real but thinly measured for games. Runge (2025 adoption guide) says new content can excite players only because it is new, so early engagement can mislead about long-term retention. He advises a small long-term holdout and a look by player tenure, since novelty is lower or absent for new players. I found no published game study that measures how fast novelty fades, so a test length such as two full weeks is a rule of thumb.`,`Cadence has a cost. A faster calendar burns the team and trains players to wait for the next event instead of playing the game.`],
  think:{ q:[`What decision will this number change? If nothing, do not chart it.`,`Which cohort is this? Installed when, from which source, on which version? Are we comparing like with like?`,`Did the arms split as planned, and is the effect from players with history or from new installs who may just be excited?`,`Is the difference bigger than the noise? How many players per arm, and was the sample size fixed before we looked?`,`Which behaviour moved besides the target metric? Did revenue rise while sessions, gifts or social play fell?`,`If this worked and we did it everywhere for a year, would the game still be one we want to make?`,`What is the guardrail, and who can stop the season if it trips?`],
    trade:[`A short cadence keeps players returning and costs the team its ability to make deep changes.`,`Deciding from data is defensible and can lead the game to a local peak that a designer with a vision would have refused.`],
    traps:[`Peeking: checking an A/B test daily and stopping when it first looks significant. Repeated looks inflate false positives; Evan Miller's worst case took a 5 percent level to 26.1 percent, and Johari and colleagues report roughly fivefold inflation even at 10,000 samples.`,`Comparing retention of cohorts from different weeks, one of which had a marketing push, and calling the gap a design effect.`,`Reading an average across a small group of big spenders and a large group of non-spenders as if it described either.`,`Optimising one metric and ignoring its guardrails, such as sessions per day or refund rate.`,`Copying a competitor's season length without asking whether your content pipeline can fill it.`,`Treating players' loud requests as data. The people who post are not the players who quit silently.`],
    good:[`The season plan states its goal metric, its guardrails, its stop condition and what the team will learn either way.`,`A result is reported with cohort, sample size and the look schedule, not just a percentage.`],
    bad:[`The team can only say what shipped, not what they expected it to change.`,`Every test that ran has a winner.`] },
  how:[`Write the season goal as one question a number can answer, such as whether returning players come back for the second week more often. Add two guardrails, for example sessions per player and refund rate.`,`Set the cadence from what the content pipeline can produce with slack, then check it against your last three releases. If you missed one, lengthen the season.`,`Cut cohorts by install week and source. Read day-1, day-7 and day-30 retention per cohort, and plot them on one chart. A new cohort that starts below the last is a finding before you change anything.`,`Split before you average. Separate new, returning and lapsed players, and payers from non-payers. Look at each group's own curve.`,`Before a test starts, write down the goal metric, two guardrails, the smallest effect worth shipping, the sample size and the end date. Filing this before the data arrives is what stops a result from being chosen afterwards.`,`Read the test once, at the planned end. If someone must watch it live, use a method built for repeated looks (an always-valid or sequential test such as the mSPRT in Johari and colleagues) and report its output, not a raw p-value.`,`Before reading any result, check the split. Count players per arm and run a chi-square test of the counts against the planned ratio (for 50/50, expected counts are half the total each). A very small p-value means the split was not random; even a 50.2/49.8 gap in about 1.6 million players was flagged as under 1 in 500,000 by chance in the paper. If it fails, do not read the result: find the cause (a bug, bot filtering, lost logs, an arm that crashes) first. Microsoft found about 6 percent of its experiments failing this check.`,`Cut noise with pre-test data (CUPED). Subtract from each player's outcome the part predicted by the same metric measured before the test, using a pre-period of one to two weeks (Deng and colleagues found the same metric from before the test worked best and 1 to 2 weeks worked well: too short matches few players, too long weakens the link to the test outcome). Use only pre-test data, never anything the change could have affected, or the result is biased. It gives no gain for players with no history, so report new installs separately. About half the variance was removed on Bing; expect less on your game and check it.`,`Keep a small long-term holdout after shipping a winner and compare it at week 4 and later, split by how long players had played. If the lift fades, it was partly novelty. That is the advice in Runge (2025), not a measured decay rate.`,`Read the guardrails first. If the goal moved and a guardrail fell, discuss that before celebrating.`,`Decide in advance which decisions data does not make: the fantasy, the pillars, the players you refuse to exploit, the offers you will not run. Write that list next to the season plan.`,`Close the season with a review: what we expected, what happened, what we still do not know. File it where the next season's planner will find it.`],
  ai:{ yes:[`Draft the season plan skeleton: goal question, metrics, guardrails, calendar, content slots.`,`Compute sample sizes and check a test writeup for peeking, cohort mixing and missing guardrails.`,`Segment a data export and list where a headline average hides groups.`,`Write the season review from the plan and the numbers.`],
       no:[`Decide what the game should become.`,`Decide which monetisation you will not run.`,`Declare a result real when the test design was not fixed in advance.`] },
  prompts:[{l:'Season plan review',p:`Here is our proposed season plan, cohort retention by install week, and last season's results: [DATA]. Check the plan: is the goal a question a metric can answer, are there at least two guardrails, is the cadence supported by our last three delivery dates, and what does the retention by cohort say about whether the last season worked? List the decisions in the plan that data cannot make, and mark any that the plan treats as a data decision.`},{l:'Test audit',p:`Here is an A/B test writeup: [WRITEUP]. Report whether the sample size was fixed in advance, how many times the result was checked, whether the groups were comparable, which guardrails were reported, and whether the conclusion goes further than the data. Say what you would need to see before shipping.`}],
  verify:[`Does the plan name its goal metric, two guardrails and a stop condition?`,`Are cohorts compared by install week and source, not pooled?`,`Was the sample size fixed before the test was read, or was a sequential method built for repeated looks used, and were metric and end date written down before it started?`,`Did the arms split in the planned ratio? A sample ratio mismatch means the result cannot be trusted until the cause is found.`,`Is there a written list of decisions data does not make?`],
  test:[`Take the last season's review and ask someone outside the team to reproduce the headline result from the plan and the raw numbers. If they cannot, the review is a story.`,`Run an A/A test (two identical arms) and watch it daily without correcting for looks. Johari and colleagues show such a test crossing the 95 percent significance line. If your tool reports a winner more than about 5 percent of the time at the planned end, your process is producing false positives.`,`Take your last ten experiments and count how many failed a split check. If none were checked, that count is unknown; Microsoft's was about 6 percent.`,`Ask three players what they think the season was for. Compare with your goal question.`],
  rel:[['live-operations','That topic sets the calendar and the 90-day plan; this one is how to choose what goes in it from data.'],['metrics-and-success','Defines the numbers; this topic is about reading them without fooling yourself.'],['monetisation-design','Where the guardrails matter most: revenue that eats the play.'],['ethics-and-responsibility','The decisions data does not get to make.']],
  facts:[{claim:`Evan Miller's article How Not to Run an A/B Test shows that checking results repeatedly and stopping at the first significant reading raises false positives sharply: in his logo example (a 50 percent base conversion rate, a test run after every observation and stopped at 5 percent significance or 150 observations) the real false-positive rate was 26.1 percent, which he calls close to a worst case. His advice is to fix the sample size in advance and not stop early, or to use sequential or Bayesian designs built for repeated looks.`,asOf:'2026-09-30',src:'https://www.evanmiller.org/how-not-to-run-an-ab-test.html'},{claim:`Johari, Pekelis and Walsh (Optimizely; arXiv 1512.04922, submitted December 2015, revised July 2019) show an A/A test whose chance-to-beat-baseline crosses the 95 percent line under continuous monitoring, and state that with 10,000 samples the Type I error can easily increase fivefold. They propose always-valid p-values and the mixture sequential probability ratio test, which trade some run-time for valid error control. Two authors were employed by Optimizely, a testing vendor. Web click-through tests, not games.`,asOf:'2026-09-30',src:'https://arxiv.org/abs/1512.04922'},{claim:`Deng, Xu, Kohavi and Walker (Microsoft, WSDM 2013) introduce CUPED and report a variance reduction of about 50 percent on Bing experiments, equal to doubling traffic or halving the run time. The gain peaked with about two weeks of experiment data, was best with the same metric from before the test, and requires pre-experiment data for a user. One search engine, not games.`,asOf:'2026-09-30',src:'https://www.exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf'},{claim:`Fabijan and colleagues (KDD 2019, authors from Microsoft, Booking.com and others; four companies, over 25 products) report that about 6 percent of Microsoft experiments show a sample ratio mismatch, cite about 10 percent of triggered analyses at LinkedIn, and give a taxonomy of causes with a chi-square test as the check. Web and app products, not games.`,asOf:'2026-09-30',src:'https://www.lukasvermeer.nl/publications/papers/2019/07/25/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments.html'},{claim:`Julian Runge's Experimentation in Gaming: an Adoption Guide (arXiv 2504.13840, January 2025 draft) says new game content can cause novelty effects that excite players only because it is new and mislead about long-term retention, and advises a small long-term holdout and a look at effects by player tenure (novelty is lower or absent for new players). It is an advisory guide with no measured decay figures.`,asOf:'2026-09-30',src:'https://arxiv.org/abs/2504.13840'}] });
TECH('live-design-seasons-and-data',[
  {n:'Season brief', how:`One page: goal question, metric, two guardrails, stop condition, cadence, content slots, and what the team expects to learn.`, fit:`Every season of a live game.`, cost:`Writing a stop condition means admitting the season could fail.`, alt:`A one-line goal for a small event.`},
  {n:'Cohort retention chart', how:`One line per install week (or source) for day-1, day-7 and day-30 retention on the same axes.`, fit:`Judging whether a change or a season helped, and whether new players are getting worse.`, cost:`Small cohorts are noisy; ignore lines with too few players.`, alt:`A table for a game with too few players for a chart.`},
  {n:'Pre-registered test', how:`Write the metric, minimum effect and sample size before starting, and read the result once.`, fit:`Any A/B test that will drive a decision.`, cost:`Slower than peeking; some tests will end inconclusive.`, alt:`A sequential design when you must look during the test.`},
  {n:'Guardrail metrics', how:`Name two or three measures that must not fall, such as sessions per day, gifts sent or refund rate, and report them next to the goal.`, fit:`Monetisation and engagement changes.`, cost:`Adds dashboards to keep honest.`, alt:`A player survey once a season.`}
]);
ENGINE('live-design-seasons-and-data',{
  godot:{ term:`A season is data, not code: a resource file with its dates and rewards, read by one function that says whether it is running. The test-reading rule is code too: one function that refuses to call a result before the planned sample size.`,
    api:['Resource with @export properties','Time.get_unix_time_from_system()','Time.get_unix_time_from_datetime_string()','absf() and sqrt()','class_name'],
    snippet:`class_name SeasonPlan extends Resource
@export var name_id: StringName = &"s1"
@export var start_iso: String = "2026-10-01T00:00:00"
@export var weeks: int = 8
@export var min_per_arm: int = 4000     # fixed before the test starts

func is_live(now: float = Time.get_unix_time_from_system()) -> bool:
\tvar start := Time.get_unix_time_from_datetime_string(start_iso)
\treturn now >= start and now < start + weeks * 604800.0

# two-proportion z score; refuses to answer early
func z_score(a_n: int, a_hit: int, b_n: int, b_hit: int) -> float:
\tif a_n < min_per_arm or b_n < min_per_arm:
\t\treturn NAN
\tvar pa := float(a_hit) / a_n
\tvar pb := float(b_hit) / b_n
\tvar p := float(a_hit + b_hit) / (a_n + b_n)
\treturn (pb - pa) / sqrt(p * (1.0 - p) * (1.0 / a_n + 1.0 / b_n))`,
    pitfall:`Writing the season start as a local date. Midnight on 1 October means a different moment for every player, so the season opens hours apart and the leaderboard closes unfairly. Godot reads the string as UTC, so keep it in UTC and say so in the field name or a comment, compare unix seconds, and format local time only in the UI.`,
    map:`A Godot Resource with a season plan is a Unity ScriptableObject holding the same fields, and the z function is identical.` },
  unity:{ term:`Same split: a ScriptableObject holds the season, a pure function reads the test. The function returns NaN before the sample size is met, so nobody can see a number that they should not act on.`,
    api:['ScriptableObject and [CreateAssetMenu]','DateTimeOffset.Parse()','DateTimeOffset.UtcNow','Math.Sqrt()','double.NaN'],
    snippet:`using System;
using UnityEngine;

[CreateAssetMenu(menuName = "Live/Season")]
public class SeasonPlan : ScriptableObject {
    public string startIso = "2026-10-01T00:00:00Z";
    public int weeks = 8;
    public int minPerArm = 4000;      // fixed before the test starts

    public bool IsLive(DateTimeOffset now) {
        var start = DateTimeOffset.Parse(startIso);
        return now >= start && now < start.AddDays(7 * weeks);
    }

    public double ZScore(int aN, int aHit, int bN, int bHit) {
        if (aN < minPerArm || bN < minPerArm) return double.NaN;
        double pa = (double)aHit / aN, pb = (double)bHit / bN;
        double p = (double)(aHit + bHit) / (aN + bN);
        return (pb - pa) / Math.Sqrt(p * (1 - p) * (1.0 / aN + 1.0 / bN));
    }
}`,
    pitfall:`Using DateTime.Now for the season window. It follows the device clock, so a player who changes their phone's date can start or extend a season, and daylight saving changes shift the boundary. Take the current time from the server, or at least use UtcNow, and treat the client clock as a hint.`,
    map:`A Unity ScriptableObject season is a Godot Resource with the same exported fields, and DateTimeOffset UTC is Time.get_unix_time_from_datetime_string.` },
  note:`The z score is only a screen. It assumes independent players and one look at a fixed sample size, which is the point of the min_per_arm guard. For the real decision, still check guardrails and cohort mix, and keep the season clock on the server.` });
INTERVIEW('live-design-seasons-and-data',{
  junior:[
    { q:`What is a season in a live game and why use one?`,
      a:`A fixed window with a theme, new content, a reward track and a clear end. It gives players a reason to come back on a schedule and gives the team a unit to plan, ship and review. The end matters as much as the start, because it is when you learn what worked.`,
      follow:`What happens to a game that never ends its seasons?`,
      red:`Describes a season only as a battle pass for selling things.` },
    { q:`What does day-7 retention tell you and what does it not?`,
      a:`The share of a cohort that returned on the seventh day after install. It tells you the first week left some players wanting more. It does not say why, which players left, or whether the game will hold them at day 60. It needs a cohort and a comparison to mean anything.`,
      follow:`Two cohorts have different day-7 numbers. What do you check first?`,
      red:`Quotes one retention number with no cohort or comparison.` }
  ],
  mid:[
    { q:`An A/B test shows +4 percent conversion with p below 0.05 after three days. Ship it?`,
      a:`Not yet. Ask whether the sample size and stop date were fixed in advance and how often anyone looked. Repeated looks inflate false positives. Also check guardrails such as sessions and refunds, and the mix of players in each arm, before deciding.`,
      follow:`What do you do if the test was already stopped early?`,
      red:`Ships because the tool showed a winner.` },
    { q:`How do you choose the cadence of seasons?`,
      a:`From what the content pipeline can deliver with slack, checked against the last three releases, not from a competitor's length. Then from the players: is the season long enough to finish a track at a reasonable pace, and short enough that the theme does not go stale? Missing a date once means the cadence is too fast.`,
      follow:`What do you cut first when a season is late?`,
      red:`Copies the length of the biggest game in the genre.` },
    { q:`Retention of the newest cohort is 15 percent lower than the last. What do you do?`,
      a:`Check the cause before the response: acquisition source changed, a version bug, a tutorial change, a different country mix. Compare like with like by source and version. Only when the players are the same and the game is different is it a design finding.`,
      follow:`What if the drop is real and only in one source?`,
      red:`Rolls back the last design change with no comparison.` }
  ],
  senior:[
    { q:`Data says a more aggressive offer earns 8 percent more. You dislike it. How do you decide?`,
      a:`Name what the data measures and what it leaves out: long-term trust, refunds, players who stop spending. Check guardrails and a longer window. Then decide on the values written before the test: what we will not run. If the offer breaks that list, say no and show the trade openly. If it does not, run it with a stop condition.`,
      follow:`How do you keep the decision from being personal taste?`,
      red:`Lets the number decide because it is a number.` },
    { q:`How do you set up a live team so that data does not replace design judgement?`,
      a:`Write down which decisions data does not make (the fantasy, the pillars, what we will not monetise) and which it does (which of two variants performs). Put the goal, the guardrails and the expected learning in every season brief. Review misses as well as wins, so the team learns from both.`,
      follow:`What do you do when leadership wants the metric to be the pillar?`,
      red:`Says design is intuition and data is a distraction.` },
    { q:`A season underperformed. What is in your review?`,
      a:`What we expected and the numbers that would show it, what happened by cohort and segment, what the guardrails did, and what we still do not know. Then what we would keep, change or drop, with an owner. It is filed where the next planner will find it. A review that only explains is not finished.`,
      follow:`How do you avoid blaming the last change?`,
      red:`Blames marketing or the market and stops there.` }
  ] });

T('pitching-and-stakeholders',{ d:'product', t:'Pitching a design to stakeholders', tag:'A pitch is a decision request. Make the case with a clear ask, evidence at the right rung, and a plan for every kind of no.',
  what:`A pitch is a short, structured request for a decision: greenlight this prototype, fund this season, cut that feature, change this pillar. Portal shows the prototype rung working: Valve hired the DigiPen students behind the 2005 senior project Narbacular Drop and kept its core rule. The audience decides with limited time and their own risks in mind. Leads care about scope and the team, publishers about market and return, and a player advocate (community, support, live team) about what the game does to the players. A senior designer has to make the same design legible to each. The work has four parts: the ask, the claim, the evidence and the answer to the likely objection. Evidence climbs a ladder from cheap to expensive (the ladder, the four kinds of no below and the ten-minute length are this site's own working approach, not a published standard): an argument, a reference to a shipped game, a paper or greybox prototype, a playtest with numbers, a vertical slice. Pitch at the rung the decision needs and no higher. A pitch is a lens for organising your thinking, not a script. This topic sits next to lead-saying-no, which covers the no you give, and audience-and-positioning, which covers the one-sentence promise the pitch depends on.`,
  why:[`Good designs die in rooms where the ask is unclear. If the listener does not know what they are being asked to decide, the safe answer is not now.`,`Decision makers weigh risk, not delight. A pitch that only describes the fun leaves them to guess the cost, the schedule and the fallback.`,`Evidence that is too weak is dismissed and evidence that is too expensive delays the decision. The right rung is the cheapest that removes the doubt.`,`Listeners also judge the pitcher, not only the idea. Elsbach and Kramer (Academy of Management Journal, 2003) interviewed 36 people in film and television and observed 28 pitches. They found executives matched pitchers to seven prototypes (for example storyteller, showrunner or artist) using cues such as passion, and that the executive's own excitement and sense of a working relationship with the pitcher also mattered. Their own limits: a small, closely tied industry with shared prototypes, and a study of how judgments are made, not of whether they are right. It says what a room may respond to, not what makes a game succeed.`,`Every senior designer hears no often. If you treat all noes alike you argue with the ones you should accept and you give up on the ones that mean not yet.`],
  think:{ q:[`What exactly am I asking them to decide, by when, and what happens if they say nothing?`,`Who is in the room and what does each person risk if they agree?`,`Which single claim, if false, sinks the design? What is my cheapest evidence for it?`,`What will the most sceptical person say, and have I answered it before they do?`,`What is the smallest yes I would take, such as two weeks for a prototype?`,`What does the pitch cost the player? Who speaks for them?`,`Beyond the facts, what will the room read from how I present: do I show clear story, real energy for the problem, and a person they could work with?`],
    trade:[`A short pitch is easy to say yes to and leaves questions open. A thorough one answers them and can bury the ask.`,`Waiting for a prototype gives better evidence and loses the slot in the plan.`],
    traps:[`Pitching the game you love instead of the decision they must make.`,`Bringing a demo that depends on luck. The one time it fails is the one time the room sees it.`,`Hiding the risk to sound confident. The room finds it and stops trusting the rest.`,`Arguing with a no that was really a not-now.`,`A pitch for the whole game when the decision is a two-week experiment.`,`Ignoring the players' voice because they are not in the room.`],
    good:[`The room leaves knowing what was decided, by whom, and what happens next.`,`The sceptic's objection was answered by evidence, not by reassurance.`],
    bad:[`The room liked it and nothing was decided.`,`The ask changed three times during the meeting.`] },
  how:[`Write the ask as a sentence with a date: "Approve two weeks and two people to prototype X so we can decide by the 20th whether it earns a slot in the season."`,`Name the audience. For each person write what they need to say yes: schedule, market, quality bar, player impact.`,`State the claim in one sentence tied to a pillar or a goal, and the one risk that would sink it.`,`Pick the evidence rung. If the risk is "is it fun", a prototype. If it is "will anyone want it", a reference and a playtest. If it is "can we build it", an engineer's estimate.`,`Build a demo that cannot fail. Fix the seed, script the path, keep a recording as backup.`,`Rehearse the telling as well as the slides: a clear story of the player's experience and visible energy for it. In the Hollywood study these cues shaped how executives rated pitchers, so they are worth practice. Do not let them replace evidence; the study did not test whether such cues pick better ideas.`,`Leave room for the audience to add something: end the claim with one open question. In that study executives who reported feeling excited or engaged had rated the pitcher higher, an association about Hollywood catchers that does not show engagement causes approval. The open question is this site's suggestion, not a tested technique.`,`List the three likely objections and answer each in one line, with a fallback, such as scope cut or a test that would settle it.`,`Present in the order: ask, why now, claim, evidence, risk and plan, ask again. Keep it to ten minutes and leave the rest for questions.`,`Sort every no: not now (a timing problem, ask for a date), not this (a fit problem, ask what would fit), not this way (a method problem, offer options), not you (a trust problem, find a sponsor). Write down which one it was and the next step.`,`Close the loop. Send a short decision memo the same day: what was decided, by whom, what changes, and the date of the next check.`],
  ai:{ yes:[`Draft the ask and the objection list from your notes and role-play the sceptic.`,`Tighten a pitch to a time limit and mark places where a claim has no evidence.`,`Write the decision memo from meeting notes for the owners to correct.`,`Estimate what a prototype needs and turn it into a small first ask.`],
       no:[`Decide what evidence your audience will trust. That needs knowing them.`,`Stand in the room and read it.`,`Invent evidence, quotes or playtest numbers.`] },
  prompts:[{l:'Sceptic rehearsal',p:`Here is my pitch, with its ask, claim and evidence: [PITCH]. Play a sceptical [ROLE: publisher producer / engineering lead / live director]. Give the five hardest questions that person would ask, with what each protects them from. For each, tell me whether my evidence answers it and what cheap evidence would.`},{l:'Decision memo',p:`Here are my notes from a decision meeting: [NOTES]. Write a memo under 150 words: what was decided, by whom, what changes, what was not decided, and the date of the next check. Mark anything you inferred that the notes do not say.`}],
  verify:[`Can the pitch be reduced to one sentence of ask, with a date?`,`Does the evidence match the rung the decision needs?`,`Does the demo run the same way twice?`,`Would the room's decision stand if the pitcher's energy were removed? The evidence, not the delivery, should carry the claim.`,`Is every likely objection answered, with a fallback?`],
  test:[`Give the pitch to a colleague outside the project and ask them to say back the ask. If it is wrong, the ask is unclear.`,`Rehearse with a sceptic and count the questions your evidence did not answer. Ask the sceptic what impression you gave (clear, passionate, collaborative) and whether it matched your intent.`,`After the meeting, ask two attendees what was decided. If they disagree, the memo comes first.`],
  rel:[['lead-saying-no','That topic is giving a no; this one is receiving and sorting them.'],['audience-and-positioning','The one-sentence promise a pitch has to make clear.'],['design-pillars','The pitch ties its claim to a pillar the room already accepted.'],['vertical-slice-mvp','The top rung of the evidence ladder.']],
  facts:[{claim:`Elsbach and Kramer (Academy of Management Journal 46(3), 2003, pp. 283-301) interviewed 36 film and television screenwriters, agents and producers (an initial 22 interviews, then 14 more) and observed 28 pitches, 16 of them enacted for the researchers. They report a dual-process model: person categorization, in which executives use behavioural and physical cues to match pitchers to seven creative and uncreative prototypes, and relationship categorization, in which relational cues and the executive's own reactions match pitchers to two relational prototypes. The authors note the industry is a small world with shared prototypes, and they study how judgments are formed, not whether they predict good projects. Not tested for games.`,asOf:'2026-09-30',src:'https://leeds-faculty.colorado.edu/dahe7472/Elsbach%202003.pdf'}] });
TECH('pitching-and-stakeholders',[
  {n:'Ask with a date', how:`One sentence naming the decision, the resources requested and the date the answer is needed.`, fit:`Every pitch, from a hallway talk to a publisher meeting.`, cost:`Forces a commitment before you feel ready.`, alt:`A two-option ask when you do not know which fits.`},
  {n:'Evidence ladder', how:`Argument, reference game, greybox or paper prototype, playtest with numbers, vertical slice. Choose the cheapest rung that removes the doubt.`, fit:`Deciding how much to build before you pitch.`, cost:`The cheapest rung may not convince a hard sceptic.`, alt:`A short prototype built specifically to answer the main risk.`},
  {n:'Objection list', how:`Write the three questions the sceptic will ask and an answer plus a fallback for each.`, fit:`Publisher, leadership and cross-discipline pitches.`, cost:`Can make you defensive if you answer before being asked.`, alt:`Ask a colleague to play the sceptic.`},
  {n:'Decision memo', how:`Same-day note: what was decided, by whom, what changes, what is open, and the next check date.`, fit:`After any pitch or review.`, cost:`Someone has to write and own it.`, alt:`A line in the shared design doc.`}
]);
ENGINE('pitching-and-stakeholders',{
  godot:{ term:`A pitch demo that cannot fail. A pitch flag seeds the random generator, fixes the frame rate and turns off anything that phones home, so the run in the room is the run you rehearsed.`,
    api:['Autoload Node','OS.get_cmdline_user_args()','seed()','Engine.max_fps'],
    snippet:`extends Node   # autoload: Pitch. Run: godot -- --pitch
const DEMO_SEED := 20261001
var demo := false

func _ready() -> void:
\tdemo = "--pitch" in OS.get_cmdline_user_args()
\tif not demo:
\t\treturn
\tseed(DEMO_SEED)             # the same drops, the same enemies
\tEngine.max_fps = 60         # the frame rate you rehearsed at
\tprint("pitch mode: seed %d" % DEMO_SEED)

# other systems ask once: if Pitch.demo: skip analytics and popups`,
    pitfall:`Seeding once and using randomness from more than one place. seed() only fixes the global generator. A RandomNumberGenerator instance you created elsewhere, or a physics or particle system with its own randomness, still differs between runs, so the demo drifts. Route gameplay randomness through one seeded source and check that two runs give identical results before the meeting.`,
    map:`A Godot pitch flag on an autoload is a Unity static initialiser reading command line arguments and calling Random.InitState.` },
  unity:{ term:`The same idea as a static hook that runs before the first scene loads. If the player was started with the pitch flag, it seeds Unity's random state and locks the frame rate.`,
    api:['[RuntimeInitializeOnLoadMethod]','Environment.GetCommandLineArgs()','UnityEngine.Random.InitState()','Application.targetFrameRate','Array.IndexOf()'],
    snippet:`using System;
using UnityEngine;

public static class Pitch {
    public const int DemoSeed = 20261001;
    public static bool Demo { get; private set; }

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void Init() {
        Demo = Array.IndexOf(Environment.GetCommandLineArgs(), "--pitch") >= 0;
        if (!Demo) return;
        UnityEngine.Random.InitState(DemoSeed);   // the same drops every run
        Application.targetFrameRate = 60;
        Debug.Log($"pitch mode: seed {DemoSeed}");
    }
}`,
    pitfall:`Calling System.Random or Random.value from other code. UnityEngine.Random.InitState only fixes UnityEngine.Random. A System.Random created with no seed, or a package that uses its own generator, still varies, so the demo differs each run. Use one seeded generator for gameplay and test that two runs match. Application.targetFrameRate is also ignored while vSync is on, so set QualitySettings.vSyncCount to 0 for a fixed rate.`,
    map:`A Unity RuntimeInitializeOnLoadMethod that reads command line arguments is a Godot autoload reading OS.get_cmdline_user_args().` },
  note:`Seeding makes the random parts repeatable. It does not make the pitch true. If the demo needs the seed to look good, the design has a variance problem, and that is the first objection the room will find.` });
INTERVIEW('pitching-and-stakeholders',{
  junior:[
    { q:`What makes a good pitch different from a good description of a game?`,
      a:`A pitch asks for a decision. It says what you want approved, by when, why now, and what evidence supports it. A description says what the game is. The room can enjoy a description and decide nothing.`,
      follow:`What is the ask for a first prototype?`,
      red:`Describes the game at length and never states what they want from the room.` },
    { q:`What do you do when someone says no to your idea?`,
      a:`Find out which no it is: not now, not this, not this way, or not you. Then respond to that one. A not-now needs a date, a not-this needs to know what would fit, and a not-this-way needs options.`,
      follow:`Give an example of each.`,
      red:`Argues the same case louder.` }
  ],
  mid:[
    { q:`How do you decide what evidence to bring?`,
      a:`Find the one claim that would sink the design and use the cheapest evidence that tests it. If the risk is "is it fun", a playable prototype. If it is "will anyone want it", a reference and a small playtest. If it is "can we build it", an estimate from an engineer. More than that delays the decision.`,
      follow:`What if the sceptic will not accept that evidence?`,
      red:`Builds a vertical slice before asking anything.` },
    { q:`You pitch to a publisher and to your team lead. What differs?`,
      a:`The claim is the same, the risk each cares about differs. The publisher wants market, comparable titles, return and schedule. The lead wants scope, team fit and what gets cut. I keep the ask and the design the same and change the evidence and the objections I answer.`,
      follow:`What would you never change between the two?`,
      red:`Tells each audience whatever is easiest to hear.` },
    { q:`Your demo failed during the pitch. What did you do wrong before it happened?`,
      a:`Depended on live randomness, a network or an unrehearsed path. A demo should have a fixed seed, a scripted route, offline assets and a recording as backup. If it failed anyway, say what failed, show the recording and carry on. Owning the failure is better than hiding it.`,
      follow:`How would you test it for the room?`,
      red:`Blames the hardware.` }
  ],
  senior:[
    { q:`You need a team to accept a pillar change. How do you pitch it?`,
      a:`As a decision with a cost. State what changes and what stays, show the evidence that the old pillar is costing us, list what it makes us cut and keep, and give a date and a check. Name who decides, and send a memo afterwards so the change is written down.`,
      follow:`How do you handle the person who wrote the old pillar?`,
      red:`Announces the change as settled.` },
    { q:`How do you speak for the players in a room of business and production concerns?`,
      a:`With evidence they can weigh: playtest behaviour, guardrail metrics, the ethics test, and what the design asks of the player. Propose an option that keeps the goal and reduces the cost to the player. Being the person who only says no is losing the room.`,
      follow:`What do you do when the answer is still no?`,
      red:`Says the player always comes first and stops.` },
    { q:`A leader says "not this quarter" to a design you believe in. What now?`,
      a:`Ask what would make it yes: a date, a smaller version, a test. Offer a cheaper piece that keeps the idea alive, such as a prototype that uses spare time. Write down the conditions and the date to revisit. A dead idea is one nobody asks about again.`,
      follow:`How do you know it is worth pushing?`,
      red:`Drops the idea or goes over the leader's head.` }
  ] });
