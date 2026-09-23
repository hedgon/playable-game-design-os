/* =====================================================================
   INFRASTRUCTURE
   Where the code runs and how it gets there: containers, deploy models, CI
   pipelines, artifacts, secrets, asset delivery, data stores and the
   monitoring that tells you any of it is working. Same 8-part topic
   structure as every other domain, plus eng and iv.

   Topics, each followed by its ENGINE and INTERVIEW:
     infra-containers          Containers and compose-based dev environments
     infra-deploy-models       Deploy models: processes on VMs, Kubernetes, serverless, cron
     infra-ci-pipelines        CI pipelines: stages, gating, retries, graded failure
     infra-artifacts-provenance Artifacts, versioning and provenance
     infra-secrets             Secrets management
     infra-cdn-assets          CDN and asset delivery
     infra-data-stores         Managed databases, replicas, sharding, queues
     infra-monitoring          Monitoring, alerting, incidents and cost
   ===================================================================== */
DOMAINS.push({ id:'infra', t:'Infrastructure', short:'Containers, deploys, CI, artifacts, secrets, delivery, monitoring', color:'var(--d-infra)',
  sum:`The machinery that turns a commit into something players can reach, and tells you when it stops working. Infrastructure is mostly about reversibility: how fast can you ship, how fast can you undo, and how quickly do you find out you needed to.`,
  links:[['backend','Infrastructure is the shape the service is deployed in. The two constrain each other constantly.'],['production','Deploy cadence and build health are production facts before they are technical ones.'],['content','Asset delivery decides how much content can ship after launch and how fast a fix reaches a player.'],['studio','Who can deploy, who is paged, and what is written down are studio decisions expressed in tooling.']],
  titles:{ test:'What should I test or measure?' } });

/* Engine tabs: client-side counterparts. The infrastructure decisions are
   backend decisions, and each one reaches the player through the engine
   build. These tabs show where. Godot 4.x and Unity 6 / 2022 LTS. */

T('infra-containers',{ d:'infra', t:'Containers and dev environments', tag:'Pin the toolchain in an image and the "works on my machine" class of bug disappears. The dev stack and the CI stack should be the same description.',
  what:`A container image pins the language toolchain, the OS packages and the service versions so the same build runs on a laptop, on a build agent and in production. A compose file wires the application container to the databases, caches and queues it needs on a private network, with the source bind-mounted so you edit on the host and compile inside. The same service images are what CI starts as ephemeral containers for its integration stage.`,
  why:[`A new engineer goes from clone to a running stack in one command instead of a day of setup, and the command is reviewable.`,`Version drift between a laptop and a build agent produces failures that only reproduce on one machine. Pinning removes the whole category.`,`If CI runs the same service images, integration tests hit a real database and a real cache instead of mocks that agree with the code.`,`The image is also a unit of deploy, so the difference between development and production becomes a diff in a file rather than folklore.`],
  think:{ q:[`What is actually pinned: the toolchain, the database minor version, the cache, the OS packages? Anything unpinned will move.`,`Which services does a developer genuinely need running, and which can be a stub?`,`Where does state live: a named volume, a bind mount, or nowhere on purpose?`,`Is the source bind-mounted for edit speed, or copied in for reproducibility? You cannot have both.`,`Is the development image the deploy image, or two things that will drift?`,`What does a cold start cost on a new machine, and how often does someone pay it?`],
    trade:[`Bind-mounted source iterates fast and leaks host file modes and line endings into the build. Copy-in is clean and makes every edit a rebuild.`,`One image for development and production removes drift and drags editors and clients into production. A slim runtime image is small and needs a separate build stage.`],
    traps:[`No pinned base tag. Packages resolved at build time mean the image you built last month cannot be rebuilt.`,`Database state in an anonymous volume, so a routine teardown destroys the only copy of the seeded data.`,`A compose file that only works on one CPU architecture, so half the team builds by hand and quietly diverges.`,`Seeding that lives in a shell history rather than an init script the database image runs on first start.`,`Running the toolchain on the host just for one command. That is where the divergence starts.`,`Sharing one database container between the development stack and the test run, so a failing test leaves state that passes the next one.`],
    good:[`A clean clone reaches a running stack with one documented command, on a machine that has never seen the project.`,`The CI integration job and the local stack are described by the same service definitions.`],
    bad:[`Setup is a wiki page with twelve steps and three notes saying to ask a colleague.`,`The suite passes locally and fails in CI because of a database minor version.`] },
  how:[`Pin the base image by tag and digest. Pin the database, cache and queue images the same way.`,`One service per container, one user-defined network, explicit ports. No host networking.`,`Put seed data in the init directory the database image runs on first start, so a fresh volume reproduces the state without a manual step.`,`Bind-mount the source for edit speed and keep build output inside the container so host and container artefacts cannot collide.`,`Persist database and cache state in named volumes, and document the command that resets them deliberately.`,`Template whatever differs per machine (CPU architecture, user id, developer identity) in a small committed setup script rather than in instructions.`,`Make CI start the same service images. An integration job that creates every schema from scratch on each push is the strongest guard against migration drift.`,`Keep a separate slim deploy image if the development image carries editors, database clients and debuggers.`],
  ai:{ yes:[`Draft a Dockerfile and compose file from a list of services and pinned versions.`,`Explain why a container fails to start from its logs and the compose definition.`,`Convert a manual setup checklist into an init script that runs from a clean clone.`,`Review a Dockerfile for unpinned versions, layer-cache mistakes and secrets baked into a layer.`],
       no:[`Choose the production runtime. That decision is owned by whoever is on call for it.`,`Pick versions without checking what the services actually run today.`,`Be trusted with a generated compose file that has never been run from a clean clone.`] },
  prompts:[{l:'Compose the dev stack',p:`Act as an infrastructure engineer. Our service needs: [LIST SERVICES AND EXACT VERSIONS]. Developers work on [OS/ARCH LIST]. Draft a Dockerfile and a compose definition where every image is pinned by tag and digest, state lives in named volumes, seed data runs from an init directory, and source is bind-mounted for edit speed. List every value that must come from a secret store instead of the file. Then list what would break on the architectures I named.`},
    {l:'Dockerfile review',p:`Review this Dockerfile and compose file for: unpinned versions, layers that invalidate the cache unnecessarily, secrets baked into a layer that a later layer deletes, state in anonymous volumes, and anything that only works on one CPU architecture. [PASTE]. For each finding give the line, why it matters and the smallest fix. Do not rewrite the whole file.`}],
  verify:[`Did every image keep a pinned tag, or did a floating latest tag come back?`,`Does the generated setup actually work from a clean clone on a machine that has never seen the project?`,`Are credentials sitting in the file itself, and where should they be referenced from instead?`],
  test:[`Time a clean clone to a running stack on a machine with nothing installed. That number is your onboarding cost and it is worth tracking.`,`Delete every volume and bring the stack up. If the seed does not reproduce, the seed is not in the repository.`,`Run the integration suite in the container and on a CI agent. The results must match, and any difference is drift you have not pinned.`],
  tech:[
    {n:'Compose-based local stack', how:`One compose file defines the application container plus the databases, caches and queues, on a private network with source bind-mounted.`, fit:`Small to medium teams with a handful of services and a database that fits on a laptop.`, cost:`Grows unwieldy past about a dozen services. Resource hungry on laptops. Architecture differences need templating.`, alt:`A shared remote development environment when the data set no longer fits locally.`},
    {n:'Dev container definition', how:`The editor attaches to the container, so the toolchain, the formatter and the language server all run inside the pinned image.`, fit:`Teams losing time to toolchain differences, and projects with a heavy or unusual toolchain.`, cost:`Ties the workflow to editors that support it. File watching is slower on some hosts.`, alt:`Compose plus a documented toolchain install for people who want their own editor.`},
    {n:'Shared remote environment', how:`Each developer gets a namespace on shared infrastructure with real service dependencies and a seeded data set.`, fit:`Large data sets, services that cannot run on a laptop, or a stack with many components.`, cost:`Needs the network to work at all, costs money per developer, and one person can break a shared dependency.`, alt:`A local stack with a reduced data set and stubs for the heavy dependencies.`},
    {n:'Native install with pinned versions', how:`No container. A version manager pins the toolchain and the services are installed on the host.`, fit:`Single-service projects, engine work that needs GPU access, and platforms where containers are awkward.`, cost:`Drift returns the moment one person upgrades. CI cannot share the definition.`, alt:`Containerise the services and keep only the engine or toolchain native.`}],
  rel:[['quality-and-build-health','A reproducible stack is the precondition for a build anyone can test.'],['team-and-collaboration','Onboarding time is a team cost, and the setup script is the fix.'],['infra-ci-pipelines','CI should start the same service images the dev stack does.'],['infra-deploy-models','The image is both the dev environment and the unit of deploy.'],['backend-migrations-config','Creating every schema from scratch on each push is what catches migration drift.']] });
ENGINE('infra-containers',{
  godot:{ term:`The reproducible build environment is an image holding one exact engine binary plus the matching export templates. Godot ships as a single executable, so the image is small and the version is the whole contract.`,
    api:['godot --headless --path <project>','godot --headless --script res://ci/*.gd','Engine.get_version_info()','OS.get_environment()','SceneTree.quit(exit_code)','FileAccess.file_exists()'],
    snippet:`extends SceneTree
# godot --headless --script res://ci/verify_env.gd

func _init() -> void:
\tvar v := Engine.get_version_info()
\tvar got := "%d.%d.%d" % [v.major, v.minor, v.patch]
\tvar want := OS.get_environment("GODOT_PINNED")   # set by the image
\tif want != "" and want != got:
\t\tpush_error("image runs %s, project needs %s" % [got, want])
\t\tquit(1)
\t\treturn
\tprint("engine ", got, " ok")
\tquit(0)`,
    pitfall:`Bind-mounting the project into the container while a host editor is also open on it. Both write the .godot import cache, which is machine specific and large. The two writers thrash it, every headless run reimports the whole project, and a two minute export becomes twenty. Give the container its own volume for .godot and keep it out of the shared mount.`,
    map:`Godot export templates baked into the image are Unity platform modules baked into the image.` },
  unity:{ term:`The image carries one Editor version plus the platform modules, and the Editor must activate a licence at container start. Builds run in batch mode with no graphics device, driven by a static method.`,
    api:['-batchmode -nographics -projectPath','-executeMethod <Class>.<Method>','Application.unityVersion','EditorApplication.Exit(int)','BuildTarget / BuildTargetGroup','ProjectSettings/ProjectVersion.txt'],
    snippet:`static class CiEnv {                 // -executeMethod CiEnv.Check
    public static void Check() {
        var want = System.Environment.GetEnvironmentVariable("UNITY_PINNED");
        if (!string.IsNullOrEmpty(want) && Application.unityVersion != want) {
            Debug.LogError("image has " + Application.unityVersion +
                           ", ProjectVersion.txt needs " + want);
            EditorApplication.Exit(2);      // never let a mismatch build
            return;
        }
        Debug.Log("editor " + Application.unityVersion + " ok");
        EditorApplication.Exit(0);
    }
}`,
    pitfall:`Letting the container and a host Editor share one Library folder over a bind mount. Library is version and machine specific, and two writers corrupt the artifact database. The symptom is a full reimport on every run, which turns a five minute job into an hour, and occasionally a build made from half-imported assets. Mount Library as a container-owned volume.`,
    map:`Unity's -batchmode -executeMethod entry point is Godot's --headless --script.` },
  note:`Containers are a backend practice, and a game client is the hardest thing to put in one: the engine is the build tool, it is licensed, it is tens of gigabytes with platform modules, and its import cache is both huge and machine specific. The principle survives unchanged. Pin the engine version in the image, keep the per-machine caches out of the shared mount, and let CI use the same image a developer would.` });
INTERVIEW('infra-containers',{
  junior:[
    { q:`Why do we run the database in a container instead of installing it on the machine?`,
      a:`Because the version becomes part of the repository. The image tag pins the minor version, so every laptop and every build agent runs the same engine and the same defaults. Say what an unpinned database costs: a query that works locally and fails in CI on a collation or a strict mode default. Then mention the second benefit, which is that tearing it down and starting clean is one command.`,
      follow:`What exactly is pinned by the tag you wrote, and what still floats?`,
      red:`Answers that containers are lighter than virtual machines and never connects it to reproducibility.` },
    { q:`What is the difference between a bind mount and a named volume, and which one holds your database data?`,
      a:`A bind mount maps a host path into the container, so the host owns the files and their permissions. A named volume is managed by the container runtime and outlives the container. Source goes in a bind mount so you can edit it with your own editor. Database data goes in a named volume so a rebuild does not destroy it and a deliberate reset is one flag.`,
      follow:`What happens to your seeded data when you run the teardown command with the volume flag?`,
      red:`Does not know where the data actually lives, or says it does not matter because it is only development data.` },
    { q:`A colleague says the tests pass locally and fail in CI. Where do you look first?`,
      a:`Difference in the environment, not in the code. Compare the service images and versions, the environment variables, the state the local stack has accumulated, and whether CI starts from an empty database while your local one has been running for a month. The most common cause is state your machine has and the agent does not.`,
      follow:`How would you make that class of failure impossible rather than debuggable?`,
      red:`Blames CI flakiness and re-runs the job.` }
  ],
  mid:[
    { q:`Walk me through what happens on a new hire's first morning with your setup.`,
      a:`Clone, run one command, get a running stack with seeded data. Describe what that command actually does: templating anything machine specific, pulling pinned images, creating volumes, running the init seed. Then give the real number you measured, and name the step that is still manual and why.`,
      follow:`What is the longest that first command has ever taken, and what dominates it?`,
      red:`Describes a wiki page, or has never watched a new person do it.` },
    { q:`How do you stop the development image and the production image from drifting apart?`,
      a:`Either they are the same image, or they share a base and the difference is one stage. Say which you chose. If they differ, name what the development image has that production must not, and name the check that catches drift. A multi-stage build where production is the slim final stage is the usual answer.`,
      follow:`Your development image has a database client and a debugger in it. Is that in production, and if not, how do you know?`,
      red:`Says they are the same without having checked, or has no idea what is in the production image.` },
    { q:`Half the team is on a different CPU architecture and the stack only builds on one. How do you fix it?`,
      a:`Find out whether the problem is the base image, a compiled dependency or a vendor binary. Multi-architecture base images fix most of it. Where a tool genuinely has no build for that architecture, template that part of the Dockerfile from a setup script so the difference is committed rather than improvised. Say what you would not do, which is let half the team build on the host.`,
      follow:`What does emulation cost you, and when would you accept it?`,
      red:`Tells the affected half to run it natively, which reintroduces exactly the drift containers removed.` }
  ],
  senior:[
    { q:`Your data set no longer fits on a laptop. What changes?`,
      a:`Separate two things: the schema and the volume. A reduced seed that exercises every code path locally, plus a shared remote environment for work that genuinely needs production-scale data. Say what you lose with a shared environment, which is isolation, and how you namespace per developer to get most of it back. Name the moment you would make the call rather than guessing.`,
      follow:`How do you keep the reduced seed honest, so a bug that only appears at scale is still findable?`,
      red:`Jumps straight to a remote environment for everyone without costing it or naming what breaks offline.` },
    { q:`How do you decide the local stack and the CI integration stage are actually the same thing?`,
      a:`Make them share the definition rather than resemble each other. CI starts the same images from the same file, creates the schemas from scratch and runs every migration on each push. Then the evidence is behavioural: a failure reproduces in both, or you have found the drift. Say how you verify it, not that you intend it.`,
      follow:`A migration passes locally and fails in CI. What does that tell you about your local database, and what do you change permanently?`,
      red:`Claims parity because both use containers, with no shared definition and no test that would catch divergence.` }
  ] });

T('infra-deploy-models',{ d:'infra', t:'Deploy models and scheduled work', tag:'Processes on a VM, containers on a scheduler, functions per request, jobs on a clock. Pick by what the workload holds, not by what is fashionable.',
  what:`The shapes a service can run in. A supervised process on a virtual machine. A container scheduled by Kubernetes. A function invoked per request. A batch binary run by cron or a scheduled job. Most game backends use several at once: stateless request servers, a realtime server that holds connections and memory, and a fleet of batch jobs on a clock. Each shape has its own answer to rollout, rollback, health and drain.`,
  why:[`The deploy model decides how you roll back, and rollback speed is the real safety net. Everything else is prevention.`,`It defines what unhealthy means and who finds out. A process supervisor restarts, a scheduler reschedules, a function simply fails.`,`A stateful realtime server cannot be rolled like a stateless one. Stopping a process that holds thousands of sockets is a design problem, not a configuration setting.`,`Batch jobs are where currency, mail and rankings move. Their schedule and their recovery semantics are part of the game design, not an operational detail.`],
  think:{ q:[`Is this workload stateless per request, or does it hold connections and memory between them?`,`What happens to an in-flight request, or an in-flight match, when the process is asked to stop?`,`How does a new version roll out, and what is the exact command that puts the old one back?`,`Which jobs run on a clock? What happens if one is skipped, and what happens if one runs twice?`,`Does the team have the skill to operate this model at three in the morning, or only to set it up?`,`What is the simplest model that meets the availability this game actually needs?`],
    trade:[`Processes on VMs are easy to reason about and manual to scale. A scheduler automates placement and rollout and adds a system the team must also operate.`,`Serverless removes capacity planning and adds cold starts, execution limits and a per-invocation cost curve that surprises at scale.`],
    traps:[`Choosing a cluster for three services because it is the default answer, then spending the first month operating the cluster instead of building the game.`,`Treating a realtime server as stateless and rolling it like one, dropping players mid-match on every deploy.`,`A scheduled job with no idempotency, so one retry pays a reward twice.`,`Batch binaries with no documented schedule, so nobody knows which are cron-driven and which are manual recovery tools.`,`A rollback plan that is only redeploy the previous commit, in a system where the migration has already run.`,`Two jobs writing the same rows in the same minute, because nobody drew the schedule on one page.`],
    good:[`Rollback is one command and more than one person has run it this quarter.`,`Every batch binary documents its schedule and whether running it again is safe.`],
    bad:[`Only one person can deploy, and they are on holiday.`,`The last rollback took longer than the outage it was fixing.`] },
  how:[`Classify each workload first: stateless request, stateful session, scheduled batch, event consumer. The classification picks the model.`,`Start with the simplest model that meets the availability the game needs. One process per role on a supervised machine is a legitimate production answer for a long time.`,`Write the drain behaviour before the scale-up behaviour. A stateful server needs a stop that refuses new sessions and waits for the existing ones.`,`Make every batch job idempotent against a run key. Then a retry is free and a double schedule is harmless.`,`Separate the migration step from the application rollout so the two can be rolled back independently.`,`Document each job's schedule and recovery semantics in the job's own source, next to the code that will be read during the incident.`,`Keep the deploy command, the rollback command and the health check in the same repository as the code they operate.`,`Draw every scheduled job on one timeline. Overlaps and shared tables are visible there and nowhere else.`],
  ai:{ yes:[`Draft manifests, unit files or job definitions from a description of the workload and its lifecycle.`,`Explain the failure modes of a rollout strategy you describe, including what happens to in-flight work.`,`Turn a list of batch jobs into a schedule table and raise the overlap and idempotency questions.`,`Review a shutdown path for the requests or sessions it would drop.`],
       no:[`Decide the availability target. That is a product and budget decision.`,`Assert that a workload is stateless. Only reading the code tells you that.`,`Choose the model for you when the real constraint is who is on call and what they know.`] },
  prompts:[{l:'Workload classification',p:`Here are our services and jobs with what each one holds in memory and how long a unit of work lasts: [LIST]. Classify each as stateless request, stateful session, scheduled batch or event consumer. For each, state the deploy model you would choose, what happens to in-flight work on shutdown, the rollback path, and the health signal. Flag any that I have described as stateless but that clearly hold state.`},
    {l:'Batch schedule audit',p:`Here are our scheduled jobs with their cron expressions and the tables each one writes: [LIST]. Build a timeline of a 24 hour period. Identify overlapping jobs that touch the same tables, jobs with no idempotency key, and jobs whose skip or double-run behaviour I have not specified. For each, ask the one question I need to answer, and do not invent the answer.`}],
  verify:[`Did it assume stateless for a service that holds sockets or in-memory sessions?`,`Is there a rollback path, and does it survive a migration that has already run?`,`Does the schedule it produced have two jobs writing the same rows at the same minute?`],
  test:[`Kill a process under load and measure what a player actually sees. That is your real availability, not the dashboard.`,`Run the rollback in a staging environment with a stopwatch, and publish the number where the team can see it.`,`Run every batch job twice on purpose in staging. Anything that changes on the second run is not idempotent.`],
  tech:[
    {n:'Supervised processes on VMs', how:`One process per role on consecutive ports, started and stopped by a supervisor or a shell wrapper, each writing its own log file.`, fit:`Small fleets, stable capacity, teams without dedicated operations staff.`, cost:`Scaling and placement are manual. Machine failure is your problem. Configuration drift between machines is easy.`, alt:`A scheduler once the machine count exceeds what one person can hold in their head.`},
    {n:'Kubernetes', how:`Containers are declared as desired state. The scheduler places them, restarts failures, runs rolling updates and exposes them behind services.`, fit:`Many services, variable capacity, several teams deploying independently, workloads already containerised.`, cost:`A large system to learn and operate. Stateful and long-lived connection workloads need careful drain and disruption settings.`, alt:`A managed container service that hides the control plane, when you want rolling deploys without the cluster.`},
    {n:'Serverless functions', how:`Code is invoked per request or per event. The platform handles capacity and you pay per invocation and per unit of execution time.`, fit:`Spiky low-volume endpoints, webhooks, glue between services, event handlers.`, cost:`Cold starts, execution time limits, no long-lived connections, and a cost curve that crosses over a fixed fleet at moderate volume.`, alt:`A small always-on service when traffic is continuous rather than spiky.`},
    {n:'Scheduled jobs (cron or CronJob)', how:`A separate binary per job, started on a schedule, doing one bounded unit of work and exiting with a status code.`, fit:`Daily resets, ranking aggregation, mail delivery, expiry sweeps, report generation.`, cost:`Needs idempotency, overlap protection and a place where a failed run is visible. Silent failure is the default.`, alt:`A queue consumer when the work is event-driven rather than time-driven.`}],
  rel:[['live-operations','Deploy cadence and rollback speed are what live operations actually rest on.'],['risk-and-dependencies','The deploy model is a dependency you will have to operate under pressure.'],['infra-containers','The image built for development is the unit the scheduler places.'],['infra-monitoring','Health, drain and rollback only mean something if you can see them.'],['server-scaling','Stateful realtime servers are where the deploy model and the game design meet.']] });
ENGINE('infra-deploy-models',{
  godot:{ term:`The same project exports a dedicated server build with the dedicated_server feature tag. It runs headless, one process per room or region, supervised exactly like any other process.`,
    api:['OS.has_feature("dedicated_server")','ENetMultiplayerPeer.create_server()','SceneTree.multiplayer / MultiplayerAPI','multiplayer.peer_disconnected','Engine.max_fps','SceneTree.quit(exit_code)'],
    snippet:`extends Node                   # exported with the dedicated_server feature
@export var port := 7777

func _ready() -> void:
\tif not OS.has_feature("dedicated_server"): return
\tEngine.max_fps = 30                     # nothing vsyncs a headless build
\tvar peer := ENetMultiplayerPeer.new()
\tif peer.create_server(port, 64) != OK: get_tree().quit(1)
\tmultiplayer.multiplayer_peer = peer
\tmultiplayer.peer_disconnected.connect(_drain)

func _drain(_id: int) -> void:
\tif multiplayer.get_peers().is_empty():
\t\tget_tree().quit(0)     # exit when the last match ends, then be restarted`,
    pitfall:`Exporting the server from the client preset. Without the dedicated server feature the binary still initialises rendering and audio, so it refuses to start on a machine with no display server and loads textures nothing will ever draw. On a fleet that is memory and money spent on pixels nobody sees.`,
    map:`Godot's dedicated_server feature tag is Unity's Dedicated Server build subtarget.` },
  unity:{ term:`The Dedicated Server build subtarget produces a headless player from the same project. It is a build target, not a define, and it strips the graphics pipeline rather than merely disabling it.`,
    api:['NamedBuildTarget.Server / StandaloneBuildSubtarget.Server','Application.targetFrameRate','Application.Quit(int)','NetworkManager.StartServer()','UnityTransport.SetConnectionData()','SystemInfo.graphicsDeviceType'],
    snippet:`public class ServerBoot : MonoBehaviour {      // Dedicated Server subtarget
    [SerializeField] ushort port = 7777;
    void Start() {
        Application.targetFrameRate = 30;         // headless has nothing to sync to
        var nm = NetworkManager.Singleton;
        nm.GetComponent<UnityTransport>().SetConnectionData("0.0.0.0", port);
        if (!nm.StartServer()) Application.Quit(1);
        nm.OnClientDisconnectCallback += _ => Drain();
    }
    void Drain() {
        if (NetworkManager.Singleton.ConnectedClientsIds.Count == 0)
            Application.Quit(0);                  // drain, then let the supervisor act
    }
}`,
    pitfall:`Leaving Application.targetFrameRate at the default in a headless player. With no display to pace it, the main loop runs as fast as the core allows. One idle room burns a whole CPU, the scheduler sees a hot node and spreads fewer rooms per machine, and the fleet costs several times what the game needs.`,
    map:`Unity's Application.Quit(code) after a drain is Godot's SceneTree.quit(code).` },
  note:`Choosing between VM processes, a scheduler, functions and cron jobs is a backend decision, and the dedicated server build is where it lands in the engine. The build must start fast, tick at a rate you chose rather than one the hardware picked, and exit cleanly when the last player leaves, because every deploy model above it assumes a process that can be stopped.` });
INTERVIEW('infra-deploy-models',{
  junior:[
    { q:`What is the difference between a stateless service and a stateful one, in deployment terms?`,
      a:`A stateless service holds nothing between requests, so any instance can serve any request and you can stop one at any moment after it finishes the current request. A stateful one holds sessions, connections or memory, so stopping it destroys something a player was using. Give a concrete example of each from a game backend: a profile endpoint against a match server.`,
      follow:`Your login service caches a session in process memory. Which is it now?`,
      red:`Calls a service stateless because it has no database, or because it was described that way in a diagram.` },
    { q:`What does a health check actually check, and what should it not check?`,
      a:`It should say whether this instance can serve traffic right now. Include its own readiness and the dependencies it cannot work without. Exclude things it can degrade past, because a health check that fails when an unrelated third party is slow will take your whole fleet out of rotation. Distinguish liveness from readiness.`,
      follow:`Your health check queries the database. The database gets slow. What does the fleet do?`,
      red:`Returns 200 unconditionally, or checks everything the service can reach.` },
    { q:`A cron job did not run last night. What are the first three things you check?`,
      a:`Whether it was scheduled and skipped, whether it ran and failed, and whether it ran twice. Then look at where a failure would have been visible, which is usually nowhere, and say so. Mention that the interesting answer is what the system does about a missed run: catch up, skip, or wait for a human.`,
      follow:`It did run, and it ran twice. What is the damage?`,
      red:`Assumes silence means success.` }
  ],
  mid:[
    { q:`How do you deploy a new version of a server that holds live matches?`,
      a:`Stop accepting new sessions on the old instances, start new instances for new sessions, and let the old ones drain until their last match ends. Name the drain timeout and what happens when it expires. Say what the player sees in the worst case and whether you tell them. The wrong answer is a rolling restart on a fixed interval.`,
      follow:`One instance has a match that will run for another forty minutes. Now what?`,
      red:`Describes a rolling update with no drain and does not mention what happens to in-flight matches.` },
    { q:`Someone proposes moving the whole backend to Kubernetes. How do you evaluate that?`,
      a:`Ask what problem it solves that is currently costing you: placement, rollout, autoscaling, multi-team independence. Then cost the operation honestly, including who is on call for the cluster. Name the workloads that will not fit cleanly, which is usually the realtime servers and the scheduled batch work. Propose a smaller step that tests the premise.`,
      follow:`You move the stateless services and leave the match servers on VMs. What is now harder?`,
      red:`Argues from popularity, or refuses on principle without naming the current pain.` },
    { q:`How do you make a batch job safe to run twice?`,
      a:`Give it a run key derived from the period it processes, record that key when the work commits, and make the write conditional on the key not existing. Then a duplicate run is a no-op and a retry is free. Say where the key lives, in the same transaction as the effect, otherwise the guarantee is fiction.`,
      follow:`The job pays out currency and sends mail. The mail service is external. How do you keep that idempotent?`,
      red:`Says the scheduler guarantees a single run, which is not true of any scheduler under failure.` }
  ],
  senior:[
    { q:`Your rollback took longer than the outage. Tell me how you would fix that.`,
      a:`Measure it first: rehearse the rollback in staging with a stopwatch and publish the number. Then attack the longest step, which is usually the migration coupling. Separate schema changes from application rollout so the binary can go back without the schema going back. Make the rollback one command that more than one person has run. Name who is allowed to make the call without asking.`,
      follow:`A migration dropped a column two deploys ago. What does rollback mean now, and how do you avoid ever being here?`,
      red:`Proposes more testing so a rollback is never needed, instead of making rollback fast.` },
    { q:`How do you choose between a cluster, plain VMs and serverless for a new game backend?`,
      a:`Start from the workloads and the team, not the platform. Classify what you have: stateless request handlers, stateful realtime, scheduled batch, event consumers. Then apply two constraints, the availability the game actually needs and who will be on call at three in the morning. Argue for the simplest model that clears both, and name the signal that would make you change later.`,
      follow:`What would have to be true in six months for you to regret this choice, and what are you doing now to keep the option open?`,
      red:`Gives a single answer for every workload, or picks the platform before describing the workloads.` }
  ] });

T('infra-ci-pipelines',{ d:'infra', t:'CI pipelines and gating', tag:'The pipeline turns a push into a verdict. Gate stages on the event, retry only the network, and check the verdict two ways.',
  what:`The automation that turns a push into a pass or a fail. Stages run in order: lint, unit tests, an integration stage that creates the databases from scratch and runs every migration, a build, and on some events an end-to-end suite against the running binary. Each stage is gated on the event (a pull request behaves differently from a push to the integration branch), each has a timeout, each network-touching step has a retry policy, and each has an explicit rule for what counts as failure.`,
  why:[`CI is the only place where it works is checked on a machine nobody has customised.`,`A pipeline that creates every schema from zero and runs every migration on each push catches migration drift before a deploy rather than during one.`,`A flaky pipeline trains the team to re-run until green. That habit costs more than the flakes, because it also survives a real intermittent bug.`,`Some build tools lie. A game engine can print a fatal error and exit zero. Detecting failure by exit code and by a curated list of fatal log lines catches what one check alone misses.`],
  think:{ q:[`What runs on a pull request, what runs on a push, and why are they different?`,`Which steps touch a network you do not control, and do they retry with backoff?`,`Does a failing step actually fail the stage, or does a wrapper swallow the exit code?`,`What is the timeout, and what is the longest legitimate run you have measured?`,`Is the pipeline itself tested? A job table, a path resolver and a config map are code.`,`What does red mean socially: stop the line, or open a ticket for later?`],
    trade:[`A long thorough pipeline on every push catches more and lengthens the feedback loop. A fast pipeline plus a nightly deep run is quicker and lets a class of failure live for a day.`,`Retries hide transient infrastructure noise and also hide a genuine intermittent bug. Retry the network step, never the test.`],
    traps:[`Retrying tests until they go green. That is not a fix, it is a filter that removes your only evidence.`,`A wrapper around a native command that loses the exit code, so a failing signing or upload step reports success.`,`Detecting an engine build failure by log pattern only, so a new error message ships a broken artefact.`,`Eight near-identical jobs, one per target, drifting apart over a year. Collapse them into one pipeline driven by a spec table keyed on the job name.`,`No negative control. A check that has never been shown to fail is not known to work.`,`Long-lived agents with shared mutable workspaces, where one job's leftover state makes the next job pass.`],
    good:[`Red blocks the merge and nobody argues about it.`,`The pipeline configuration has its own tests, including one that feeds it a deliberately corrupted table and expects a failure.`],
    bad:[`People know which tests to re-run.`,`Green on CI, broken on the device.`] },
  how:[`Gate stages on the event. Lint and unit tests on every pull request. The full integration and end-to-end stage on push to the integration branch.`,`Start service dependencies as ephemeral containers in the pipeline, using the same images the development stack uses.`,`Create the schemas from scratch, run every migration, seed master data, boot the server, then run the end-to-end suite. Anything less lets migration drift through.`,`Wrap every native command so a non-zero exit fails the stage, and prove the wrapper works with a command known to fail.`,`Retry with backoff only on steps that touch a network you do not own. Never on a test.`,`For tools with unreliable exit codes, check both the exit code and a curated list of fatal log patterns.`,`Collapse near-identical jobs into one pipeline driven by a table keyed on the job name, and write a test asserting the table matches what the CI server actually has.`,`Give every pipeline a timeout and a failure notification that names the commit, the stage and the first real error line.`],
  ai:{ yes:[`Translate a pipeline from one CI system to another and list what does not carry across.`,`Read a long failing log and name the first real error in it.`,`Draft a spec table that collapses several similar jobs into one pipeline.`,`Write the negative control for a configuration test.`],
       no:[`Decide what blocks a merge. That is a team policy, not a technical one.`,`Be trusted on a CI product's exact syntax without checking the version you run.`,`Add a retry to make a failing test pass.`] },
  prompts:[{l:'Pipeline design',p:`Act as a build engineer. Our stack is [LANGUAGES, SERVICES, TEST TIERS] and our CI system is [SYSTEM]. Design a pipeline with stages gated by event (pull request versus push to the integration branch). For each stage give: the trigger, the services it needs, the timeout, whether it retries and why, and the exact condition that makes it fail. Mark every step that touches an external network. Do not add a retry to any test step.`},
    {l:'Failing log triage',p:`Here is a CI log from a failed [STAGE]: [PASTE TAIL]. Find the first line that is a real error rather than a consequence, explain what it means, and give the two most likely causes with the smallest check for each. If the log shows a step that printed an error but exited zero, say so explicitly.`}],
  verify:[`Did it add a retry around something that is not a network call?`,`Does every native command it wrote propagate its exit code to the stage?`,`Are the credentials it referenced coming from the credential store, or pasted into the file?`],
  test:[`Break something on purpose and push. The pipeline must go red, at the stage you expect, with a message that names the cause.`,`Feed the configuration test a corrupted table. If it still passes, the test proves nothing.`,`Measure the median and the worst pull-request pipeline time over a month. People plan around the worst, not the median.`],
  tech:[
    {n:'Hosted CI with YAML workflows', how:`Workflows live in the repository, triggered by repository events, running on ephemeral hosted runners with a marketplace of prebuilt steps.`, fit:`Open toolchains, teams that want zero CI infrastructure, projects whose builds fit in the hosted time and disk limits.`, cost:`Cold runners mean no warm cache. Large engine builds and licensed toolchains fit badly. Minutes cost money at scale.`, alt:`Self-hosted runners on the same system when builds are large but the workflow syntax suits you.`},
    {n:'Declarative pipelines on a self-hosted server', how:`Pipeline definitions live in the repository as scripts. Stages target agents by label, with whole-pipeline timeouts and per-stage conditions.`, fit:`Game clients: long builds, licensed engines, platform SDKs, signing material, warm workspaces on named machines.`, cost:`You operate the server and the agents. Plugin upgrades are a project. Agent state drifts unless it is rebuilt.`, alt:`Container-native CI when every step can run in an image.`},
    {n:'Container-native CI', how:`Every step is a container image with the workspace mounted through it, so the pipeline is reproducible and service dependencies are just more containers.`, fit:`Backends that are already containerised, integration stages that need a real database, cache and queue.`, cost:`Anything that cannot run in a container (a platform SDK, a signing tool, a GPU build) needs an escape hatch.`, alt:`Hosted CI with service containers when you do not want to run the CI server.`},
    {n:'Long-lived agents with warm caches', how:`Named agents keep their workspace between runs, with shallow clones, sparse checkout and cached dependency and import directories.`, fit:`Engine builds where a cold import or a cold package restore dominates the run time.`, cost:`State from a previous run can make a build pass or fail for reasons not in the commit. Needs a periodic forced clean.`, alt:`Ephemeral agents with an external cache, which is slower and honest.`}],
  rel:[['quality-and-build-health','A pipeline is the machine that keeps a build worth testing.'],['iteration-and-evidence','Fast honest feedback is what makes iteration possible at all.'],['infra-artifacts-provenance','The pipeline is where identity gets stamped onto what it produces.'],['backend-testing','The test tiers decide what each stage can actually run.'],['pm-qa-release','Release trains and build health are the same pipeline seen from the schedule.']] });
ENGINE('infra-ci-pipelines',{
  godot:{ term:`CI drives the editor binary headlessly. A gate script runs as a SceneTree and its exit code is the verdict, and the export runs as a second invocation against a named preset.`,
    api:['godot --headless --export-release "<preset>" <out>','godot --headless --script res://ci/gate.gd','DirAccess.get_files_at()','ResourceLoader.load()','push_error()','SceneTree.quit(exit_code)'],
    snippet:`extends SceneTree
# godot --headless --script res://ci/gate.gd   the exit code is the verdict

func _init() -> void:
\tvar failed := 0
\tfor f in DirAccess.get_files_at("res://scenes"):
\t\tif not f.ends_with(".tscn"): continue
\t\tif ResourceLoader.load("res://scenes/" + f) == null:
\t\t\tpush_error("scene will not load: " + f)
\t\t\tfailed += 1
\tprint("scenes checked, failures: ", failed)
\tquit(1 if failed > 0 else 0)`,
    pitfall:`Running the export on a fresh agent with a cold .godot import cache and counting the wait as build time. The first headless run imports every asset in the project, which can take longer than the export it precedes, and a clean agent pays it every single run. Warm the cache in its own cached step, and read the process exit code rather than grepping the log for the word error.`,
    map:`Godot's --headless --script gate is Unity's -batchmode -executeMethod.` },
  unity:{ term:`CI calls a static method in batch mode. BuildPipeline.BuildPlayer returns a BuildReport, and you turn that report into the exit code yourself rather than trusting the Editor to do it.`,
    api:['-batchmode -nographics -logFile -','-executeMethod <Class>.<Method>','BuildPipeline.BuildPlayer(BuildPlayerOptions)','BuildReport.summary.result / totalErrors','BuildOptions.StrictMode','EditorApplication.Exit(int)'],
    snippet:`public static class CiBuild {                 // -executeMethod CiBuild.Player
    public static void Player() {
        var opts = new BuildPlayerOptions {
            scenes = EditorBuildSettings.scenes.Where(s => s.enabled)
                                               .Select(s => s.path).ToArray(),
            target = BuildTarget.Android,
            locationPathName = "build/app.aab",
            options = BuildOptions.StrictMode
        };
        var s = BuildPipeline.BuildPlayer(opts).summary;
        Debug.Log("result " + s.result + " size " + s.totalSize);
        EditorApplication.Exit(s.result == BuildResult.Succeeded && s.totalErrors == 0 ? 0 : 1);
    }
}`,
    pitfall:`Relying on the -quit flag and the process exit code alone. A batch mode Editor can exit zero after a build that produced errors, and -quit can fire before an asynchronous step has finished. Call EditorApplication.Exit yourself with a code derived from BuildReport.summary, and keep a curated list of fatal log patterns as the second check.`,
    map:`Unity's BuildReport.summary.result is the verdict Godot gives you as a process exit code.` },
  note:`Everything in this topic holds for a client pipeline, with one extra rule. The engine is both the build tool and the thing most likely to lie about whether it succeeded. Gate stages on the event, retry only the steps that touch a network you do not own, and check the verdict two ways: the exit code and a curated list of fatal log lines.` });
INTERVIEW('infra-ci-pipelines',{
  junior:[
    { q:`What should run on a pull request, and what should run on a merge?`,
      a:`On a pull request: the fast checks that tell the author their change is wrong. Lint, unit tests, a build. On a merge to the integration branch: the expensive ones that need the full environment, including creating the schemas from scratch, running the migrations, booting the server and running the end-to-end suite. The split is about feedback latency against coverage, and you should be able to say which failures you have chosen to find later.`,
      follow:`Something only breaks in the merge stage. How long did it live on the branch, and does that change your split?`,
      red:`Runs everything everywhere with no reasoning, or runs nothing on pull requests.` },
    { q:`A test in CI fails about one run in ten. What do you do?`,
      a:`Treat it as a bug with a low reproduction rate, not as noise. Get the failing run's logs, look for shared state, ordering and time dependence, and try to reproduce it by running the test repeatedly or in a different order. If it cannot be fixed now, quarantine it explicitly so it is visible, rather than retrying it silently.`,
      follow:`Your team lead suggests wrapping it in a retry. What do you say?`,
      red:`Adds a retry, or re-runs the pipeline until it is green and moves on.` },
    { q:`A step in the pipeline printed an error and the stage went green. How is that possible?`,
      a:`The step's exit code did not reach the stage. Usually a wrapper script swallowed it, or the tool itself exits zero after printing a fatal error, which some build tools do. The fix is both: propagate exit codes through every wrapper, and for known liars also check the log for a curated list of fatal patterns.`,
      follow:`How do you prove your exit-code wrapper actually works?`,
      red:`Says it is impossible, or proposes grepping the log as the only check.` }
  ],
  mid:[
    { q:`We have eight nearly identical build jobs, one per platform, and they have drifted. How do you fix it?`,
      a:`Collapse them into one pipeline driven by a table keyed on the job name, with stages conditional on the target. Do the migration in a way that is provable: write a test that asserts the in-code table matches the values measured from the existing jobs before you delete them. Then add a negative control so you know the test can fail.`,
      follow:`What is a negative control here, and why does the test mean nothing without one?`,
      red:`Copies the eight jobs into eight templated files and calls it consolidation.` },
    { q:`Which steps in your pipeline are allowed to retry, and why?`,
      a:`Steps that touch a network you do not control: checkout, package restore, artefact upload, store upload. Those fail for reasons unrelated to the change and retrying with backoff is honest. Tests never retry, because a retry destroys the evidence that a real intermittent bug exists. Say where the line is and be able to defend a specific case.`,
      follow:`The end-to-end suite times out about once a week under load. Retry or investigate?`,
      red:`Retries whatever is currently annoying, with no rule.` },
    { q:`How does your pipeline catch a migration that works on your branch and breaks on the integration branch?`,
      a:`By building the database from nothing on every push: create every schema, run every migration in order, seed master data, then boot and run the suite against it. That catches ordering conflicts between two branches that both passed in isolation. Add the policy half too, which is keeping migration changes in their own change so they can be reverted separately.`,
      follow:`Two people merge migrations the same afternoon. What actually breaks, and where does your pipeline notice?`,
      red:`Runs migrations against a long-lived shared database that already has the state, so conflicts never appear.` }
  ],
  senior:[
    { q:`Your pull-request pipeline now takes 40 minutes and people have stopped waiting for it. What do you do?`,
      a:`Measure where the time goes before changing anything. Then move work by value: keep the checks that catch real defects on the pull request, move rare and slow coverage to a nightly or merge stage, parallelise what is independent, and cache what is deterministic. Say what you accepted in exchange, which is a class of failure found later. The wrong move is deleting tests until it is fast.`,
      follow:`What signal tells you the nightly stage is catching things the pull-request stage should have?`,
      red:`Speeds it up by removing coverage without naming what is now found later.` },
    { q:`How do you test the CI configuration itself?`,
      a:`Treat it as code. Unit test the pure parts: the job table, path resolution, target naming, tier selection. Assert the in-code configuration against what the CI server actually reports, so drift is a failure rather than a surprise. End with a negative control that feeds the checker a deliberately corrupted table and expects red, because a check that has never failed is not known to work.`,
      follow:`Someone changes the pipeline and the tests still pass. How confident are you, and what are those tests not covering?`,
      red:`Says the pipeline is tested by using it, which only tests the paths that already run.` }
  ] });

T('infra-artifacts-provenance',{ d:'infra', t:'Artifacts, versioning and provenance', tag:'The first question in any incident is which build this is. Stamp the answer in at build time, because you cannot add it later.',
  what:`An artefact is what the pipeline produces: a server binary, a player build, a container image, a set of asset bundles. Provenance is the record of where it came from: the version, the commit hash, the build date, the toolchain version, the job that made it, and the commits since the last successful build. On a compiled server that is injected at link time. In a game client it is a generated file inside the build plus a release note next to the artefact.`,
  why:[`The first question in any incident is which build this is. Without a stamped identity you are guessing, under time pressure.`,`A release note generated from the commit range since the last green build turns what changed from an archaeology task into a paste.`,`A stripped or ahead-of-time compiled crash report is unreadable without the symbols from that exact build, and those symbols usually stop existing when the agent workspace is cleaned.`,`An artefact you cannot rebuild from its recorded inputs is a one-off you must keep forever, and storage is the cheapest part of that problem.`],
  think:{ q:[`Can a running process state its version, commit and build time in a log line or on a health endpoint?`,`Does the player build show the same identity somewhere a tester can read and screenshot?`,`Where are the symbols for this build, and how long are they kept?`,`Does artefact retention match the time it takes for a crash to be reported and investigated?`,`Is the version a promise to other people, or an internal build counter? Those are different schemes.`,`Was the release note derived from the commit range, or typed from memory?`],
    trade:[`Stamping the build date makes the artefact non-reproducible byte for byte. Reproducible builds are harder and only pay off when someone actually verifies them.`,`Long retention makes any old crash investigable and costs storage that grows every single day.`],
    traps:[`A version read from a file a developer edits by hand, so it lags whatever actually shipped.`,`Symbols uploaded later, which means never.`,`A release note written from memory, which omits the change that caused the incident.`,`Two artefacts carrying the same version because a tag was reused or an output file was overwritten.`,`A client version and a server protocol version that drift with no compatibility rule between them.`,`No size series, so a content mistake is found at certification instead of in the build that caused it.`],
    good:[`Every build announces its identity in its first log line and on a debug screen.`,`The release note is generated from the commit range and nobody edits it.`],
    bad:[`The crash dashboard groups everything into one unreadable frame.`,`Nobody can say with confidence which commit is live.`] },
  how:[`Inject version, commit hash, build date and toolchain version at build time. In Go that is linker flags. In a client it is an asset written by a pre-build step.`,`Print the identity in the first log line and expose it on a health or debug endpoint.`,`Generate the release note from the commit range between this build and the last successful one, and include the job identifier, the repository and the branch.`,`Upload symbols in the same job that produced the binary, and fail the job when the upload fails.`,`Record artefact size per build and keep the series. A size jump is a content mistake found in minutes.`,`Give the artefact an immutable name containing the version and the build number. Never overwrite.`,`Set retention deliberately, long enough that the oldest crash you would still investigate can still be symbolicated.`,`Write down the compatibility rule between client version, protocol version and master data version, and enforce it at the handshake.`],
  ai:{ yes:[`Write the build-time stamping for a toolchain you name.`,`Generate a release-note template from a commit range format and a job environment.`,`Review a pipeline for artefacts that are overwritten instead of versioned.`,`Explain why a stack trace is unreadable from the build settings you paste.`],
       no:[`Decide the versioning scheme. It is a promise to other teams and to stores.`,`Claim an artefact is reproducible without a rebuild that proves it.`,`Invent a commit range. It must come from the build system.`] },
  prompts:[{l:'Stamp the build',p:`Our build produces [ARTEFACT TYPES] using [TOOLCHAIN] in [CI SYSTEM]. Show how to inject version, commit hash, build timestamp and toolchain version at build time, how the running process reports them, and how the client build exposes the same identity to a tester. List everything that must be captured in the same job as the build and would be unrecoverable afterwards.`},
    {l:'Provenance gaps',p:`Here is our build job and its outputs: [PASTE]. List what an on-call engineer could not determine about a shipped artefact six months from now: which commit, which toolchain, which configuration, which symbols. For each gap, give the smallest change to the job that closes it, and say which gaps become unrecoverable once the workspace is cleaned.`}],
  verify:[`Does the stamped version come from the build system, or from a file a human edits?`,`Is the symbol upload in the same job as the build, and does its failure fail the job?`,`Is the release note derived from the commit range, or summarised into prose that loses commits?`],
  test:[`Take a build from three months ago and read a crash from it. If you cannot, retention or symbol upload is wrong.`,`Ask three people which version is live in each environment. Different answers mean the identity is not visible enough.`,`Track artefact size per build and alert on the jump, not on an absolute threshold.`],
  tech:[
    {n:'Link-time variable injection', how:`The build passes version, commit, date and toolchain into variables the binary prints at startup and serves on a health endpoint.`, fit:`Compiled servers and command line tools, where the build system already knows all four values.`, cost:`Makes the binary non-reproducible byte for byte because the timestamp changes. Needs the build system to be the only source.`, alt:`A generated source file committed by CI, when the toolchain has no linker flag equivalent.`},
    {n:'Generated build-info asset', how:`A pre-build step writes an asset into the project containing the same fields, which the client reads at runtime and shows on a debug screen.`, fit:`Game clients, where nothing is linked and the identity must survive into a packaged build.`, cost:`The asset is generated into the working tree, so it must be ignored by version control and regenerated every build.`, alt:`Reading the platform's own version fields, which carry less and differ per store.`},
    {n:'Generated release note from the commit range', how:`The job computes the commits between this build and the last successful one and writes a note carrying job, repository, branch and the commit list.`, fit:`Any team where several people merge between builds and testers need to know what changed.`, cost:`Only as good as the commit messages. A squashed history hides the detail that mattered.`, alt:`A hand-written changelog for players, kept separate from the machine-generated provenance note.`},
    {n:'Symbol upload and retention policy', how:`Debug symbols and line-number data are uploaded to the crash reporter in the build job, keyed by version and build number, with a stated retention.`, fit:`Any ahead-of-time compiled or stripped build where a raw stack trace is unreadable.`, cost:`Storage grows per build. A missed upload is unrecoverable once the workspace is cleaned.`, alt:`Keeping the full build output archived, which is larger and slower to use.`}],
  rel:[['quality-and-build-health','A build you cannot identify is a build you cannot triage.'],['launch-and-discoverability','Store submissions turn version numbers into public commitments.'],['infra-ci-pipelines','Provenance is produced by the job that produces the artefact, or not at all.'],['infra-cdn-assets','A build identity is only useful if the content it downloads is versioned too.'],['lead-incidents','Which build is this is the first question of every incident.']] });
ENGINE('infra-artifacts-provenance',{
  godot:{ term:`An export plugin writes the build identity into the pack as the export begins, so the shipped PCK carries its own provenance instead of a constant somebody remembered to edit.`,
    api:['EditorExportPlugin._export_begin()','EditorExportPlugin.add_file()','ProjectSettings.get_setting("application/config/version")','Engine.get_version_info()','OS.get_environment()','Time.get_datetime_string_from_system()'],
    snippet:`@tool
extends EditorExportPlugin      # registered by an EditorPlugin

func _get_name() -> String:
\treturn "build_info"

func _export_begin(_features, _debug, _path, _flags) -> void:
\tvar info := {
\t\t"version": ProjectSettings.get_setting("application/config/version"),
\t\t"commit": OS.get_environment("CI_COMMIT"),
\t\t"job": OS.get_environment("CI_JOB"),
\t\t"built_at": Time.get_datetime_string_from_system(true),
\t\t"engine": Engine.get_version_info().string,
\t}
\tadd_file("res://build_info.json", JSON.stringify(info).to_utf8_buffer(), false)`,
    pitfall:`Keeping the version only in project.godot and bumping it by hand. The export then claims whatever was true the last time somebody remembered, which is usually one release behind, and a tester screenshotting the title screen reports the wrong build. Write the identity from the environment at export time and read it back from the injected file at runtime.`,
    map:`Godot's EditorExportPlugin._export_begin is Unity's IPreprocessBuildWithReport.` },
  unity:{ term:`A build preprocessor stamps the identity into a generated asset and into the player settings, and the build report gives you the size series. Symbols are produced beside the player and exist only in that job.`,
    api:['IPreprocessBuildWithReport.OnPreprocessBuild()','PlayerSettings.bundleVersion / Android.bundleVersionCode','Application.version','BuildReport.summary.totalSize','AssetDatabase.CreateAsset()','ScriptableObject.CreateInstance<T>()'],
    snippet:`class StampBuildInfo : IPreprocessBuildWithReport {
    public int callbackOrder => 0;
    public void OnPreprocessBuild(BuildReport report) {
        PlayerSettings.bundleVersion = Env("VERSION", "0.0.0");
        var so = ScriptableObject.CreateInstance<BuildInfo>();
        so.commit  = Env("CI_COMMIT", "local");
        so.job     = Env("CI_JOB", "local");
        so.builtAt = System.DateTime.UtcNow.ToString("o");
        AssetDatabase.CreateAsset(so, "Assets/Resources/BuildInfo.asset");
        AssetDatabase.SaveAssets();
    }
    static string Env(string k, string d) =>
        System.Environment.GetEnvironmentVariable(k) ?? d;
}`,
    pitfall:`Shipping an ahead-of-time compiled build without uploading the symbols produced next to it. The symbol archive and the line-number data exist only in that job's output folder, and once the agent workspace is cleaned no crash from that build can ever be read again. Upload in the same job and fail the job when the upload fails.`,
    map:`Unity's generated BuildInfo asset is the file Godot's export plugin adds to the pack.` },
  note:`A server stamps its identity in with linker flags. A client cannot, so the same four fields are generated into an asset that ships inside the build and shown on a debug screen a tester can photograph. The reason is identical in both cases. An artefact nobody can identify cannot be investigated, and the window to capture provenance closes when the job ends.` });
INTERVIEW('infra-artifacts-provenance',{
  junior:[
    { q:`How does a running build tell you which commit it came from?`,
      a:`The build injects it. On a compiled server the version, commit hash, build timestamp and toolchain go in at link time and the process prints them in its first log line and serves them on a health endpoint. On a client the same fields are generated into an asset during the build and shown on a debug screen. The key point is that the build system is the source, not a file a human edits.`,
      follow:`Why not just read the version from a constant in the source?`,
      red:`Says they check which branch was deployed, or relies on a hand-edited version constant.` },
    { q:`What are debug symbols and why do they have to be uploaded during the build?`,
      a:`They map addresses in a stripped or ahead-of-time compiled binary back to functions and line numbers. Without them a crash report is unreadable. They exist only in that build's output, so once the agent workspace is cleaned they are gone and no crash from that build can ever be read again. Upload in the same job and fail the job if the upload fails.`,
      follow:`A crash comes in from a build made four months ago. What do you need to have done back then?`,
      red:`Thinks symbols can be regenerated later from the same source, which is not reliably true.` },
    { q:`Two artefacts have the same version number. Why is that a problem?`,
      a:`Because every later question becomes unanswerable: which one is live, which one produced this crash, which one was tested. Names of artefacts should be immutable and contain the version and build number, and nothing should ever be overwritten. Say what caused the collision, usually a reused tag or an output path without a build number.`,
      follow:`How would you make it structurally impossible rather than a rule people follow?`,
      red:`Says it is fine because the content is probably the same.` }
  ],
  mid:[
    { q:`Where does a release note come from in your pipeline?`,
      a:`Generated, not written. The job computes the commits between this build and the last successful one and emits a note carrying the job identifier, the repository, the branch and the commit list. Nobody edits it. Separately there is a player-facing changelog, which is a different document with a different author and a different purpose.`,
      follow:`A build fails, then the next one succeeds. What commit range does the note cover, and is that what you want?`,
      red:`Describes a human writing the notes from memory, or conflates the internal provenance note with player patch notes.` },
    { q:`How do you use artefact size as a signal?`,
      a:`Record it per build and keep the series. Alert on the jump rather than on an absolute threshold, because the threshold is always wrong and a jump is always interesting. A sudden increase is usually an asset imported at the wrong compression, a duplicated dependency or a debug symbol set shipped by accident. Finding it in the build that caused it is minutes of work. Finding it at certification is a week.`,
      follow:`The build grew by 80 megabytes. Walk me through narrowing it down.`,
      red:`Only looks at size before a store submission.` },
    { q:`How do client version, protocol version and master data version relate?`,
      a:`They are three separate numbers and the compatibility rule between them has to be written down and enforced at the handshake, not assumed. The client sends what it has, the server decides whether it is acceptable and answers with force update, use this master data version, or proceed. Say what happens when a client is two versions behind during a staged rollout.`,
      follow:`You roll back the server. What happens to clients that already updated?`,
      red:`Has one version number for everything and no handshake.` }
  ],
  senior:[
    { q:`It is an incident. What does provenance give you in the first five minutes?`,
      a:`Which build is running in each environment, what changed since the last known good one, and whether crash reports from this build are readable. That turns the opening question from an investigation into a lookup. Say what you would fix in the pipeline if any of those three took more than a minute, because the incident is the wrong time to discover the gap.`,
      follow:`Your rollback target is three builds back. How do you know what is in it?`,
      red:`Starts by asking people in chat what they deployed.` },
    { q:`When is reproducible building worth the effort?`,
      a:`When somebody actually verifies the result: a security requirement, a platform holder, or a supply-chain policy. Otherwise the cost is real and the benefit is theoretical, because stamping the build time already makes the artefact differ byte for byte. The cheaper 90 percent is recording the inputs precisely enough that you could rebuild something equivalent, which is what provenance is for.`,
      follow:`What would you record so that a rebuild in two years is even possible?`,
      red:`Treats reproducible builds as a universal best practice with no cost, or dismisses provenance along with it.` }
  ] });

T('infra-secrets',{ d:'infra', t:'Secrets management', tag:'A credential in version control is public from the moment it is pushed. History is the boundary, not the commit.',
  what:`The credentials a system needs and people must not hold by default: database passwords, API tokens, signing keys, keystore passwords, service-account keys, webhook URLs. Managing them means deciding where the value lives (a secret manager, a cloud key and secret store, the CI credential store), how it reaches the process (injected at deploy time as an environment variable or a mounted file, never compiled into the artefact), who can read it, and how it is rotated.`,
  why:[`A secret in version control is public from the moment it is pushed. Deleting the file does not remove it from history, and history is what a clone carries.`,`Rotation is the only real remedy after a leak, and rotation is only cheap when nothing has the value hard-coded.`,`Signing keys and store keystores are unrecoverable. Losing one can mean a listing that can never be updated again.`,`Least privilege turns a leaked credential into a small incident rather than a total one.`],
  think:{ q:[`If this value leaked today, what is the blast radius and how long does rotating it take?`,`Where does the value live right now, in every place, including laptops, old CI job logs and a colleague's chat history?`,`Is it injected at deploy time, or is it inside the artefact?`,`Who can read it, and does that list match who needs it?`,`What does local development look like, and does it tempt people back to a committed file?`,`Does anything print it? Logs, error messages, crash reports and support tools all leak.`],
    trade:[`A central secret manager is the right answer and adds a dependency that must be available at deploy time and sometimes at runtime.`,`Short rotation windows limit damage and break anything that cached the value, which is most things nobody wrote down.`],
    traps:[`Committing a live credential, which in practice is never one file. The shape observed in real projects is a chat bot token in a CI configuration file, a service-account key checked in beside it, a keystore password in a build script, and the keystore itself in the client repository. Individually each is a leak. Together they are a complete key ring in a repository every contributor can clone.`,`Embedding configuration including credentials into the binary so it is self-contained. The secret becomes self-contained too.`,`Assuming compilation hides a string. Anyone can dump the strings in a shipped client.`,`A secret written into a container image layer, where it survives even after a later layer deletes the file.`,`One credential shared across environments, so a staging leak is a production incident.`,`Treating a webhook URL as harmless. It is an unauthenticated write endpoint into your team chat.`],
    good:[`Nothing in the repository is a live credential, and a checker enforces that before a push rather than after.`,`Rotating the most important credential is a rehearsed, timed operation with a written procedure.`],
    bad:[`The setup guide tells a new developer to ask a colleague for the token.`,`Nobody can list which credentials are currently live.`] },
  how:[`Inventory first. List every credential, where it lives, who can read it, and what rotating it costs.`,`Move the values into one store: a secret manager, a cloud key and secret store, or the CI credential store for build-time secrets. Reference them by name, never by value.`,`Inject at deploy time as environment variables or mounted files. The artefact must contain no secret.`,`Give each environment its own credentials and each service the narrowest permission it needs.`,`Add a pre-push check that matches credential shapes, and run the same check in CI so it is not optional.`,`Write the rotation procedure per credential, then rehearse the one that would hurt most.`,`Redact at the logging boundary rather than at each call site, and test the redaction with a known fake value.`,`If a secret was ever committed, rotate it. Rewriting history is cleanup, not remediation.`],
  ai:{ yes:[`Draft the inventory table and a rotation procedure from a list of credentials described by name and type only.`,`Write detection patterns for a pre-push secret scan, including the shapes your team actually uses.`,`Review a Dockerfile or a pipeline for values that should be references.`,`Explain what an attacker can do with a specific credential type, so you can rank the inventory.`],
       no:[`Handle the actual values. Never paste a live credential into a prompt, because the prompt is now a place the secret lives.`,`Decide access policy or who is allowed to read what.`,`Judge that a particular leak was harmless.`] },
  prompts:[{l:'Credential inventory',p:`Act as a security engineer. Here are our credentials described by type and purpose only, with no values: [LIST]. For each, produce: blast radius if leaked, whether it can be rotated and roughly how long that takes, where it should be stored, how it should reach the process, and who should be able to read it. Rank them by rotation cost multiplied by blast radius. Do not ask me for any value.`},
    {l:'Leak-shape scan patterns',p:`We want a pre-push check that fails when a credential shape appears in a diff. Our stack uses [LIST TYPES: keystore passwords, service-account keys, chat webhook URLs, database passwords, API tokens]. Write the detection patterns, the files to exclude, and a set of realistic fake positives and fake negatives to test the check against. Explain which shapes cannot be detected by pattern and need a different control.`}],
  verify:[`Did the answer ask for, echo or store any real value? It must work with names and shapes only.`,`Does the generated configuration reference secrets, or contain them?`,`Do the scan patterns catch the shapes your team actually uses, including the webhook URL and the keystore password?`],
  test:[`Run the scanner over the full history, not the working tree. History is the boundary.`,`Rotate one real credential in staging and time it. That number is your incident response cost.`,`Search a shipped client binary for the strings you believe are not in it.`],
  tech:[
    {n:'Deploy-time environment injection', how:`The deploy system reads the value from a store and sets it as an environment variable or a mounted file for the process.`, fit:`Almost every backend service. The simplest thing that keeps the artefact clean.`, cost:`The value sits in the process environment, so it appears in crash dumps and in anything that prints the environment.`, alt:`Fetching at startup from a secret manager, so the value never enters the process environment.`},
    {n:'Dedicated secret manager with leases', how:`A service issues short-lived credentials on request, authenticated by the workload identity, and revokes them when the lease expires.`, fit:`Larger teams, regulated data, and anywhere rotation must be automatic rather than remembered.`, cost:`Another system to run and to be available at startup. Applications must handle a credential expiring mid-run.`, alt:`A cloud secret store with long-lived values and manual rotation, when the operational budget is small.`},
    {n:'Cloud key and secret store with identity policy', how:`Secrets live in the platform's store, access is granted to a workload identity by policy, and every read is audited.`, fit:`Teams already on one cloud, who want audit trails without running a secret service.`, cost:`Ties access control to that platform's identity model. Cross-cloud and local development need a second path.`, alt:`A self-hosted manager when you need to stay portable.`},
    {n:'CI credential store for build-time secrets', how:`Signing keys, keystore passwords and upload tokens live in the CI system's credential store, injected only into the step that needs them and masked in logs.`, fit:`Client build pipelines, store uploads, symbol uploads, package publishing.`, cost:`Masking is best-effort. A script that echoes its arguments still leaks. Anyone who can edit the pipeline can exfiltrate.`, alt:`A secret manager the build job authenticates to, which moves the trust boundary off the CI system.`}],
  rel:[['ethics-and-responsibility','Player data and credentials are the two things a team is trusted with.'],['team-and-collaboration','Access policy is a people decision expressed in tooling.'],['infra-ci-pipelines','Build-time secrets live in the pipeline, which makes the pipeline a target.'],['infra-deploy-models','Injection at deploy time is what keeps the artefact clean.'],['backend-migrations-config','Embedded configuration is convenient right up until it embeds a password.']] });
ENGINE('infra-secrets',{
  godot:{ term:`Everything under res:// is packed into the PCK, and the PCK is an archive a player can open. There is no private folder in a Godot export, so the client holds a short-lived token it was given and never a long-lived key.`,
    api:['export_presets.cfg exclude_filter','HTTPRequest.request()','HTTPClient.METHOD_POST','JSON.parse_string()','Crypto / HMACContext','user:// (never res:// for anything written)'],
    snippet:`extends Node
@export var api_base := ""       # injected per environment at export time
var token := ""                  # short lived, memory only, never written to disk

func _ready() -> void:
\tvar http := HTTPRequest.new()
\tadd_child(http)
\thttp.request_completed.connect(_on_session)
\thttp.request(api_base + "/session", ["Content-Type: application/json"],
\t\tHTTPClient.METHOD_POST, JSON.stringify({"receipt": _platform_receipt()}))

func _on_session(_res, code: int, _headers, body: PackedByteArray) -> void:
\tif code != 200: return
\ttoken = JSON.parse_string(body.get_string_from_utf8())["token"]`,
    pitfall:`Putting a key in a .gd script or an exported Resource because scripts are compiled to bytecode in an export. Bytecode is not encryption. Even with pack encryption enabled the decryption key has to be inside the binary, so the client can always be made to hand it over. Anything the client can read, a determined player can read.`,
    map:`Godot's res:// pack is Unity's resources.assets. Both ship everything you put in them.` },
  unity:{ term:`Resources folders, ScriptableObjects and serialized fields are baked into the player data and the compiled binary. A key placed anywhere in the project is a key in the build. Signing material stays on the build agent, long-lived keys stay on your server.`,
    api:['UnityWebRequest.SetRequestHeader()','UnityWebRequest.Post()','PlayerSettings.keystorePass / keyaliasPass (agent only)','ScriptableObject (not for secrets)','PlayerPrefs (not for secrets)','Application.persistentDataPath'],
    snippet:`public class Session : MonoBehaviour {
    [SerializeField] string apiBase;        // injected per environment at build time
    string token;                           // short lived, memory only
    public IEnumerator Login(string receipt) {
        using var req = UnityWebRequest.Post(apiBase + "/session",
                                             receipt, "application/json");
        yield return req.SendWebRequest();
        if (req.result != UnityWebRequest.Result.Success) yield break;
        token = JsonUtility.FromJson<SessionDto>(req.downloadHandler.text).token;
    }
    public void Authorize(UnityWebRequest r) =>
        r.SetRequestHeader("Authorization", "Bearer " + token);
}`,
    pitfall:`Keeping a token or a key in PlayerPrefs. On desktop it is a registry entry or a plist, on Android it is an XML file any rooted device can read, and some platform backup systems copy it off the device entirely. It is a preferences store, not a secret store. Keep the token in memory and re-authenticate on launch.`,
    map:`Unity's keystore password in the CI credential store is the same control as a server's database password in a secret manager.` },
  note:`The backend rule is that the artefact contains no secret. The client is the extreme case of that rule, because the artefact is handed to the attacker. The shape that survives is the same in both: the build agent holds the signing material, the server holds the long-lived keys, and the client holds only a short-lived token it was issued. The observed anti-pattern, a keystore and its password committed next to the client source, fails on every one of those three counts at once.` });
INTERVIEW('infra-secrets',{
  junior:[
    { q:`A password was committed to the repository. It has been deleted in a later commit. Is the problem solved?`,
      a:`No. The value is in the history, and every clone and every fork carries it. Deleting the file changes the working tree and nothing else. The only remedy is rotation: change the credential so the leaked value is worthless. Rewriting history is cleanup you may also want, and it is not the fix.`,
      follow:`How long was it exposed, and what else do you have to assume was taken?`,
      red:`Says it is fine because the repository is private, or treats a force push as the remediation.` },
    { q:`Where should a database password live, and how does it reach the process?`,
      a:`In a secret store, referenced by name. It reaches the process at deploy time as an environment variable or a mounted file. It is never in the artefact, never in the image, never in the repository. Say what local development does instead, which is its own credential with no production access.`,
      follow:`It is in the process environment now. What can still read it?`,
      red:`Puts it in a configuration file and argues the file is not committed, with nothing enforcing that.` },
    { q:`Why can you not hide an API key inside a compiled game client?`,
      a:`Because the client is handed to the player. Compiled bytecode and ahead-of-time binaries are not encryption, and dumping the strings in a shipped build is trivial. Even encrypting the assets does not help, because the decryption key has to be in the binary. The client should hold a short-lived token it was issued by your server, not a long-lived key.`,
      follow:`Your third-party analytics SDK needs a key in the client. Now what?`,
      red:`Proposes obfuscation as protection, or claims nobody would bother.` }
  ],
  mid:[
    { q:`Walk me through building a credential inventory for a project you just joined.`,
      a:`List every credential by type and purpose, then for each one: where the value currently lives in every location, who can read it, blast radius if leaked, and what rotating it costs. Rank by rotation cost multiplied by blast radius and fix the top of that list first. Say where you expect to find surprises, which is old CI job logs, build scripts and people's local files.`,
      follow:`You find one credential shared by staging and production. What do you do first?`,
      red:`Starts by installing a secret manager before knowing what is out there.` },
    { q:`Which secrets belong in the CI credential store and which belong in a secret manager?`,
      a:`Build-time material goes in the CI store: signing keys, keystore passwords, upload tokens, symbol upload keys. Runtime material goes in a secret manager the workload authenticates to: database passwords, service tokens, third-party keys. Then note the weakness of both, which is that anyone who can edit the pipeline can exfiltrate a build-time secret, so pipeline review is part of the control.`,
      follow:`Masking hides the value in the log. What does masking not protect you from?`,
      red:`Puts everything in one place without distinguishing build-time from runtime.` },
    { q:`How would you stop a credential from being committed in the first place?`,
      a:`A pattern check that runs before the push and again in CI so it is not optional, tuned to the shapes your team actually uses, including webhook URLs and keystore passwords. Keep the pattern list in a file that is not committed if the patterns themselves are sensitive. Then admit what patterns cannot catch, such as a password that looks like an ordinary word, and name the control that covers that, which is review and structure.`,
      follow:`How do you test the checker, and how do you know it is not silently passing everything?`,
      red:`Relies on people remembering, or writes a checker and never feeds it a positive case.` }
  ],
  senior:[
    { q:`You inherit a project with the keystore, its password and a service-account key all committed. What is your first week?`,
      a:`Triage by irreversibility, not by count. The store keystore is unrecoverable and must not be rotated casually, so it goes into restricted storage and out of the repository first, with access limited to the build system. Every rotatable credential gets rotated, starting with the widest blast radius. Then close the door: secret store, deploy-time injection, a pre-push checker in CI. Communicate it as a system failure rather than a person's mistake, because that is what gets the rest of the team to report the ones you have not found.`,
      follow:`You cannot rotate the signing key without breaking every installed copy. How does that change the plan?`,
      red:`Proposes rewriting history as the main action, or rotates the signing key without understanding what depends on it.` },
    { q:`How do you make the secure path also the easy path for developers?`,
      a:`The friction is what pushes people back to committed files. Give local development its own credentials with no production access, fetched by one command. Make the secret reference the default in every template and generator. Make the checker fast enough that nobody disables it. Then measure the thing that matters, which is whether anyone still needs to ask a colleague for a value.`,
      follow:`A developer says the secret manager is down and they are blocked. What is the escape hatch, and how do you keep it from becoming the normal path?`,
      red:`Adds policy and training with no change to the workflow that caused the behaviour.` }
  ] });

T('infra-cdn-assets',{ d:'infra', t:'CDN and asset delivery', tag:'Content shipping after the client ships. Put the hash in the path, version the manifest, and test the fix on a device that already has the old file.',
  what:`How bytes that are not the executable reach a player: texture and audio bundles, master data, patches. A content delivery network caches them near the player. The decisions are the manifest (what exists, at which version), the cache-busting scheme (how a changed file gets a new URL), access control (public, signed URL, or encrypted bundle), and whether to use the platform's own asset packs instead.`,
  why:[`Asset delivery is what lets content ship after the client ships. Without it every balance change is a store submission and a review queue.`,`A cache-busting mistake is silent. Players keep the old file, and the bug report says the fix did nothing.`,`Egress is usually the largest infrastructure line for a game with a big download, so size decisions are cost decisions.`,`Download time before first play is the biggest install-to-first-session drop you actually control.`],
  think:{ q:[`Is the manifest versioned, and can a client be pointed at an older manifest during a rollback?`,`What is the cache key: a content hash in the path, or a query string that some caches ignore?`,`Does a low-memory device need a smaller manifest, and can that share one content path so tiering costs no extra storage?`,`Which assets must exist before first play, and which can stream in behind it?`,`Is any of this content that must not leak before a date? Then it needs a signed short-lived URL, and the check belongs on the server.`,`What does the platform offer natively, and does using it remove your CDN cost for the initial download?`],
    trade:[`Content-hashed filenames make cache busting automatic and make every build a new set of URLs, so old files accumulate and need a retention policy.`,`Signed URLs control access and add an authenticated call before every download plus a clock dependency on the device.`,`Store asset packs are free to host and bind you to that store's update cadence and size rules.`],
    traps:[`Cache busting with a query string. Some intermediaries and some device caches ignore it entirely.`,`A remote catalogue the client caches once and never re-checks, so the fix is on the CDN and not on the device.`,`Uploading after the release rather than before, so the first players download a manifest whose files do not exist yet.`,`No retry with backoff around the upload step, so a transient failure publishes a partial set.`,`Treating an encrypted bundle as security. It is a delay, and the key is on the device by definition.`,`Serving the highest quality set to every device because tiering was designed and never wired up.`],
    good:[`A changed asset has a new URL by construction, not by someone remembering to bump a number.`,`Rolling back the client also rolls back which manifest it reads.`],
    bad:[`The workaround in the support reply is to clear the app data.`,`The bill grows faster than the player count and nobody can say which asset did it.`] },
  how:[`Put a content hash in the path. A changed file then cannot collide with its cached predecessor, and the CDN can cache each path forever.`,`Version the manifest and let the client version select which one it reads. Rollback becomes pointing at the older manifest.`,`Upload before you release and gate the release on the upload completing. Retry the upload with backoff and check the exit code.`,`Split the manifest by device tier if you serve tiered quality, and keep one content path so tiering costs no extra storage.`,`Decide the first-play set explicitly and measure its download time. Everything else streams or downloads in the background.`,`Use signed short-lived URLs for content that must stay private until a date, and enforce the date on the server as well as in the client.`,`Prefer the platform's own delivery for the initial download when it is free, and keep your CDN for post-launch patches.`,`Keep old versions available as long as any client could still be running them, then expire them on a written schedule.`],
  ai:{ yes:[`Design the manifest schema and the version-selection rule, including the rollback case.`,`Review a path and cache-control scheme for busting mistakes.`,`Estimate egress from an asset catalogue and a player curve you provide, showing the arithmetic.`,`Write the retry-with-backoff wrapper around an upload step.`],
       no:[`Decide what ships in the initial download. That is a product decision about the first session.`,`Assert what a specific store's asset delivery allows without checking the current policy.`,`Claim that encrypting a bundle protects it on a device.`] },
  prompts:[{l:'Manifest and busting scheme',p:`We ship [ASSET TYPES] to [PLATFORMS] and patch content [CADENCE]. Design the manifest: fields, versioning, how a client version selects a manifest, and how rollback works. Specify the URL scheme so that a changed file can never be served from a stale cache. State exactly where the cache key lives and what cache-control headers each path gets. Flag any part of the scheme that depends on the client behaving correctly.`},
    {l:'Download budget',p:`Here is our asset catalogue with sizes and the moment each asset is first needed: [LIST]. Split it into the set required before first play and the set that can stream. Estimate the first-play download on [NETWORK SPEEDS] and show the arithmetic. Identify the five assets with the worst size-to-necessity ratio and what tiering would save. Do not propose compression settings you cannot justify.`}],
  verify:[`Is the cache key in the path, or hidden in a query string?`,`Does the rollback story cover the manifest as well as the binary?`,`Did it present bundle encryption as protection rather than as delay?`],
  test:[`Ship a change to one asset and confirm it on a device that already had the old one. That is the only real cache-busting test.`,`Measure install to first playable moment on the slowest supported device and the slowest network you support.`,`Track egress per player per day. A jump means something is being downloaded twice.`],
  tech:[
    {n:'Content-hashed paths', how:`The file's content hash is part of its URL, so a changed file always has a new address and every path can be cached forever.`, fit:`Any patched content. The default choice unless something forbids it.`, cost:`Old files accumulate and need an expiry policy. The manifest becomes mandatory, because names are no longer human readable.`, alt:`Versioned directories, which are simpler to browse and bust a whole set at once even for files that did not change.`},
    {n:'Signed short-lived URLs', how:`The client asks your server for a time-limited signed URL before each download, so the CDN serves only requests you authorised.`, fit:`Content under embargo, paid content, and anything you do not want scraped before release.`, cost:`An authenticated round trip per download, a device clock dependency, and signing load on your server.`, alt:`Public paths with unguessable hashes, which is obscurity rather than access control.`},
    {n:'Encrypted bundles', how:`Bundle contents are encrypted and the client decrypts after download, so a scraped file is not directly readable.`, fit:`Delaying datamining of unreleased content past a launch window.`, cost:`The key ships with the client, so it is a delay and not protection. Decryption costs time and memory on load.`, alt:`Keep genuinely secret content off the device until the date, and accept a download at unlock time.`},
    {n:'Platform asset packs and on-demand resources', how:`The store hosts and delivers asset packs alongside the installed application, with install-time, fast-follow or on-demand delivery.`, fit:`The initial download, where the store's bandwidth is free and its installer is better integrated than yours.`, cost:`Size limits, per-store differences, and an update cadence tied to store review.`, alt:`Your own CDN, which costs money and answers to nobody's review queue.`}],
  rel:[['content-multiplies','Post-launch content only exists if there is a pipe to deliver it.'],['platform-and-session','Download size and session length decide who ever reaches the first session.'],['infra-artifacts-provenance','A build identity is what selects which manifest a client reads.'],['backend-caching-redis','The CDN is a cache, and it has the same invalidation problem as every other cache.'],['server-liveops','Content drops, maintenance gates and force update are the same delivery decision.']] });
ENGINE('infra-cdn-assets',{
  godot:{ term:`Downloaded content arrives as a PCK mounted at runtime. The client fetches it into user://, verifies it, then mounts it, and the CDN path carries the content hash so a stale cache cannot answer.`,
    api:['ProjectSettings.load_resource_pack()','HTTPRequest.download_file','FileAccess.get_md5()','DirAccess.remove_absolute()','ResourceLoader.load_threaded_request()','user:// storage'],
    snippet:`extends Node
@export var cdn := ""                     # https://host/<content-hash>/<file>

func fetch_pack(entry: Dictionary) -> bool:
\tvar dest := "user://packs/%s.pck" % entry.hash   # hash in the name: no stale hit
\tif not FileAccess.file_exists(dest):
\t\tvar http := HTTPRequest.new()
\t\tadd_child(http)
\t\thttp.download_file = dest
\t\thttp.request("%s/%s/%s" % [cdn, entry.hash, entry.file])
\t\tawait http.request_completed
\tif FileAccess.get_md5(dest) != entry.md5:
\t\tDirAccess.remove_absolute(dest)              # never mount a partial download
\t\treturn false
\treturn ProjectSettings.load_resource_pack(dest)`,
    pitfall:`Mounting a pack with the default replace_files behaviour and paths that overlap the base game. The pack silently shadows base resources, and a stale pack left in user:// keeps overriding the file you just fixed, on that device only, forever. Mount downloaded packs under their own path prefix and verify the hash before mounting.`,
    map:`Godot's load_resource_pack over a downloaded PCK is Unity's Addressables remote catalog plus the bundle cache.` },
  unity:{ term:`Addressables splits content into remote bundles described by a catalog. The catalog is cached on the device, so the boot flow must ask whether a newer one exists before anything loads.`,
    api:['Addressables.CheckForCatalogUpdates()','Addressables.UpdateCatalogs()','Addressables.GetDownloadSizeAsync()','Addressables.DownloadDependenciesAsync()','AssetLabelReference','Caching.ClearCache()'],
    snippet:`public class ContentUpdater : MonoBehaviour {
    [SerializeField] AssetLabelReference firstPlay;
    public async Task<long> Prepare() {
        var updates = await Addressables.CheckForCatalogUpdates(false).Task;
        if (updates.Count > 0)
            await Addressables.UpdateCatalogs(updates, false).Task;
        var size = await Addressables.GetDownloadSizeAsync(firstPlay).Task;
        if (size > 0)
            await Addressables.DownloadDependenciesAsync(firstPlay, false).Task;
        return size;          // report it: this number is the install-to-play wait
    }
}`,
    pitfall:`Leaving the catalog check out of the boot flow. Addressables caches the catalog, so the client keeps resolving to the bundles it first saw and new content on the CDN is invisible until the app data is cleared. Call CheckForCatalogUpdates and UpdateCatalogs before the first load, and enable append-hash-to-filename so a rebuilt bundle can never reuse a cached one.`,
    map:`Unity's remote catalog version is the manifest version a Godot client selects before downloading packs.` },
  note:`The CDN, the manifest and the busting scheme are backend infrastructure. The client is what makes or breaks them: it decides when to re-check the catalogue, whether it verifies what it downloaded before using it, and whether a rollback on the server actually reaches a device that already cached the old set. Test the fix on a device that already has the old file, because that is the only device the bug lives on.` });
INTERVIEW('infra-cdn-assets',{
  junior:[
    { q:`What is cache busting and why is a query string a poor way to do it?`,
      a:`It is making sure a changed file gets a new address so nothing can serve the old bytes. A content hash in the path guarantees it, because a different file is a different URL. A query string is only advisory: some intermediaries and some device caches ignore it or normalise it away, so a fraction of your players keep the old file and you cannot tell which.`,
      follow:`How would you prove your scheme works on a real device?`,
      red:`Says to lower the cache lifetime, which trades correctness for bandwidth and still does not guarantee it.` },
    { q:`What is a manifest, and why is it versioned?`,
      a:`It is the list of what content exists and at what version, which the client reads before downloading anything. Versioning it means the client version can select which manifest it reads, so a rolled-back client reads the content set it understands. Without that, rolling back the binary leaves the old client pointed at new content.`,
      follow:`You roll back the client build. What happens to a device that already downloaded the new bundles?`,
      red:`Treats the manifest as a static file that is simply overwritten.` },
    { q:`Should content be uploaded to the CDN before or after the release goes out?`,
      a:`Before, always, and the release should be gated on the upload completing. If the client ships first, its manifest points at files that do not exist and the first players get a failed download. The upload step also needs retry with backoff and a real exit-code check, otherwise a partial set publishes silently.`,
      follow:`The upload half succeeded. How would you know?`,
      red:`Has no ordering rule, or assumes the upload always works.` }
  ],
  mid:[
    { q:`A fix shipped to the CDN and players say nothing changed. Where do you look?`,
      a:`The device already has an answer cached. Check the whole chain: is the catalogue re-checked at boot, is the file path content-addressed, did the CDN edge get invalidated, and is the client pinned to an older manifest. Reproduce it on a device that already had the old version, because a clean install will always look fine and will teach you nothing.`,
      follow:`Support has been telling players to clear the app data. What is that hiding?`,
      red:`Tests on a fresh install, sees the fix, and closes the ticket.` },
    { q:`How do you serve smaller content to low-end devices without doubling your storage?`,
      a:`Decide the tier at runtime from device capability, and let the tier select a reduced manifest rather than a separate content path. The bundles are shared where they can be and the manifest is the only thing that differs, so the CDN cache stays warm for everyone. Say how you validate the tier assignment, because getting it wrong is either a crash or a worse-looking game for no reason.`,
      follow:`A device is misclassified into the low tier. How would you find out?`,
      red:`Builds a separate full content set per tier and pays for it twice.` },
    { q:`Is encrypting your asset bundles worth it?`,
      a:`Treat it as a delay, not as protection, because the key ships with the client by necessity. It buys time against casual datamining around a launch window, and it costs decryption time and memory on load. If the content genuinely must not leak, it should not be on the device before the date, which means a download at unlock time and a server-side gate.`,
      follow:`The marketing team wants the reveal asset in the build two weeks early. What do you propose?`,
      red:`Presents encryption as security, or dismisses the requirement without offering the server-gated alternative.` }
  ],
  senior:[
    { q:`Egress cost has doubled while the player count grew ten percent. How do you investigate?`,
      a:`Get bytes per player per day and split it by path, by version and by platform. The usual causes are a busting mistake making devices redownload, a tier that stopped applying, a client retry loop, and a manifest that pulls the whole catalogue instead of the first-play set. Fix the arithmetic before the compression, because a factor of two is almost never texture settings.`,
      follow:`It turns out one client version redownloads on every launch. How did that reach production and what gate would have caught it?`,
      red:`Goes straight to renegotiating CDN pricing or recompressing textures without finding the cause.` },
    { q:`How do you decide between the platform's own asset delivery and your own CDN?`,
      a:`Split it by phase. The initial download is usually better on the store: their bandwidth is free, the installer is integrated, and the player experience is the one they expect. Post-launch patching is usually better on your CDN, because the store cadence is a review queue and you need to ship a fix today. Name the size limits and the per-store differences that constrain it, and say what you would measure before committing.`,
      follow:`You use both. What is now true about your manifest, and what breaks if the two disagree?`,
      red:`Picks one for everything without costing the initial download or the patch latency.` }
  ] });

T('infra-data-stores',{ d:'infra', t:'Managed databases, replicas, sharding and queues', tag:'The database is the one component you cannot restart your way out of. Choose the shard key early and rehearse the restore.',
  what:`The stateful services behind the game: a relational database (usually managed, with a primary for writes and replicas for reads), a distributed cache, and queues or streams for work that must not happen inside a request. The decisions are how you scale reads (replicas), how you scale writes (horizontal partitioning by a shard key), and how you move work off the request path (a queue, a stream, or a scheduled batch).`,
  why:[`The database is the one component you cannot restart your way out of. Every other decision sits downstream of it.`,`Read replicas are cheap and they lie. They lag the primary, so a read after a write can show the player a world where their purchase did not happen.`,`Sharding is straightforward to design in at the start and expensive to add later, because the shard key has to be present in every query, every batch job and every admin tool.`,`A queue turns a slow synchronous failure into a retryable asynchronous one, and immediately raises the question of what happens when a message is processed twice.`],
  think:{ q:[`What is the shard key, and is it present in every access path including batch jobs and admin tools?`,`Which reads can tolerate replica lag, and which must go to the primary? Name them, do not default them.`,`What is the restore procedure, and when did someone last run it end to end?`,`What happens when a consumer crashes after doing the work and before acknowledging the message?`,`Is the cache a performance layer or a source of truth? If losing it loses data, it is a database.`,`Who pays for the write amplification of the index that was just added?`],
    trade:[`Read replicas scale reads cheaply and add a staleness window your design has to name and handle.`,`Sharding removes the single-primary write ceiling and removes cross-shard queries, transactions and joins along with it.`,`A managed database costs more per unit and removes failover, patching and backup work. For a small team that trade is usually worth it.`],
    traps:[`Adding a replica and routing everything to it, then spending a week on reports that an item bought a second ago is missing.`,`A shard key chosen for storage balance rather than for the dominant access pattern, so every read fans out across all shards.`,`Treating the distributed cache as durable. It is allowed to forget, and one day it will.`,`Backups that are taken and never restored. An untested backup is a hope, not a control.`,`A queue with no dead-letter destination, so one poison message stalls the whole consumer.`,`At-least-once delivery met by a consumer that is not idempotent, so one retry pays out twice.`],
    good:[`Every consumer is idempotent against a key you control, so a duplicate is a no-op.`,`The restore drill is on the calendar and the last one has a recorded duration.`],
    bad:[`Exactly one person has ever restored a backup.`,`The staleness window was discovered by a player and reported as a bug.`] },
  how:[`Start with one primary and vertical scale. It is simpler than you expect and lasts longer than you expect.`,`Route reads explicitly. Mark the paths that must read the primary instead of defaulting the whole application one way.`,`If you will shard, derive the shard from the environment so one binary serves any shard, and pick the key from the dominant access pattern.`,`Make every queue consumer idempotent against a key you control. Then at-least-once delivery stops being a problem.`,`Give every queue a dead-letter destination and a named person who looks at it.`,`Take backups and rehearse the restore on a schedule. Record how long a full restore takes and publish the number.`,`Keep the cache disposable. A cold start must be correct, only slower.`,`Move anything slow, third-party or bursty off the request path onto a queue or a scheduled job, and give the player an honest status while it runs.`],
  ai:{ yes:[`Compare partitioning strategies against an access pattern you describe, with the queries that would fan out.`,`Review a schema and its indexes against the queries you paste.`,`Write the idempotency key and the dead-letter handling for a consumer.`,`Draft a restore runbook from the backup configuration and the recovery objective you state.`],
       no:[`Decide the shard key. In practice it cannot be changed later.`,`Estimate your capacity without your own traffic numbers.`,`Approve or run a schema migration against a live database.`] },
  prompts:[{l:'Partitioning review',p:`Here is our dominant access pattern with rough volumes: [DESCRIBE READS AND WRITES]. Evaluate three options: single primary with read replicas, horizontal sharding by [CANDIDATE KEY], and a different key you propose. For each: which queries stay single-shard, which fan out, what breaks in transactions and joins, and what the batch jobs and admin tools would have to change. State what you would need to measure before choosing.`},
    {l:'Consumer safety review',p:`Here is a queue consumer: [PASTE]. Assume at-least-once delivery and a crash at any point. Walk the failure cases: crash after the side effect and before acknowledgement, duplicate delivery, out-of-order delivery, and a message that always fails. For each, say what a player would observe and the smallest change that makes it safe. Point out every side effect that is not idempotent.`}],
  verify:[`Did it carry the shard key into every path, including admin and batch paths?`,`Is the consumer it wrote safe to run twice on the same message?`,`Does the read path it chose tolerate replica lag, and did it name the window?`],
  test:[`Force replica lag in staging and play the purchase flow through it. What the player sees under lag is the specification.`,`Restore a production-sized backup and time it. That number is your worst-case outage length.`,`Replay a batch of queue messages twice and diff the resulting rows. Any difference is a missing idempotency key.`],
  tech:[
    {n:'Primary with read replicas', how:`Writes go to one primary, reads are routed to replicas that follow it asynchronously.`, fit:`Read-heavy workloads: rankings, listings, profile views, anything a player looks at more often than they change.`, cost:`A staleness window that every read-after-write path must handle. Replica failover has its own lag and its own surprises.`, alt:`A cache in front of the primary, which has the same staleness question under your own control.`},
    {n:'Horizontal sharding by key', how:`Data is partitioned across schemas or clusters by a key such as a player or world identifier, resolved from the environment at startup.`, fit:`Write-heavy games at scale, and games already partitioned by world or region in their design.`, cost:`No cross-shard transactions or joins. Every tool, report and batch job needs the key. Rebalancing is a project.`, alt:`Vertical scale plus functional splitting by table group, which delays sharding without preventing it.`},
    {n:'Queue versus stream', how:`A queue delivers each message to one consumer and forgets it. A stream keeps an ordered log that many consumers read at their own offsets.`, fit:`Queues for work (mail delivery, purchases, notifications). Streams for events several systems care about (analytics, rankings, anti-cheat).`, cost:`Queues lose the history. Streams need offset management, retention sizing and consumers that can fall behind.`, alt:`A scheduled batch over a table, which is simpler and has worse latency.`},
    {n:'Managed versus self-run', how:`The provider runs failover, patching, backups and monitoring for a per-hour premium, or you run all of it yourself.`, fit:`Managed for small teams and anything with an on-call rotation of fewer than three people.`, cost:`Higher unit price, less tuning control, version upgrades on the provider's schedule.`, alt:`Self-run on your own machines, which is cheaper per unit and needs someone who genuinely knows the engine.`}],
  rel:[['metrics-and-success','Every number you report comes out of these stores, at some freshness you should know.'],['live-operations','Restores, lag and queue backlogs are live-operations events before they are technical ones.'],['backend-data-access','Transactions, session runners and delta sync are how the code meets these stores.'],['backend-caching-redis','The cache tier is chosen with the database, not after it.'],['server-scaling','Sharding and fan-out are the same problem seen from the realtime side.']] });
ENGINE('infra-data-stores',{
  godot:{ term:`A client has no database. It has user:// and the rule that res:// is read only in an exported build. Local state is a cache of server truth, written atomically so a crash cannot truncate it.`,
    api:['user:// (writable) vs res:// (read only when exported)','FileAccess.open() / store_string()','DirAccess.rename_absolute()','FileAccess.get_file_as_string()','JSON.stringify() / JSON.parse_string()','ConfigFile'],
    snippet:`extends Node
const PATH := "user://save.json"

func save_atomic(state: Dictionary) -> Error:
\tvar tmp := PATH + ".tmp"
\tvar f := FileAccess.open(tmp, FileAccess.WRITE)
\tif f == null: return FileAccess.get_open_error()
\tf.store_string(JSON.stringify(state))
\tf.close()                              # flush before the rename, never after
\treturn DirAccess.rename_absolute(tmp, PATH)

func load_state() -> Dictionary:
\tif not FileAccess.file_exists(PATH): return {}
\tvar v = JSON.parse_string(FileAccess.get_file_as_string(PATH))
\treturn v if v is Dictionary else {}`,
    pitfall:`Writing to res:// at runtime. In the editor res:// is a folder on disk and the write succeeds, so the code passes every test anyone ran. In an exported build res:// is a read-only archive and the write fails silently or errors on a player's device. Every runtime write goes to user://, and packaged builds have to be tested.`,
    map:`Godot's user:// is Unity's Application.persistentDataPath.` },
  unity:{ term:`Persistent client state lives under Application.persistentDataPath as a file you control. Master data ships as read-only assets and is re-downloadable. PlayerPrefs is a preferences store, not a save system.`,
    api:['Application.persistentDataPath','File.WriteAllText() / File.Replace()','JsonUtility.ToJson() / FromJson<T>()','ScriptableObject for read-only master data','Application.lowMemory','Application.focusChanged'],
    snippet:`public class SaveStore {
    static string Path =>
        System.IO.Path.Combine(Application.persistentDataPath, "save.json");
    public void Save(GameState s) {
        var tmp = Path + ".tmp";
        System.IO.File.WriteAllText(tmp, JsonUtility.ToJson(s));
        if (System.IO.File.Exists(Path)) System.IO.File.Replace(tmp, Path, null);
        else System.IO.File.Move(tmp, Path);   // never write over the live file
    }
    public GameState Load() =>
        System.IO.File.Exists(Path)
            ? JsonUtility.FromJson<GameState>(System.IO.File.ReadAllText(Path))
            : new GameState();
}`,
    pitfall:`Using PlayerPrefs as the save file. It has no atomic write, it is flushed only on Save or a clean quit, and on mobile it is one preferences file a crash can truncate. Players then lose progress in exactly the sessions that crashed, which is the worst correlation available, and the loss is invisible in your own testing.`,
    map:`Unity's temp-file-then-replace save is the same durability argument as a database write-ahead log, at a smaller scale.` },
  note:`A client never talks to the database. What it has is a local store that must survive a crash, plus a copy of master data it must be able to re-download and discard. Treat the device as a cache of server truth and the same three questions come back unchanged: what is authoritative, how stale is this copy, and what happens when the write lands twice.` });
INTERVIEW('infra-data-stores',{
  junior:[
    { q:`What is a read replica and what does it cost you?`,
      a:`A copy of the database that follows the primary asynchronously and serves reads. It costs you freshness: a read can return state from before a write that already committed. So read-after-write paths must go to the primary, and everything else needs a staleness window you have decided on rather than discovered.`,
      follow:`A player buys an item and the inventory screen does not show it. Explain what happened.`,
      red:`Describes replicas as free scaling with no mention of lag.` },
    { q:`What is a shard key, and why does it have to be chosen early?`,
      a:`It is the value that decides which partition a row lives in. It has to be present in every query, every batch job and every admin tool, because without it a read has to ask every shard. Changing it later means rewriting all of those and moving the data, which is why it is effectively permanent. Pick it from the dominant access pattern.`,
      follow:`Your key balances storage perfectly but most reads need two shards. Is it a good key?`,
      red:`Picks a key for even distribution without looking at how the data is read.` },
    { q:`Your queue guarantees at-least-once delivery. What does that mean for your consumer?`,
      a:`It means the same message can arrive twice, so the consumer has to be idempotent. Use a key you control, record it in the same transaction as the effect, and make the write conditional on that key not existing. Then a duplicate is a no-op. Also mention the crash case: the work committed and the acknowledgement did not.`,
      follow:`The consumer sends an email as well as writing a row. How do you keep that safe?`,
      red:`Assumes exactly-once delivery exists, or plans to deduplicate with an in-memory set.` }
  ],
  mid:[
    { q:`How do you decide which reads go to the replica?`,
      a:`Explicitly, path by path, rather than by a global default. Anything the player just changed reads the primary. Listings, rankings, catalogues and other people's profiles can take the lag. Write the rule down where the data access layer expresses it, so a new endpoint has to make the choice instead of inheriting it silently.`,
      follow:`Someone adds a new endpoint and does not think about it. Which way does your code default, and is that the safe direction?`,
      red:`Routes all reads to replicas and treats the resulting bugs as edge cases.` },
    { q:`When would you use a stream instead of a queue?`,
      a:`When more than one system needs the same events, or when you need to replay history. A queue delivers a unit of work to one consumer and forgets it, which suits mail, purchases and notifications. A stream keeps an ordered log with per-consumer offsets, which suits analytics, rankings and anti-cheat all reading the same gameplay events. Name the cost, which is retention sizing and consumers that fall behind.`,
      follow:`A consumer is an hour behind. What do you check, and what does your retention setting decide for you?`,
      red:`Chooses based on which product they have used, with no account of consumers or replay.` },
    { q:`How do you know your backups work?`,
      a:`By restoring one. On a schedule, to a real environment, with the duration recorded and published, because that duration is your worst-case outage. An untested backup is a hope. Also check what the restore does not cover, which is usually the cache, the object storage and anything living only in a queue.`,
      follow:`The restore takes six hours. Is that acceptable, and who decides?`,
      red:`Points at the backup configuration as evidence, having never run a restore.` }
  ],
  senior:[
    { q:`You are two years in and the primary is at its write ceiling. Walk me through the options.`,
      a:`Order by reversibility. Vertical scale and query and index work first, because they are cheap and undoable. Then move write-heavy tables into their own store, which is a functional split and much less invasive than sharding. Then horizontal sharding, which is a project touching every access path, every job and every tool. Say what you would measure to choose, and what you would do in the meantime to buy the time to do it properly.`,
      follow:`You choose to shard. How do you migrate live players without downtime, and what are you prepared to break?`,
      red:`Jumps straight to sharding, or proposes a different database engine as the answer to a design problem.` },
    { q:`How do you design the boundary between the cache and the database so an outage of the cache is survivable?`,
      a:`Make the cache disposable by construction. Every read path must be correct with an empty cache, only slower, and nothing may exist solely in the cache. Then handle the second-order problem, which is the stampede when it comes back empty, with request coalescing and staggered expiry. Say what you deliberately allow to be lost, and say it out loud to the design team, because that is a product decision.`,
      follow:`Your matchmaking ticket pool lives in the cache. Is that a cache or a database?`,
      red:`Says the cache is highly available, which is a vendor claim and not a design.` }
  ] });

T('infra-monitoring',{ d:'infra', t:'Monitoring, incidents and cost', tag:'Time to notice dominates time to recover. Alert on symptoms players feel, and give every page a runbook.',
  what:`Knowing the system works without being told by a player. Metrics with dashboards and alerts, structured logs split by concern, traces that follow one request through the layers, an error and crash reporter with symbols per build, and service level objectives that state what working means as a number. Around it: an on-call rotation, a runbook per alert, a blameless review after each incident, and a cost dashboard, because cost is a signal too.`,
  why:[`Without a written objective you cannot say whether an incident happened. With one, that argument is over before it starts.`,`Time to notice dominates time to recover. An outage a player reports has already cost you the whole notice window.`,`An alert that fires every day trains the team to ignore it, and it will be ignored on the day it matters.`,`Cost drifts upward silently. The bill is the one metric nobody is paged for and everybody is surprised by.`],
  think:{ q:[`What does this service promise as a number, over what window, measured where?`,`For each alert: what does the person do at three in the morning when it fires? If there is no answer, it is a dashboard, not an alert.`,`Can you follow one failing request from the client through the server to the database?`,`Are crash reports readable for the exact build, and is the crash rate tracked per version rather than per day?`,`What fraction of incidents were found by monitoring rather than by a player?`,`Which line of the bill grows with players, and which grows only with time?`],
    trade:[`Tight objectives catch more and page more. Loose objectives are quiet and let a slow degradation pass unnoticed for weeks.`,`High-cardinality metrics answer any question later and cost far more to store than most of those questions are worth.`,`Sampled tracing is cheap and misses the rare request. Full tracing finds it and you pay for every request that was fine.`],
    traps:[`Alerting on causes (CPU is high) instead of symptoms (players cannot log in). Causes change, symptoms are what you promised.`,`One log stream at one level, so nothing can be found when it matters.`,`Dashboards nobody opens and alerts nobody owns.`,`An on-call rotation with one name in it.`,`Measuring average latency. The average stays fine while a tenth of your players time out.`,`A post-incident action list with no owner and no date, which is a list of things that will not happen.`],
    good:[`The team hears about problems from a page, not from a forum thread.`,`Every alert links to a runbook, and the runbook has been used and corrected.`],
    bad:[`The alert channel is muted.`,`Nobody can say what last month cost or why it changed.`] },
  how:[`Pick two or three player-visible objectives per service: availability, latency at a high percentile, error rate. Write them as numbers with a window.`,`Alert on symptoms. Page only for the objectives and send everything else to a dashboard or a ticket queue.`,`Write a runbook for every page: what it means, what to check first, what to do, who to escalate to.`,`Split logs by concern (application, errors, database, cache, realtime) with their own levels, and carry one request identifier through all of them.`,`Trace the paths that matter end to end, with spans around database, cache and third-party calls, and name transactions by route.`,`Keep the gameplay analytics event stream separate from operational logs, append-only, with personal data hashed at the boundary.`,`Review the cost dashboard on the same cadence as the performance one, and attribute each significant line to a decision someone made.`,`Run a blameless review after every incident with owned, dated actions, and check those actions at the start of the next one.`],
  ai:{ yes:[`Turn a service description into candidate objectives and the alerts that would defend them.`,`Write the runbook skeleton for an alert you describe, including the first three checks.`,`Cluster error logs and name the first real cause rather than the loudest symptom.`,`Say which spans are missing from a trace you paste, and what that hides.`],
       no:[`Decide the objective. It is a promise to players and to the business.`,`Be on call.`,`Interpret a metric without the context of what changed and when.`] },
  prompts:[{l:'Objectives and alerts',p:`Here is a service, what players do with it, and what breaks when it degrades: [DESCRIPTION]. Propose two or three player-visible service level objectives as numbers with windows, and for each the alert that defends it. For every alert give: the symptom it fires on, why it is not a cause, the first three runbook steps, and what should happen if nobody acknowledges it. Reject any alert you cannot attach a human action to.`},
    {l:'Cost attribution',p:`Here are our infrastructure cost lines for the last three months with player counts: [DATA]. For each line over [THRESHOLD], say whether it scales with players, with data volume, or only with time, and which engineering decision drives it. Identify the two lines most likely to be waste and the measurement that would confirm it. Do not suggest savings you cannot tie to a line.`}],
  verify:[`Does each proposed alert have a human action, or is it just a number with a threshold?`,`Are the objectives player-visible, or are they machine metrics dressed up as promises?`,`Did it propose a percentile or an average? An average is not an objective.`],
  test:[`Turn off a dependency in staging and measure how long until an alert fires. Existence is not the question, latency is.`,`Count incidents found by monitoring versus reported by players, per quarter. That ratio is the honest score.`,`Take last month's bill and attribute every line over a threshold to a decision someone made. Anything unattributed is waste until proven otherwise.`],
  tech:[
    {n:'Metrics with dashboards and alert rules', how:`Services expose counters and histograms, a collector scrapes them, and alert rules evaluate expressions over the series.`, fit:`Availability, rate, error and latency signals. The backbone of any monitoring setup.`, cost:`Cardinality is the bill. One label with unbounded values (a player id) can multiply storage without warning.`, alt:`Vendor monitoring that hides the collection, costs more per series and needs less operation.`},
    {n:'Distributed tracing and APM', how:`A trace identifier is propagated through every call, with spans around database, cache and external calls and transactions named by route.`, fit:`Finding which layer a latency problem lives in, and untangling a slow path that crosses services.`, cost:`Instrumentation effort, per-request overhead, and a sampling decision that determines whether you catch rare failures.`, alt:`Structured logs with a shared request identifier, which answers the same question more slowly.`},
    {n:'Log aggregation with split streams', how:`Each concern writes its own stream at its own level, shipped to a searchable store, all carrying the request identifier.`, fit:`Incident investigation, and any question that metrics cannot answer because it needs the detail.`, cost:`Volume is the bill, and retention is a real decision. Personal data must be redacted at the boundary.`, alt:`Keeping logs on the machine, which is free and useless the moment the machine is replaced.`},
    {n:'Service level objectives with error budgets', how:`A numeric target over a window defines working, and the remaining budget for failure decides whether you ship features or reliability.`, fit:`Teams that argue about whether something was an incident, or about shipping speed versus stability.`, cost:`Only works if leadership honours the budget. Without that it is a number on a wall.`, alt:`Threshold alerts with no budget, which is simpler and gives you no way to decide the trade.`}],
  rel:[['metrics-and-success','Operational signals and design signals are read by the same team, with the same discipline.'],['live-operations','Running a live game is mostly noticing things early.'],['backend-observability','Logging, tracing and profiling are how a service becomes observable in the first place.'],['infra-deploy-models','A deploy is the most common cause of the incident you are watching for.'],['lead-incidents','Alerts, runbooks and blameless reviews are a leadership practice with tooling attached.']] });
ENGINE('infra-monitoring',{
  godot:{ term:`The client reports its own health: frame time spikes as a custom monitor, breadcrumbs for the last actions, and errors pushed with the device model attached so a crash report is readable without the device in your hand.`,
    api:['Performance.add_custom_monitor()','Performance.get_monitor()','Engine.get_frames_per_second()','OS.get_model_name()','OS.get_static_memory_usage()','push_error() / get_stack()'],
    snippet:`extends Node
var _worst := 0.0
var _crumbs: Array[String] = []
func _ready() -> void:
\tPerformance.add_custom_monitor("game/worst_frame_ms", func(): return _worst)

func _process(delta: float) -> void:
\t_worst = maxf(_worst, delta * 1000.0)     # spikes, not the average

func crumb(what: String) -> void:
\t_crumbs.append(what)
\tif _crumbs.size() > 32: _crumbs.pop_front()

func report(err: String) -> void:
\tpush_error("%s | %s | %s" % [err, OS.get_model_name(), ", ".join(_crumbs)])`,
    pitfall:`Judging client performance by Engine.get_frames_per_second(). It is an average over recent frames, so it stays reassuring while the hitches players actually complain about pass through it invisibly. Sample frame time every frame and keep the high percentile and the worst value, which is the client equivalent of never alerting on an average latency.`,
    map:`Godot's Performance.add_custom_monitor is Unity's ProfilerRecorder plus a custom counter.` },
  unity:{ term:`A crash reporter hooks the threaded log callback, keeps a bounded breadcrumb ring, and tags every report with the build identity. Frame and memory counters come from ProfilerRecorder, which works in a player build.`,
    api:['Application.logMessageReceivedThreaded','Application.lowMemory','ProfilerRecorder.StartNew()','ProfilerCategory','Application.version','SystemInfo.deviceModel'],
    snippet:`public class ClientTelemetry : MonoBehaviour {
    readonly Queue<string> crumbs = new();
    ProfilerRecorder mainThread;
    void OnEnable() {
        mainThread = ProfilerRecorder.StartNew(ProfilerCategory.Internal, "Main Thread", 15);
        Application.logMessageReceivedThreaded += OnLog;   // background threads too
        Application.lowMemory += () => Crumb("lowMemory");
    }
    void OnDisable() => Application.logMessageReceivedThreaded -= OnLog;
    public void Crumb(string s) { crumbs.Enqueue(s); if (crumbs.Count > 32) crumbs.Dequeue(); }
    void OnLog(string msg, string stack, LogType type) {
        if (type != LogType.Exception) return;
        Report(Application.version, SystemInfo.deviceModel, msg, stack, crumbs.ToArray());
    }
}`,
    pitfall:`Subscribing to Application.logMessageReceived instead of the threaded variant, then calling Unity API inside the handler. The non-threaded event misses exceptions raised off the main thread, and any UnityEngine call from a background thread throws inside your crash reporter, so the reporter is the thing that fails during the crash it exists to record.`,
    map:`Unity's crash rate per build is the client's service level objective, the way error rate per route is the server's.` },
  note:`The backend answers whether the service is up. Only the client can answer whether the game is playable on this device, and it answers with the same instruments: crash rate per build, frame time percentiles per device tier, and the memory ceiling. They need the same three things a server objective needs. A stamped build identity, breadcrumbs leading to the failure, and somebody whose job it is to look.` });
INTERVIEW('infra-monitoring',{
  junior:[
    { q:`What is the difference between a metric, a log and a trace?`,
      a:`A metric is an aggregate number over time, cheap to store and good for alerting. A log is a discrete event with detail, good for investigating one case. A trace follows a single request across services and shows where the time went. You alert on metrics, investigate with logs, and find which layer is at fault with traces. Say which question each one answers.`,
      follow:`Which of the three is the one that gets expensive fastest, and why?`,
      red:`Describes them as three views of the same data with no cost or use difference.` },
    { q:`Should you alert on CPU usage?`,
      a:`Usually not as a page. CPU is a cause, and causes change. Page on the symptom the player feels: requests failing, logins timing out, latency at a high percentile past your objective. High CPU with everything still fast is not an incident. Keep the cause metrics on a dashboard for the investigation that follows the page.`,
      follow:`What would you page on for a login service, in numbers?`,
      red:`Lists resource thresholds as alerts and never mentions what the player experiences.` },
    { q:`Why do people say never to alert on average latency?`,
      a:`Because the average hides the tail. If one request in ten takes thirty seconds and the rest are fast, the average looks fine and a tenth of your players are failing. Use a high percentile, and say which one and over what window. The average is useful for capacity, not for whether the service is keeping its promise.`,
      follow:`Which percentile would you pick for a login endpoint, and what does that choice say about who you are willing to fail?`,
      red:`Suggests using the maximum instead, which alerts on every outlier.` }
  ],
  mid:[
    { q:`Define a service level objective for something you have actually run.`,
      a:`Give a number, a window and a measurement point. For example, a percentage of login requests succeeding under a latency bound over a rolling month, measured at the edge rather than inside the service. Then say what it is for: deciding whether something was an incident, and deciding whether the next sprint is features or reliability. An objective nobody acts on is decoration.`,
      follow:`You are about to burn the whole budget for the month. What actually changes on the team?`,
      red:`Quotes a number of nines with no window, no measurement point and no consequence.` },
    { q:`An alert fires at three in the morning. What should the person receiving it have?`,
      a:`A runbook that says what the alert means, the first three things to check, the actions they are authorised to take, and who to escalate to. If no such runbook exists, the alert should not be a page. Add the practical parts: a link to the dashboard, the current deploy version, and how to confirm it has recovered.`,
      follow:`Your runbook says to restart the service. What does that hide, and how would you find out?`,
      red:`Expects the on-call engineer to work it out from dashboards, which is how a fifteen minute incident becomes two hours.` },
    { q:`How do you separate gameplay analytics from operational logging?`,
      a:`Different pipelines, different retention, different consumers. Analytics is an append-only event stream with a defined schema per event, personal data hashed at the boundary, feeding aggregation and design questions. Operational logging is for debugging a failure, split by concern, carrying a request identifier, with shorter retention. Mixing them means either your analytics is noisy or your logs are a compliance problem.`,
      follow:`A designer asks for a new analytics event. Who owns the schema, and what breaks if it changes?`,
      red:`Reads design questions out of application logs and calls it analytics.` }
  ],
  senior:[
    { q:`How do you measure whether your monitoring is any good?`,
      a:`Count how many incidents were found by monitoring rather than reported by a player, per quarter, and track the time to notice separately from the time to recover. Then audit the alerts: how many fired, how many were acted on, how many were ignored. An alert with a low action rate is training the team to ignore the channel, and should be deleted or fixed.`,
      follow:`Three alerts fired eighty times last month and nobody acted on any of them. What do you do with them?`,
      red:`Measures coverage by counting dashboards and alert rules.` },
    { q:`Infrastructure cost is climbing and nobody owns it. How do you get control?`,
      a:`Attribute before you cut. Split the bill by line and classify each as scaling with players, with data volume, or only with time. Anything unattributed is waste until proven otherwise. Then put the cost dashboard on the same review cadence as the performance one and give each significant line an owner. Say which decisions are usually behind the biggest lines, which are retention, cardinality, egress and idle capacity.`,
      follow:`Your observability bill is now a quarter of your infrastructure spend. Is that wrong, and how would you decide?`,
      red:`Proposes turning off monitoring or shortening retention across the board without attribution.` }
  ] });
