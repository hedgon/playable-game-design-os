/* =====================================================================
   PRODUCT
   Each topic is followed by its techniques (TECH), engine views (ENGINE)
   and interview (INTERVIEW).
   ===================================================================== */
DOMAINS.push({ id:'product', lens:'design', t:'Product', short:'Audience, platform, model, positioning, scope', color:'var(--d-product)',
    sum:`Who will actually pick this up, on what device, for how long, and why yours instead of the thousand others. Product thinking keeps design honest about scope and about what makes the game distinct.`,
    links:[['player','Audience is the player model seen through a market lens.'],['production','Scope, platform and business model set every production constraint.'],['systems','Session length and monetization shape economy and progression.'],['experience','Positioning is a promise about the experience. The game must keep it.']] });

T('audience-and-positioning',{ d:'product', t:'Audience, positioning and differentiation', tag:'Why yours, instead of the thousand others? Answer in one sentence or you do not know yet.',
  what:`The market-facing statement of the player and the promise: who the game is for, what it does that the alternatives do not, and how a stranger would recognize that in ten seconds. Positioning is the fantasy plus the differentiator, stated for someone who has not played.`,
  why:[`Discovery is the main failure mode of finished games. A game nobody can describe is a game nobody recommends.`,`Positioning is the scope filter seen from outside: features that do not sharpen the sentence dilute the product.`,`A differentiator that is invisible in the first ten seconds of a trailer or the first ten minutes of play does not exist for the market.`],
  think:{ q:[`Complete: "For [PLAYER] who [WANTS], this is the game that [DIFFERENTIATOR], unlike [ALTERNATIVES]."`,`Is the differentiator visible in a screenshot? A trailer? The first ten minutes?`,`Which existing games will I be compared to? What do their players complain about?`,`Is the differentiator a feature or an experience? Experiences travel further by word of mouth.`],
    trade:[`Sharp positioning attracts a niche strongly and excludes the rest.`,`Genre-standard positioning is safe to explain and easy to ignore.`],
    traps:[`"It is X meets Y" where the meeting point is not the experience.`,`Differentiating on features the player only meets after ten hours.`,`Positioning written by marketing after the design is fixed.`],
    good:[`Playtesters describe the game the way the positioning does, without seeing it.`,`Strangers ask the right question after seeing one screenshot.`],
    bad:[`Every description starts with the genre and ends with a feature list.`] },
  how:[`Write the positioning sentence. Test it on strangers: what do they expect? Compare with the game.`,`Check the differentiator is in the first ten minutes of play and in one screenshot.`,`Mine the complaints about comparable games for a differentiator players already want.`,`Use the sentence as a gate: features that do not sharpen it wait.`],
  ai:{ yes:[`Generate positioning candidates from the fantasy and comparable games.`,`Mine reviews of comparables for unmet wants.`,`Check a feature list against the positioning and flag dilution.`],
       no:[`Choose the positioning. It is strategy.`,`Estimate market size with confidence it does not have.`] },
  prompts:[{l:'Positioning stress test',p:`Our positioning is: "[SENTENCE]". Comparable games: [LIST]. Act as a skeptical publisher. Is the differentiator visible in a screenshot and in the first 10 minutes of the described flow ([FLOW])? Which comparable already delivers it? What would a player of each comparable say when they hear the sentence? Propose 3 sharper alternatives grounded in what players of the comparables complain about, and state what each alternative would force us to cut.`}],
  verify:[`Did it flatter the positioning or test it?`,`Are the complaints it cites real and sourced, or plausible inventions?`],
  test:[`Show strangers one screenshot and the sentence. Ask what they expect. Compare.`,`After a first session, ask testers to describe the game to a friend. Compare with the sentence.`],
  rel:[['who-is-the-player','Positioning is the player model for the market.'],['core-experience','The promise must match the experience.'],['platform-and-session','Where and how long they play is part of who they are.'],['scope-control','Positioning is the external scope filter.'],['business-model','Model and positioning must agree.']] });
TECH('audience-and-positioning',[
  {n:'Positioning sentence', how:`For [player] who [want], this is the game where you [verb] …, unlike [comparables].`, fit:`A testable promise and a marketing line.`, cost:`Vague positioning hides a vague game.`, alt:`Test it on strangers. Count questions and wish-to-play.`},
  {n:'Comparison set and differentiation', how:`Name the games you will be judged against and the visible reason to pick yours.`, fit:`Making differentiation explicit.`, cost:`"Like X but better" is not differentiation.`, alt:`Use Reference Dissection.`}
]);
ENGINE('audience-and-positioning',{
  godot:{ term:`The claim gets tested against frames the build actually produced. A capture key writes the viewport to a PNG in user://, and an export preset feature tag marks the ten-minute slice you show strangers.`,
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
  unity:{ term:`ScreenCapture at end of frame for the capsule candidates, and a build profile with its own define for the slice you put in front of strangers. Both come from a player build, not the editor's game view.`,
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
      a:`They show wants the audience has that nothing currently serves, which is a differentiator someone has already demonstrated demand for. Read reviews and forums for the recurring ones rather than the loudest ones. Then check whether answering that complaint is something your design can actually do.`,
      follow:`How do you tell a genuine unmet want from a vocal minority's preference?`,
      red:`Treats their own dislikes as the market's complaints.` }
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
      a:`Explain what sharp positioning buys: a niche that recommends you and a sentence people can repeat. Widening usually means the differentiator stops being visible, which is the failure mode that actually kills games. Bring the stranger test results, offer a version that widens the audience without softening the hook, and be clear about what you would cut instead.`,
      follow:`They control the funding and they are not persuaded. What do you do?`,
      red:`Widens the sentence on request and stops testing it.` },
    { q:`Three years in, a comparable ships your differentiator. Now what?`,
      a:`Re-dissect it and find what they actually delivered versus what they announced, because the gap is usually the opportunity. Look at the complaints their version generates and position against those. If nothing remains, say so early rather than shipping into a space someone else owns, and name what would have to change for the project to still make sense.`,
      follow:`What evidence would make you recommend cancelling?`,
      red:`Adds more features to out-scope the competitor.` }
  ] });

T('platform-and-session',{ d:'product', t:'Platform, session length and context', tag:'Where and for how long decides pacing, input, readability and save design before you draw a level.',
  what:`The physical and temporal frame of play: device, input method, screen size and distance, typical session length, interruption pattern, and whether play is continuous or in bursts. These are design constraints, not afterthoughts.`,
  why:[`A loop that needs 20 minutes to become interesting fails on a platform where sessions are 5.`,`Input precision decides which skills you can demand.`,`Screen size and distance decide how much information the player can read.`],
  think:{ q:[`What is the median session? What must be satisfying inside it?`,`How does a session end: at a natural stopping point, or by interruption? Does the game survive interruption?`,`What can the player see and press on this device, in this posture?`,`Which platform conventions does the player expect? Which will I break, and why?`],
    trade:[`Designing for the smallest session includes more contexts and caps depth per session.`,`Multi-platform reach widens the audience and forces lowest-common-denominator input and readability.`],
    traps:[`Testing on a monitor, shipping on a phone.`,`Sessions that only end at boss fights.`,`Save systems designed after the levels.`],
    good:[`Players finish a satisfying unit inside a typical session.`,`Players quit at natural points and resume without friction.`],
    bad:[`Players lose progress to interruptions or say "I never have time to get anywhere".`] },
  how:[`Write the session profile: median length, interruption pattern, device, posture.`,`Define the satisfying unit that fits inside the median session. Structure the game around it.`,`Design saving and resuming as core features.`,`Test on the target device, in the target posture, with realistic interruptions.`],
  ai:{ yes:[`Audit a level and progression plan against the session profile.`,`Propose session-unit structures for a given loop and length.`,`Check readability and input demands against device constraints.`],
       no:[`Choose the platform. That is strategy.`] },
  prompts:[{l:'Session fit audit',p:`Session profile: median [MINUTES], interruptions every [MINUTES], device [DEVICE], posture [POSTURE]. Here is our level and progression plan: [PLAN]. Identify the satisfying unit that fits inside a median session, or state that none does. Flag stretches that cannot be interrupted safely and skills that exceed the input precision of the device. Propose the smallest restructuring that gives every session a complete unit.`}],
  verify:[`Did it account for the actual device constraints, or assume a desktop?`],
  test:[`Log real session lengths and end reasons.`,`Test with interruptions: what is lost?`,`Test on device and at distance.`],
  rel:[['goals-horizons','The session goal must fit the session.'],['readability-and-hierarchy','Screen and distance set readability.'],['controls-and-friction','Input method sets skill demands.'],['return-and-quit','Interrupted sessions are a churn source.']] });
TECH('platform-and-session',[
  {n:'Session-shape design', how:`Design the loop and save points around the platform's real session length (phone 3 min, couch 45 min, PC 2 h).`, fit:`Every platform choice. Drives structure, save and pacing decisions.`, cost:`Multi-platform support forces compromises and separate tuning.`, alt:`Pick a lead platform and design to its session shape first.`},
  {n:'Input and posture fit', how:`Match control scheme, text size and UI density to the device and posture (one thumb, controller, desk).`, fit:`Readability and friction. Mobile especially.`, cost:`Porting UI is not free. Needs redesign, not scaling.`, alt:`Design for the tightest target and expand outward.`},
  {n:'Platform services integration', how:`Achievements, cloud saves, multiplayer services, and store requirements.`, fit:`Certification and expected features per platform.`, cost:`Certification and per-platform work. Late integration is a common slip.`, alt:`Plan services integration as production scope, not a polish task.`}
]);
ENGINE('platform-and-session',{
  godot:{ term:`The session profile becomes notification handling. The resume point is written when the OS pauses the app or the back button is pressed, because on a handheld those are the only moments you are guaranteed.`,
    api:['Node._notification()','NOTIFICATION_APPLICATION_PAUSED / NOTIFICATION_APPLICATION_FOCUS_OUT','NOTIFICATION_WM_GO_BACK_REQUEST / NOTIFICATION_WM_CLOSE_REQUEST','SceneTree.auto_accept_quit / quit_on_go_back','DisplayServer.screen_get_dpi()','FileAccess + JSON for the resume point'],
    snippet:`extends Node

func _ready() -> void:
\tget_tree().auto_accept_quit = false        # the back button must not skip the save

func _notification(what: int) -> void:
\tmatch what:
\t\tNOTIFICATION_APPLICATION_PAUSED, NOTIFICATION_WM_GO_BACK_REQUEST:
\t\t\t_write_resume_point()              # the only save points the OS guarantees

func _write_resume_point() -> void:
\tvar f := FileAccess.open("user://resume.json", FileAccess.WRITE)
\tf.store_string(JSON.stringify({"level": Game.level, "checkpoint": Game.checkpoint}))
\tf.close()`,
    pitfall:`Leaving quit_on_go_back at its default on a handheld. The back button closes the app immediately, your close-request handler never runs, and the player loses the session they were three minutes into. Take the notification yourself, save, then quit.`,
    map:`Godot's _notification with NOTIFICATION_APPLICATION_PAUSED is Unity's OnApplicationPause.` },
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
    pitfall:`Setting Application.targetFrameRate while vSyncCount is non-zero. The cap is ignored, the device renders as fast as the display allows, and the thermal and battery budget you sized the session around is not the one the build runs with. Set vSyncCount to zero first, and confirm the frame rate on the device rather than in the editor.`,
    map:`Unity's OnApplicationPause is Godot's NOTIFICATION_APPLICATION_PAUSED.` }});
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
      a:`Break one only when the game genuinely needs it and the cost of relearning is smaller than the gain. Back button semantics, confirm and cancel placement and store conventions are where players are least forgiving. Test the break with players who are fluent on that platform, not with the team.`,
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

T('business-model',{ d:'product', t:'Business model and monetization', tag:'The model should pay for the fun without becoming the design. Where they conflict, players notice first.',
  what:`How the game earns: premium, free-to-play with purchases, subscription, ads, DLC, live service. Each model applies pressure to the design economy, progression, session design and social systems. Ethical monetization sells things players value without manufacturing the pain it relieves.`,
  why:[`Monetization pressure is the most common corrupter of design: timers to sell skips, grind to sell boosts, gacha to sell hope.`,`Players sense when a system exists to sell rather than to play, and it poisons trust in adjacent systems.`,`The model decides what "retention" means and which metrics the team will be pushed to optimize.`],
  think:{ q:[`What does the player pay for, and would they value it if the game had no store?`,`Which design decisions exist only because of the model? Would the game be better without them?`,`What pain does a purchase relieve, and did the design create that pain on purpose?`,`Which metric will the model push us to optimize, and does that metric align with fun?`],
    trade:[`Premium aligns incentives with fun and limits reach and revenue tail.`,`Free-to-play widens reach and creates constant pressure to monetize friction.`],
    traps:[`Designing the store before the loop.`,`Metrics (ARPU, session count) optimized at the cost of the experience.`,`"Ethical" monetization declared rather than tested with players.`],
    good:[`Players describe purchases as wanted, not needed.`,`Non-payers describe the game as complete.`],
    bad:[`Players describe the game as "pay to win" or "designed to annoy you into paying".`] },
  how:[`List every system that exists for the model. For each, ask whether the game would be better without it.`,`Ensure the loop is voluntarily replayed before any monetization is added.`,`Sell value (expression, convenience players did not need to be annoyed into wanting, content) rather than relief.`,`Test with payers and non-payers. Ask both what the store feels like.`],
  ai:{ yes:[`Model revenue under different structures and player behavior assumptions.`,`Audit the design for monetization-induced friction.`,`Summarize regulatory and platform policy constraints (as a starting point. Verify with counsel).`],
       no:[`Decide monetization ethics. That is a values decision.`,`Optimize a metric without you deciding whether the metric is right.`] },
  prompts:[{l:'Monetization friction audit',p:`Here are our systems and our business model: [SYSTEMS, MODEL]. Identify every system or number that exists primarily to create a purchase opportunity. For each, describe the player pain it creates, whether the design manufactured that pain, and what the game would feel like without the system. Then propose monetization that sells value players would want in a game with no store, given the fantasy "[FANTASY]".`}],
  verify:[`Did it defend friction as "industry standard"?`,`Did it distinguish value from relief?`],
  test:[`Ask non-payers whether the game feels complete.`,`Ask payers why they bought. "Wanted" versus "had to".`,`Where do players mention the store unprompted, and in what tone?`],
  rel:[['economy-and-resources','The model pressures the design economy.'],['progression','Grind is where monetization pressure shows.'],['social-experience','Social systems and spending interact.'],['audience-and-positioning','Model and positioning must agree.']] });
TECH('business-model',[
  {n:'Premium / one-time purchase', how:`Charge once. The design can be tuned to respect the player's time.`, fit:`Craft-driven, finite or narrative games. Trust-sensitive audiences.`, cost:`Needs reach. No live revenue to fund long-term content.`, alt:`Premium plus paid expansions.`},
  {n:'Free-to-play with monetization', how:`Free entry, revenue from cosmetic, convenience or progression sales. Economy design becomes central.`, fit:`Large live audiences and long retention.`, cost:`Pressure to design paywalls and grind. Risks perceived manipulation and churn.`, alt:`Cosmetic-first and transparent, with no power purchase.`},
  {n:'Subscriptions / season passes / live service', how:`Recurring revenue tied to ongoing content cadence.`, fit:`Games with a content pipeline and a live team.`, cost:`Requires sustained production. Punishing if cadence slips.`, alt:`Only if the team can ship on schedule indefinitely.`}
]);
ENGINE('business-model',{
  godot:{ term:`Godot has no first-party store layer. Billing arrives as a platform plugin exposed through Engine.get_singleton, and the client's job stops at handing the purchase token to your server.`,
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
    pitfall:`Granting the item when purchases_updated fires and never acknowledging or consuming the purchase. The store refunds anything left unacknowledged past its window, so the player pays, gets the item locally, and loses both. A client-side grant is also the easiest thing in the game to fake.`,
    map:`Godot's platform billing singleton is Unity IAP's store listener.` },
  unity:{ term:`Unity IAP gives you a store listener and a pending-purchase state. ProcessPurchase returns Pending, the server verifies the receipt and grants, and only then does the client confirm the transaction with the store.`,
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
    map:`Unity IAP's pending purchase plus server verification is Godot's billing plugin plus your own receipt endpoint.` },
  note:`Both engine tabs stop at the same line. The client surfaces the offer, hands the receipt over and waits. What the player owns is a server fact, because anything the client decides is a value the player can edit. The design questions in this topic (what does a purchase relieve, and did the design create that pain) are answered in the economy on the server, not in the store UI.` });
INTERVIEW('business-model',{
  junior:[
    { q:`Name three business models and what each pressures in the design.`,
      a:`Premium aligns incentives with making the game good and limits reach and the revenue tail. Free to play widens reach and creates constant pressure to monetise friction. Subscription pressures cadence and retention rather than any single purchase. Say which metric each pushes the team to optimise.`,
      follow:`Which metric would your team be pushed toward, and does it align with fun?`,
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
      a:`The economy, the progression pacing, the session structure, the social systems, the content cadence and the metrics all change, because the model decides what retention means. Treat it as a redesign of the loop's surroundings rather than a store bolted on. Re-validate the loop under the new pacing before building any store content.`,
      follow:`What would you refuse to change, and why?`,
      red:`Adds a shop and a currency and treats the rest of the design as unaffected.` }
  ] });
FACTS('business-model',[
  { claim:`On 11 December 2025 the US Ninth Circuit largely upheld the injunction in Epic v. Apple: Apple may not restrict links to outside purchases in US apps, and whether it may charge a commission on those purchases went back to the district court. Apple has asked the Supreme Court to review the case.`, asOf:'2026-09-23', src:'https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf' }
]);

T('scope-control',{ d:'product', t:'Scope control', tag:'Scope should follow validated value, not imagination. AI makes this harder, not easier.',
  what:`The discipline of deciding what the game contains, based on what has been shown to work rather than what could be built. The healthy sequence is idea, prototype, evidence, commit. The unhealthy one is idea, production commitment. AI makes implementation cheap enough that huge amounts of mediocre content can be produced before anyone asks whether the core is fun.`,
  why:[`Scope is the most common cause of games that never ship or ship hollow.`,`Cheap implementation removes the natural brake on scope. The brake must become deliberate.`,`Every feature carries costs beyond building it: teaching, balancing, maintaining, and diluting the core.`],
  think:{ q:[`What has been validated with players? Scope grows from there, not from the pitch.`,`What is the smallest version of this game that delivers the core experience?`,`For each feature: what would we lose by not building it? Be specific about the player experience.`,`What is on the "not this game" list? Is it written down?`],
    trade:[`Tight scope ships and may feel thin. Wide scope feels ambitious and may never cohere.`,`Cutting late saves the project and wastes the cut work.`],
    traps:[`Scope defined by the pitch deck.`,`"AI can build it in a day" as an argument to build it.`,`Content pipelines started before the system is validated.`,`Never writing the not-list.`],
    good:[`The team can name the three things the game is about and the ten it is not.`,`Cut features have a documented reason and a player-evidence trigger for revisiting.`],
    bad:[`Feature list grows every sprint. Core loop metrics do not move.`] },
  how:[`Write the core experience statement and the not-list.`,`Order features by dependency on validated evidence: what needs the loop proven first, what needs progression proven, and so on.`,`Gate each production commitment on a prototype and playtest result.`,`Review the feature list monthly: what has evidence, what is imagination?`,`Treat cheap AI implementation as a reason to prototype more, not to ship more.`],
  ai:{ yes:[`Map feature dependencies and identify what can be validated first.`,`Estimate total cost including teaching, balance and maintenance, not just build.`,`Draft the not-list from the positioning and flag features that violate it.`],
       no:[`Decide what to cut. That is the human's most important job.`,`Argue that low build cost justifies building.`] },
  prompts:[{l:'Scope triage',p:`Here is our feature list and what has been validated with players so far: [FEATURES, EVIDENCE]. For each feature, state which validated result it depends on, its full cost (build, teach, balance, maintain, dilution of core), and what the player would lose without it. Sort into: build now (evidence supports), prototype first (evidence missing), defer (depends on unvalidated features), and cut (does not serve "[CORE EXPERIENCE]"). Argue against your own "build now" list once.`}],
  verify:[`Did it count build cost only?`,`Did it defer decisions to "it depends" instead of sorting?`],
  test:[`Does removing a feature in a prototype change player behavior? If not, it may not need to exist.`,`Which features do players never mention or use?`],
  rel:[['prototyping','Prototypes are how scope earns its place.'],['content-multiplies','Content is where scope explodes.'],['core-experience','The experience statement is the scope filter.'],['ai-failure-modes','Feature inflation and content spam are AI-era scope failures.'],['should-we-build-this','The decision tree operationalizes scope control.']] });
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
    api:['Scripting Define Symbols / BuildProfile','AssetReferenceGameObject + InstantiateAsync()','Addressables groups and labels','asmdef Define Constraints','[Conditional] attributes','Editor log build report for what actually shipped'],
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
    pitfall:`Believing a define cut the content. Serialised references pull assets into the build whether or not the code that uses them compiles, so a cut feature still costs download size and load time. Read the build report in the Editor log to see what actually shipped, and move optional content behind Addressables.`,
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
      follow:`It is the creative director's favourite. How does the conversation go?`,
      red:`Cuts it quietly and lets people discover it missing.` }
  ],
  senior:[
    { q:`Six months from ship and clearly over scope. Build the cut list.`,
      a:`Order by dependency so you are not cutting something three other things need. Protect the core experience and cut whole features rather than shaving quality everywhere, because uniform quality reduction shows up in every review. Count the teaching and balance cost you recover, and publish the list with the reason attached to each line.`,
      follow:`How do you choose between cutting a feature and cutting quality?`,
      red:`Reduces polish across the board and keeps every feature.` },
    { q:`How do you make scope control a team habit rather than a lead's nagging?`,
      a:`Put the evidence gate into the process the team already follows, so a commitment needs a prototype result to move forward. Keep the not-list visible and update it in public. Budget prototype time explicitly, because a team with no time to test will commit by default. Then show one case where the gate saved the schedule.`,
      follow:`What does the first month of that look like?`,
      red:`Relies on a strong lead saying no and calls that the process.` }
  ] });

T('learning-from-success',{ d:'product', t:'Dissect games that succeeded', tag:'Your idea is only as good as its answer to "why would they play this instead of that?" Find "that" and take it apart.',
  what:`A method for judging an idea before building it: pick the games your player already plays that satisfy a similar want, dissect each with one template (want served, core verb, first 30 seconds, decision per minute, engines, why it worked, what players complain about), then cross-reference your concept against them: which proven want you share, what you do that none of them do, which complaint you answer, which patterns you are borrowing and whether you re-derived them, where a fan of theirs would find you weaker, and whether your team can reach the quality bar they set.`,
  why:[`A successful comparable is evidence that the audience and the want exist. Without one, your idea is a bet on a want nobody has demonstrated.`,`Most weak ideas are a comparable with a cosmetic difference. The dissection makes that visible before months of work.`,`Copies fail on what they leave out, not on what they add. Knowing what the original’s success actually rested on tells you what you cannot skip.`],
  think:{ q:[`Which three games would my player stop playing to play mine? Have I actually taken them apart?`,`What is the one decision per minute that made each of them work? Do I have one that is at least as frequent and as readable?`,`Which recurring complaint about them does my concept answer? Is that a want, or my taste?`,`What am I borrowing? For each borrowed pattern: did I re-derive it from my player and constraints, or copy it because it was there?`,`Where would a fan of the comparable find mine weaker? Can I afford that, or does it kill the concept?`,`Can my team reach the quality bar they set on the things that matter for the want?`],
    trade:[`Close comparables prove the market and make differentiation harder. Distant comparables leave room and prove less.`,`Dissecting deeply takes days. Building the wrong game takes months.`],
    traps:[`Reading success as features ("it has a shop, a map and a three-card choice") rather than as mechanisms ("every reward is a reasoned decision").`,`Citing sales figures as design lessons. Numbers say it sold. The dissection says why it kept people.`,`Choosing comparables you admire instead of the ones your player actually plays.`,`Letting AI invent postmortem details. Ask for sources or "unknown".`],
    good:[`You can state, for each comparable, the mechanism its success rested on in one sentence and point to your equivalent.`,`Your differentiator is visible in one screenshot and answers a complaint players of the comparable actually make.`],
    bad:[`Your pitch is "like X but with Y" where Y is a theme, a setting or more content.`] },
  how:[`Use the Reference Dissection tool. Add the three to five games your player plays for this want. Start from the library entries or dissect your own with the template.`,`For each, fill the template. Where you do not know, ask AI to dissect from public postmortems and interviews, with sources, and verify the ones you rely on.`,`Answer the seven cross-reference questions honestly. The verdict tells you whether the idea is promising, derivative, unproven or undeliverable, and names the next test.`,`Take the differentiator and the answered complaint into the want tests (stranger pitch, one-pager, one-day loop). Take the borrowed patterns into the Behavior Ladder to re-derive them.`],
  ai:{ yes:[`Dissect a named game from public postmortems, talks and interviews, using the template, citing sources or marking unknowns.`,`Cluster player complaints about a comparable from reviews and forums into wants.`,`Steelman the comparables against your concept: argue why a fan would not switch.`,`Compare your concept and the comparables on the template dimensions in a matrix.`],
       no:[`Decide which comparables matter. That depends on your player, whom AI has not met.`,`Assert why a game succeeded without sources. Success narratives are where hallucination thrives.`,`Declare your idea good. The want tests do that.`] },
  prompts:[{l:'Dissect a comparable',p:`Dissect [GAME] as a designer, using public postmortems, GDC talks, developer interviews and critical consensus. Fill this template with one to three sentences each: the player want it served, the core verb. The first 30 seconds. The decision the player faces every minute. The engines it runs on (mastery, discovery, expression, social, and so on). Why it worked, as the developers and critics explain it. What players most often complain about. The transferable lesson. And what copies of it usually miss. Cite a source for every claim about why it worked, or write "unknown". Do not cite sales figures.`},
    {l:'Cross-reference my concept',p:`My concept: [POSITIONING SENTENCE, FANTASY, CORE VERB, DECISION PER MINUTE]. Comparables my player plays, dissected: [DISSECTIONS]. Build a matrix comparing my concept and each comparable on: want served, core verb, decision per minute, first 30 seconds, engines. Then answer: which proven want do I share, what do I do that none of them do, and is it visible in one screenshot. Which recurring complaint do I answer. Which patterns am I borrowing and which of those did I re-derive from my player and constraints. Where would a fan of each comparable find mine weaker. Can a team of [CONSTRAINTS] reach the quality bar they set on the things that matter. Be adversarial. Finish with the single cheapest test that would show my player wants this.`}],
  verify:[`Did the AI cite sources for every "why it worked" claim, or narrate plausibly?`,`Is the differentiator it credits you with mechanical, or cosmetic?`,`Did it steelman the comparables, or flatter the concept?`],
  test:[`Stranger pitch to players of the comparable: do they ask how it plays, or say "so it is like X"?`,`Show the one-pager next to a screenshot of the comparable: can they say what is different without being told?`,`One-day loop with fans of the comparable: do they replay, and what do they say it lacks?`],
  rel:[['finding-an-idea','Dissection is how a raw idea becomes a testable concept.'],['audience-and-positioning','The differentiator you find here is the positioning sentence.'],['who-is-the-player','Comparables are chosen by what your player actually plays.'],['feature-vs-experience','Borrowed patterns must be re-derived on the ladder.'],['scope-control','The quality bar the comparables set is a scope decision.']] });
TECH('learning-from-success',[
  {n:'One-template dissection', how:`Take apart a comparable on one template: want served, core verb, first 30 seconds, decisions per minute, why it worked, complaints, what copies miss.`, fit:`Extracting transferable mechanisms without copying surface.`, cost:`Success narratives are heuristics. Survivorship bias.`, alt:`Use the Reference Dissection tool.`},
  {n:'Cross-reference questions', how:`Test your concept against the comparable on shared want, differentiator, answered complaint, quality bar and audience evidence.`, fit:`Deciding promising / derivative / unproven / undeliverable.`, cost:`Only as good as your comparables.`, alt:`Answer with evidence, not optimism.`}
]);
ENGINE('learning-from-success',{
  godot:{ term:`Decisions per minute is a measurement, not an estimate. A logger writes every meaningful action with a timestamp so your prototype and the comparable are compared on the same number.`,
    api:['Node._unhandled_input()','InputEvent.is_action_pressed()','InputEventKey.echo','FileAccess.open("user://…", WRITE) / store_line()','Time.get_ticks_msec()','OS.has_feature("editor") to separate editor runs'],
    snippet:`extends Node                                   # measured in an export build, not the editor
var _log := FileAccess.open("user://decisions.csv", FileAccess.WRITE)
const MEANINGFUL := [&"attack", &"dodge", &"swap", &"buy"]

func _unhandled_input(e: InputEvent) -> void:
\tif e is InputEventKey and e.echo:
\t\treturn                                 # autorepeat is not a decision
\tfor a in MEANINGFUL:
\t\tif e.is_action_pressed(a):
\t\t\t_log.store_line("%d,%s" % [Time.get_ticks_msec(), a])`,
    pitfall:`Counting every input event as a decision. Held keys emit echo events at the OS repeat rate, so leaning on a direction for two seconds logs dozens of decisions and your prototype appears to be denser than the game you are measuring it against. Filter echo, and count only the actions that change the plan.`,
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
    pitfall:`Subscribing to started, performed and canceled on the same action. Any action with a Hold or Press interaction fires all three, so one dodge is logged as three decisions and the rate you compare against the comparable is inflated threefold. Pick the callback that matches what you decided counts as a decision.`,
    map:`Unity's InputAction callbacks are Godot's action presses in _unhandled_input.` }});
INTERVIEW('learning-from-success',{
  junior:[
    { q:`Pick a game your target player already plays and dissect it.`,
      a:`Use one template: the want it serves, the core verb, the first thirty seconds, the decision the player faces every minute, the engines it runs on, why it worked, and what players complain about. Then say what a copy of it would most likely leave out. The dissection is about mechanisms, not features.`,
      follow:`What is the mechanism its success actually rested on?`,
      red:`Lists the features it shipped with and calls that the reason it worked.` },
    { q:`Why is a pitch of the form this game but with a different theme weak?`,
      a:`Because the difference is cosmetic and the player's reason to switch has to be mechanical or experiential. A theme is not a want. Most weak ideas are a comparable with a cosmetic difference, and the dissection is what makes that visible before months of work.`,
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
      a:`The games your player would stop playing to play yours, not the games you admire. That means asking your player model what they actually play for this want. Include the uncomfortable ones, because they are the direct competition for the same hours.`,
      follow:`Your player plays a genre your team cannot build. What does that tell you?`,
      red:`Chooses critically acclaimed games the target audience does not play.` }
  ],
  senior:[
    { q:`The comparables set a quality bar your team cannot reach. What do you do?`,
      a:`Be specific about which dimensions matter for the want and which do not, because a team rarely has to match on everything. Then either narrow the game so the team can be excellent on the dimensions that matter, reposition on a want with a lower bar, or recommend not making it. Say which evidence would settle which dimensions matter.`,
      follow:`How do you establish which dimensions the want actually depends on?`,
      red:`Assumes hard work will close a gap in production capacity.` },
    { q:`Your studio treats studying comparables as copying. How do you change that?`,
      a:`Separate dissection from imitation explicitly: the output is a mechanism and an unmet want, and every borrowed pattern has to be re-derived from your own player and constraints before it enters the design. Run the first session yourself on a game everyone respects and finish with a steelman against your own concept. The credibility comes from the steelman.`,
      follow:`How would you run that first session?`,
      red:`Presents comparables as templates to match feature for feature.` }
  ] });

T('launch-and-discoverability',{ d:'product', t:'Launch and discoverability', tag:'A game nobody finds is not a game. The store page is the first level.',
  what:`How players discover and choose the game: the store page and capsule, wishlists, the demo, festivals and streamer moments, the trailer, and the first impression. Discoverability is a design constraint because it decides what the first minute has to prove.`,
  why:[`Most games fail on discovery, not on craft.`,`The store page is where the game is judged before it is played, and it must match the real hook.`,`Wishlists and demos convert attention into launch volume.`,`The first impression sets what the game is allowed to be.`],
  think:{ q:[`Can a stranger explain the hook from the capsule alone?`,`Does the page promise what the first ten minutes deliver?`,`What does the first minute of the trailer show the player doing?`,`Which beats build an audience before launch, and which are too late?`],
    trade:[`A bold capsule wins clicks and can mislead. An honest one converts fewer and keeps them.`,`Marketing spends time that could be spent making the game better, and without it the game is unseen.`],
    traps:[`Marketing that describes a different game.`,`Launching with no audience built beforehand.`,`Treating the store page as an afterthought.`,`A trailer that shows nothing the player actually does.`],
    good:[`A fan can say what the game is from the capsule.`,`Wishlists grow before launch and the demo converts them.`],
    bad:[`Nobody can tell what the game is.`,`The page is a feature list.`] },
  how:[`Write the hook as one sentence and keep it honest.`,`Build the capsule around the core verb.`,`Make a demo or a festival beat that shows the loop.`,`Grow wishlists and test the page language as you go.`,`Align the page, the trailer and the first minute.`],
  ai:{ yes:[`Draft store copy and trailer beat sheets.`,`Generate capsule concepts and A/B variants.`,`Mine reviews of comparables for the language players actually use.`],
       no:[`Decide the hook.`,`Promise something the game does not deliver.`] },
  prompts:[{l:'Hook and page',p:`Here is our game, its player and its core loop: [CONTEXT]. Write one hook sentence a stranger could repeat, a short store description that promises only what the first ten minutes deliver, and a list of the three things a trailer must show. Mark anything you were unsure of.`},{l:'Discoverability plan',p:`Our genre, platform and timeline are: [CONTEXT]. List the realistic beats that could build an audience before launch, ordered by cost and expected effect, and the one demo or festival moment that would best show our loop.`}],
  verify:[`Does the page promise match the first minutes of play?`,`Is the hook mechanical rather than a theme?`],
  test:[`Show the capsule to ten matched players. Can they say what the game is and what they would do in it?`],
  rel:[['audience-and-positioning','Discoverability tests the positioning in public.'],['business-model','The store page states the model before players commit.'],['learning-from-success','Comparables show how similar games were framed.'],['onboarding','The first minute must deliver on the page promise.'],['ai-disclosure-policy','The store page is where your AI disclosure lives.']] });
TECH('launch-and-discoverability',[
  {n:'Hook sentence', how:`One mechanical sentence a stranger could repeat.`, fit:`Capsule, page and press together.`, cost:`Forces the game to have one clear idea.`, alt:`A positioning statement from the comparables.`},
  {n:'Demo beat', how:`A short playable or festival moment that shows the loop rather than the story.`, fit:`Building wishlists before launch.`, cost:`Content that must be maintained and kept current.`, alt:`A trailer built from real gameplay when no demo is possible.`},
  {n:'Wishlist funnel', how:`Track where attention comes from and how it converts to wishlists and then sales.`, fit:`Any game with a marketing runway.`, cost:`Ongoing measurement and page iteration.`, alt:`Listen to comparables and festival feedback when the audience is small.`}
]);
ENGINE('launch-and-discoverability',{
  godot:{ term:`The demo and the trailer are both export presets. A trailer feature tag switches on a scripted camera rig, and the engine's movie writer renders deterministic frames at a fixed rate instead of screen-recording a laggy session.`,
    api:['Export preset custom features + OS.has_feature()','godot --write-movie file.avi --fixed-fps 60','Movie Maker mode in Project Settings','SceneTree.quit()','ProjectSettings application/config/version','Marker3D camera path'],
    snippet:`extends Node                       # godot --write-movie trailer.avi --fixed-fps 60
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
    pitfall:`Building the demo from the full project. Everything under a Resources folder is included whole regardless of what the demo's scenes reference, so a short slice downloads at close to full game size and the store page's file size contradicts the pitch. Move optional content to Addressables and check the build report.`,
    map:`Unity build profiles with Unity Recorder are Godot export presets with Movie Maker mode.` }});
INTERVIEW('launch-and-discoverability',{
  junior:[
    { q:`What is the store page's job?`,
      a:`It is where the game is judged before anyone plays it, so it must state the hook in a sentence a stranger can repeat and promise only what the first ten minutes deliver. Build the capsule around the core verb rather than around a logo. Treat it as the first level, because it is the first thing the player has to read.`,
      follow:`A stranger sees only the capsule. What do they say the game is?`,
      red:`Describes the page as a marketing deliverable outside the design's responsibility.` },
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
      a:`Change the page, change the first ten minutes, or accept the mismatch and expect refunds and early negative reviews. Measure which is cheaper and which is honest. The mismatch is usually cheapest to fix in the game's first minutes, because that work also improves onboarding.`,
      follow:`The promise is what built the wishlists. Does that change the answer?`,
      red:`Keeps the promise because it converts and treats the refunds as unrelated.` },
    { q:`Build a discoverability plan with no budget.`,
      a:`List the beats that could build an audience, ordered by cost and expected effect, and pick the one demo or festival moment that best shows the loop. Use the language players of the comparables actually use rather than your internal vocabulary. Make sure the loop is legible on a stream, because that is free reach you either earn or forfeit.`,
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
  { claim:`Steam's content survey asks developers to disclose AI-generated content that ships in the game or appears on the store page, split into pre-generated and live-generated content; tools used only during development are exempt (rules rewritten on 16 January 2026).`, asOf:'2026-09-23', src:'https://www.kitguru.net/desktop-pc/mustafa-mahmoud/steam-updates-its-gen-ai-disclosure-policies/' }
]);

T('live-operations',{ d:'product', t:'Post-launch and live operations', tag:'Release is a milestone, not a finish line. Decide what the game becomes after players arrive.',
  what:`What happens after launch: update cadence, balance and bug patches, seasons or events, community and support, and how ongoing content funds itself. A premium game, an update-driven game and a live-service game need different post-launch designs.`,
  why:[`Players find balance and exploit problems that testing missed.`,`Post-launch decisions are still design decisions, and they change what the game is.`,`Promising ongoing support is a design commitment, not a marketing line.`],
  think:{ q:[`What does the first update fix, and what does it add?`,`What cadence can the team actually sustain?`,`How do players report problems, and who answers?`,`Does the content model fund the updates?`,`What do we owe the players who arrived first?`],
    trade:[`Live content retains players and risks a treadmill, fatigue and scope.`,`Fast patches are responsive and can thrash the balance.`],
    traps:[`Launching a live plan with no capacity to run it.`,`Nerfing in silence.`,`Ignoring the community.`,`Monetizing the fix for a problem the design created.`],
    good:[`A realistic cadence.`,`A channel for feedback.`,`Updates that keep the original promise.`],
    bad:[`Radio silence.`,`Contradictory patches.`,`A roadmap nobody can build.`] },
  how:[`Plan the first ninety days before launch.`,`Separate fixes from features and say which a patch is.`,`Set a cadence you can keep and protect it.`,`Give players a channel and answer it visibly.`,`Watch the same signals you watched before launch and decide with the evidence.`],
  ai:{ yes:[`Cluster community feedback and summarize sentiment.`,`Draft patch notes and update plans.`,`Simulate balance changes against player data.`],
       no:[`Decide what to change in response to the community.`] },
  prompts:[{l:'First update plan',p:`Here is our launch state, player feedback and team capacity: [CONTEXT]. Propose the first update split into fixes and additions, each with the player problem it addresses and the signal you would watch to know it worked. Flag anything the cadence cannot sustain.`}],
  verify:[`Does the promised cadence match the team?`,`Is there a feedback channel and an owner?`],
  test:[`Publish patch notes for one planned update. Can a player tell what changed and why?`],
  rel:[['business-model','The model determines what post-launch has to fund.'],['metrics-and-success','Post-launch you decide with the same signals.'],['launch-and-discoverability','The first players set the community tone.'],['iteration-and-evidence','Live updates are iterations on a larger stage.']] });
TECH('live-operations',[
  {n:'First-90-days plan', how:`Fixes and additions mapped to the first quarter after launch.`, fit:`Every launch, premium included.`, cost:`Commits capacity after the launch push.`, alt:`A smaller hotfix plan when live content is not intended.`},
  {n:'Feedback channel', how:`One visible place where players report problems and one owner who answers.`, fit:`Building trust and catching issues early.`, cost:`Triage load and expectation management.`, alt:`A public changelog and a monitored community thread.`},
  {n:'Update cadence', how:`A rhythm of patches and content that the team can actually sustain.`, fit:`Live games and update-driven games.`, cost:`Promise made in public.`, alt:`Milestone-sized updates rather than a fixed clock.`}
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
  unity:{ term:`Addressables with a remote catalog. The client checks for catalog updates at boot, downloads only the bundles whose hashes changed, then loads the new content by address.`,
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
    pitfall:`Doing a full Addressables rebuild for a content update instead of "Update a Previous Build" against the saved content state. Every bundle gets a new hash, so returning players re-download the entire catalogue for a one-asset balance fix, and on mobile a large share of them never finish it. Keep the content state file in version control with the release.`,
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

T('localization-and-culture',{ d:'product', t:'Localization and culturalization', tag:'Text, layout and meaning all change between languages and markets. Design for it before it is expensive.',
  what:`Designing text, interface and content to survive translation and cultural change: string expansion and contraction, gendered and plural grammar, text baked into images or spoken aloud, right-to-left layout, icons and colours that carry meaning, and the platform or age requirements of each market.`,
  why:[`English layout assumptions break in German and shrink in Chinese.`,`Meaning does not always translate, and references can fail or offend.`,`Retrofitting localization costs far more than designing for it.`,`A market can refuse a launch for a rating or payment reason.`],
  think:{ q:[`How much can this string grow, and does the layout absorb it?`,`Is the meaning in text, in an icon, or in a voice line?`,`What in our art or writing is culture-specific?`,`What does each target market require for rating, language and payment?`,`Who approves the translated tone?`],
    trade:[`Designing for all languages constrains voice and layout.`,`Localizing everything costs and reaches more players.`],
    traps:[`Text baked into images.`,`Hard-coded grammar assumptions.`,`Symbols and colours treated as universal.`,`Translation started at the end.`],
    good:[`Layouts survive the longest translation.`,`Tone guides exist and strings are externalized.`],
    bad:[`The interface breaks in German.`,`Jokes fall flat.`,`A market cannot launch for a rating reason.`] },
  how:[`Externalize every string.`,`Budget for text expansion and test the longest language.`,`Annotate context for translators, including tone and speaker.`,`Use locale-aware formatting for numbers, dates and currency.`,`Check platform and rating requirements early.`],
  ai:{ yes:[`Pre-translate drafts and flag expansion risk.`,`Explain cultural references and adapt tone against a guide.`,`Generate pseudo-localized strings to test layout.`],
       no:[`Sign off the final localized tone or the cultural fit.`] },
  prompts:[{l:'Localization prep',p:`Here are our UI strings and their layout constraints: [LIST]. For each, state the maximum expansion the layout allows, whether the meaning depends on grammar, gender or word order, and the terms that need a glossary entry. Flag strings whose meaning is carried by an image or a voice line.`}],
  verify:[`Are all strings externalized?`,`Has the longest target language been tested in layout?`,`Are platform and rating requirements known?`],
  test:[`Pseudo-localize every string with a longer language and open every screen. Note what overflows or clips.`],
  rel:[['ux-as-design','Localization is a layout and information problem.'],['readability-and-hierarchy','Translation changes the length and weight of everything.'],['premise-and-world','Cultural references live in the writing and the art.'],['platform-and-session','Markets bring their own platform and rating rules.']] });
TECH('localization-and-culture',[
  {n:'String externalization', how:`All display text separated from code and layout.`, fit:`Any game that may ship in more than one language.`, cost:`Up-front engineering and discipline.`, alt:`A late extraction pass for tiny projects, at higher cost.`},
  {n:'Pseudo-localization', how:`Replace strings with a longer, accented version to test layout before translation.`, fit:`Catching overflow early and cheaply.`, cost:`Another build variant to maintain.`, alt:`Design with the longest known language in mind.`},
  {n:'Cultural review', how:`A pass on references, symbols, colours and representation per target market.`, fit:`Markets and content where meaning is not universal.`, cost:`Slows a launch and can require art changes.`, alt:`Flag risky content and localize only what is necessary.`}
]);
ENGINE('localization-and-culture',{
  godot:{ term:`Strings live in translation files imported as Translation resources, and the game asks for them with tr. One key carries the whole sentence including its placeholders, so word order stays with the translator.`,
    api:['tr() / tr_n() / atr()','TranslationServer.set_locale() / get_loaded_locales()','String.format() with named placeholders','POT generation in Project Settings > Localization','Node.auto_translate_mode','OS.get_locale()'],
    snippet:`extends Label

func _ready() -> void:
\tauto_translate_mode = Node.AUTO_TRANSLATE_MODE_DISABLED   # translate once, here
\tTranslationServer.set_locale(OS.get_locale())

func refresh(found: String, count: int) -> void:
\t# One key with placeholders inside it. Fragments freeze English word order.
\ttext = tr("HUD_FOUND").format({"item": tr(found), "n": count})
\t$Plural.text = tr_n("ITEM_ONE", "ITEM_MANY", count)`,
    pitfall:`Building sentences by concatenating translated fragments. Languages put the number, the object and the verb in different places, so tr("YOU_FOUND") plus a name is untranslatable and the translator has no way to fix it. Ship one key per sentence with named placeholders, and use tr_n where the plural rule is not English's.`,
    map:`Godot's tr with imported translation resources is Unity's Localization package with string tables.` },
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
    map:`Unity's Localization package with string tables is Godot's tr with imported translation resources.` }});
INTERVIEW('localization-and-culture',{
  junior:[
    { q:`What breaks in an interface when you translate English into German?`,
      a:`Strings expand, so labels clip, buttons overflow and layouts that were tight become broken. Chinese contracts instead, which leaves layouts looking empty and sometimes changes the reading order of a screen. Budget expansion per string and test the longest target language rather than assuming the English fits everywhere.`,
      follow:`What else changes for a right-to-left language?`,
      red:`Assumes a font change and a smaller size will absorb it.` },
    { q:`Why must strings be externalised?`,
      a:`Because anything baked into an image, a scene or a hard-coded line cannot be translated without a rebuild by the original discipline. Externalising is cheap at the start and expensive to retrofit across a finished project. The same applies to text in textures and to information carried only by a voice line.`,
      follow:`What do you do about text already baked into art?`,
      red:`Plans to hand the translator a build and a spreadsheet extracted at the end.` },
    { q:`What is culturalization, as distinct from translation?`,
      a:`Translation moves the words. Culturalization checks that the meaning survives: references that do not land, gestures and symbols that read differently, colours that carry another association, and content a market's rating or payment rules will not accept. It can change art and design, not only strings.`,
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
    { q:`Plan localization for six languages from month one.`,
      a:`Externalise everything and forbid text in textures from the start. Put pseudo-localization into the build so layout regressions are caught the day they appear. Budget expansion per layout, maintain a glossary and a tone guide, and schedule a culturalization review per market alongside the rating and payment requirements. The reviews belong before content lock, not after.`,
      follow:`One market requires a content change to be rated at all. How do you decide?`,
      red:`Schedules translation as a phase at the end and treats layout as a localization vendor problem.` },
    { q:`A market cannot launch because of a rating requirement discovered late. Walk me through it.`,
      a:`Establish exactly what the requirement is rather than the summary of it, then find the cheapest compliant change and cost its design implications. Weigh that against what the market is worth. If the change breaks something central, be explicit that the honest options are a separate build or not launching there.`,
      follow:`The compliant change breaks a core mechanic. What do you recommend?`,
      red:`Assumes the requirement can be negotiated or worked around at submission.` }
  ] });

T('ethics-and-responsibility',{ d:'product', t:'Ethics and responsibility', tag:'Dark patterns, compulsion and data are design decisions. Make them on purpose, or make them by accident.',
  what:`The ethical constraints a design chooses: monetization that respects the player, engagement versus compulsion, gambling-like mechanics, data and privacy, representation, and honest claims. Treat these as constraints in the same family as scope or platform, applied early rather than reviewed at the end.`,
  why:[`The same loop that retains can manipulate, and the difference is whether the player would endorse it knowing the design.`,`Player trust is a long-term asset and a short-term temptation.`,`Regulation and platform rules keep moving, so designing late means costly rework.`],
  think:{ q:[`Would the player consent to this design if they could see it?`,`Does this pressure the player or inform them?`,`Does it respect their time, money and data?`,`Who is excluded or stereotyped by the defaults?`,`Does the store promise match what the game does?`],
    trade:[`Respectful design can earn less per player and more trust.`,`Aggressive design can earn more now and cost the audience later.`],
    traps:[`Fear of missing out used as the retention engine.`,`Reward mechanics that blur their own value.`,`Pay to skip a problem the design created.`,`Opaque data use.`,`Default characters who quietly exclude.`],
    good:[`The model is explainable and the player would accept it.`,`The values sit next to the pillars.`],
    bad:[`The game is easier to describe as a habit than as an experience.`] },
  how:[`Write the design values next to the pillars.`,`Review the monetization loop for pressure rather than value.`,`Make odds and data use explicit.`,`Watch the target player for discomfort in a test.`,`Revisit before launch and at each update.`],
  ai:{ yes:[`Stress-test a loop for manipulative patterns.`,`Draft clear disclosure copy.`,`Review content and defaults for representation gaps.`,`Flag regulation risk as a starting point.`],
       no:[`Decide the ethical line.`,`Claim legal compliance.`] },
  prompts:[{l:'Ethics stress test',p:`Here is our loop, monetization and data flow: [CONTEXT]. Identify where the design pressures rather than informs, where a player might feel misled or ashamed, and where the defaults exclude or stereotype. For each, propose the smallest change that keeps the experience and removes the pressure.`}],
  verify:[`Can the model be explained to a player without embarrassment?`,`Are odds and data use disclosed?`,`Were the defaults reviewed for representation?`],
  test:[`Describe the loop to a matched player without defending it. Note hesitation, discomfort or a sense of being tricked.`],
  rel:[['business-model','The model is where most ethical pressure is designed in.'],['player-motivation','Compulsion and intrinsic motivation pull in opposite directions.'],['return-and-quit','Players eventually leave the loop they do not endorse.'],['design-pillars','Values belong beside the pillars, not in a review at the end.'],['ai-disclosure-policy','Telling players what AI made is an honesty duty with store and legal rules behind it.']] });
TECH('ethics-and-responsibility',[
  {n:'Consent test', how:`Ask whether the player would endorse the design if they could see it.`, fit:`Reviewing monetization and engagement loops.`, cost:`Kills some profitable ideas.`, alt:`A written values statement beside the design pillars.`},
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
    map:`Godot's HTTPRequest client behind a user:// consent flag is Unity's analytics service gated on StartDataCollection.` },
  unity:{ term:`The service is initialised early so the consent screen can show, but collection is a separate call. Nothing is gathered until the player says yes, and a no is followed by a deletion request rather than silence.`,
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
    map:`Unity's analytics service gated on StartDataCollection is Godot's HTTP client gated on a user:// consent flag.` },
  note:`The consent answer is not only a client setting. It has to reach the server that stores the events and the one that can delete them, which is why the client keeps a local flag and the account keeps the authoritative one. A build that drops events locally while the server still holds last week's is compliant in the UI and not in fact.` });
INTERVIEW('ethics-and-responsibility',{
  junior:[
    { q:`What is a dark pattern in a game, concretely?`,
      a:`A design that pressures rather than informs: an expiring offer engineered to rush a decision, a purchase that relieves pain the design manufactured, odds the player cannot see, a currency layer that hides what something costs. The common thread is that the player would object if they could see the design.`,
      follow:`Name one you have met as a player and what it did to your trust.`,
      red:`Defines it as anything that makes money.` },
    { q:`What is the consent test?`,
      a:`Ask whether the player would endorse this design if they could see it from the inside. It converts an argument about intentions into a question about the player's view, which is checkable. Where you would be embarrassed to explain the mechanism, that is the finding.`,
      follow:`How would you actually check that with players?`,
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
      a:`Look at who the default character, the default voice and the default assumptions exclude, and at where a shorthand has become a stereotype. Do it while the content is being made, because it is a design question and not a compliance pass. Bring people who are not in the room's majority into the review.`,
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
  { claim:`Apple's App Store Review Guidelines (3.1.1) require apps that sell loot boxes or other randomised virtual items to disclose the odds of receiving each type of item before purchase, a rule in place since December 2017.`, asOf:'2026-09-23', src:'https://developer.apple.com/app-store/review/guidelines/' },
  { claim:`Google Play has required games that sell randomised virtual items to disclose the odds before purchase since May 2019.`, asOf:'2026-09-23', src:'https://www.gamedeveloper.com/business/games-on-the-google-play-store-now-required-to-disclose-loot-box-odds' },
  { claim:`Since April 2020 the ESRB adds the notice "In-Game Purchases (Includes Random Items)" to games that sell randomised items for real money.`, asOf:'2026-09-23', src:'https://www.esrb.org/blog/in-game-purchases-includes-random-items/' },
  { claim:`In January 2025 Genshin Impact's developer, Cognosphere, agreed to pay $20 million to settle FTC charges; the order bans selling loot boxes to players under 16 in the US without a parent's consent.`, asOf:'2026-09-23', src:'https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental' },
  { claim:`The FTC's amended COPPA Rule, published on 22 April 2025, requires full compliance from 22 April 2026: separate parental consent before a child's data is disclosed to third parties such as advertisers, and biometric identifiers now count as personal information.`, asOf:'2026-09-23', src:'https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule' }
]);
