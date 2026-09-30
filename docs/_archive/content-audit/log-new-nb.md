# Log nb: new topics

No game data or path files edited. Rel links added: audio-and-music, business-model, ethics-and-responsibility, social-experience, careers-interviewing-outside-games, craft-gameplay-math.

## audio-implementation
- Domain/level: presentation, intermediate
- Path: game-audio or an art/feel path, stage on implementation (P2 to pick); do: build a Music/SFX/Voice bus layout, add a duck and a settings slider, measure voice count in the loudest scene; 90 min.
- Games: none confidently (sound lens tags need audio-implementation detail; not found).
- Sources (facts): https://www.fmod.com/legal, https://www.audiokinetic.com/pricing, https://docs.godotengine.org/en/stable/classes/class_audioeffectcompressor.html

### godot snippet
```
extends Node                       # autoload; the layout needs a bus named "Music"
var _bus := -1
var _tween: Tween

func _ready() -> void:
	_bus = AudioServer.get_bus_index("Music")
	assert(_bus != -1, "Add a Music bus in the Audio panel")

func duck(on: bool) -> void:
	if _tween:
		_tween.kill()                  # a new duck replaces a running fade
	_tween = create_tween()
	var to_db := -12.0 if on else 0.0
	var secs := 0.25 if on else 1.0    # fast attack, slow release
	_tween.tween_method(func(db: float) -> void: AudioServer.set_bus_volume_db(_bus, db),
			AudioServer.get_bus_volume_db(_bus), to_db, secs)

func set_music_slider(v: float) -> void:   # v is 0..1 from a UI slider
	AudioServer.set_bus_volume_db(_bus, linear_to_db(v))
```

### unity snippet
```
using System.Collections;
using UnityEngine;
using UnityEngine.Audio;

public class MusicDucker : MonoBehaviour {
    [SerializeField] AudioMixer mixer;          // must expose a float named "MusicVol"
    Coroutine fade;

    public void Duck(bool on) {
        if (fade != null) StopCoroutine(fade);
        fade = StartCoroutine(Fade(on ? -12f : 0f, on ? 0.25f : 1f));   // fast attack, slow release
    }

    IEnumerator Fade(float target, float secs) {
        if (!mixer.GetFloat("MusicVol", out float from)) yield break;   // not exposed
        for (float t = 0f; t < secs; t += Time.unscaledDeltaTime) {
            mixer.SetFloat("MusicVol", Mathf.Lerp(from, target, t / secs));
            yield return null;
        }
        mixer.SetFloat("MusicVol", target);
    }

    public void SetMusicSlider(float v) =>          // v is 0..1 from a UI slider
        mixer.SetFloat("MusicVol", Mathf.Log10(Mathf.Max(v, 0.0001f)) * 20f);
}
```
## monetisation-design
- Domain/level: product, advanced
- Path: product/live-service path, stage after business-model; do: write the rules table for one random reward and run the effective-rate simulation, then list per-market rules; 120 min.
- Games (business lens, add monetisation-design): fortnite ("sells only cosmetics and a Battle Pass..."), dota-2 (cost: "Valve then dropped Battle Passes altogether, saying most players never bought one"), overwatch (evidence: sold cosmetic loot boxes, then free-to-play Overwatch 2), baldurs-gate-3 (claim: launched with no microtransactions, loot boxes or battle pass). Not applied.
- Sources (facts): https://developer.apple.com/app-store/review/guidelines/#in-app-purchase, https://www.pocketgamer.biz/google-play-developers-must-now-disclose-loot-box-odds, https://www.pcgamesn.com/belgium-loot-box-laws-study, https://akd.eu/insights/loot-boxes-are-legal-in-the-netherlands, https://reedsmith.com/en/perspectives/2020/04/esrb-and-pegi-introduce-loot-box-warnings, https://www.pcgamesn.com/loot-box-odds-china
- Also consulted (not all cited): Fenwick Apple odds note, toucharcade 2017-12-21, pocketgamer.biz Google Play 2019, gameinformer 2018-04-25 Belgium, twobirds/akd Dutch ruling, reedsmith ESRB/PEGI, nikopartners and videogames.si.com China 2023 draft.

### godot snippet
```
class_name Gacha
extends RefCounted
const BASE := 0.006          # example numbers, not a recommendation
const SOFT_START := 74
const HARD := 90
const STEP := 0.06

static func rate(pity: int) -> float:    # pity = failed pulls since the last top prize
	var n := pity + 1
	if n >= HARD: return 1.0
	if n >= SOFT_START: return minf(1.0, BASE + STEP * (n - SOFT_START + 1))
	return BASE

static func effective_rate(pulls: int, rng: RandomNumberGenerator) -> float:
	var pity := 0
	var wins := 0
	for i in pulls:
		if rng.randf() < rate(pity):
			wins += 1
			pity = 0
		else:
			pity += 1
	return float(wins) / pulls
```

### unity snippet
```
using UnityEngine;

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
}
```
## multiplayer-design
- Domain/level: core, intermediate
- Path: design path after core-loop/skill-and-mastery, or the multiplayer/live path before server-matchmaking; do: write roles, counters and a matching rule for a 4v4 prototype and simulate the queue; 90 min.
- Games (gameplay lens, add multiplayer-design): among-us (claim: roles leak through behaviour, asymmetry in private cues), dota-2 (principle: tax a map-wide powerful item with unavoidable information; counterplay), counter-strike-2 (cost: free accounts feed smurfing that Prime only partly filters). Not applied.
- Sources (facts): https://en.wikipedia.org/wiki/Elo_rating_system, https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/

### godot snippet
```
class_name Matching
extends RefCounted

static func expected(a: float, b: float) -> float:      # chance a beats b, Elo scale
	return 1.0 / (1.0 + pow(10.0, (b - a) / 400.0))

static func update(r: float, opp: float, won: bool, k := 32.0) -> float:
	return r + k * ((1.0 if won else 0.0) - expected(r, opp))

static func window(wait_s: float) -> float:              # widens the longer you wait
	return 100.0 + 25.0 * wait_s

static func pick(me: float, wait_s: float, pool: Array[float]) -> int:
	var best := -1                                       # -1: nobody fits yet
	var gap := window(wait_s)
	for i in pool.size():
		var d := absf(pool[i] - me)
		if d <= gap:
			gap = d
			best = i
	return best
```

### unity snippet
```
using System.Collections.Generic;
using UnityEngine;

public static class Matching {
    public static float Expected(float a, float b) =>     // chance a beats b, Elo scale
        1f / (1f + Mathf.Pow(10f, (b - a) / 400f));

    public static float Update(float r, float opp, bool won, float k = 32f) =>
        r + k * ((won ? 1f : 0f) - Expected(r, opp));

    public static float Window(float waitSeconds) =>      // widens the longer you wait
        100f + 25f * waitSeconds;

    public static int Pick(float me, float waitSeconds, IReadOnlyList<float> pool) {
        int best = -1;                                    // -1: nobody fits yet
        float gap = Window(waitSeconds);
        for (int i = 0; i < pool.Count; i++) {
            float d = Mathf.Abs(pool[i] - me);
            if (d <= gap) { gap = d; best = i; }
        }
        return best;
    }
}
```
## careers-game-coding-interviews
- Domain/level: careers, intermediate
- Path: engineering interview prep, stage on coding and math practice; do: three timed problems (closest enemy, grid BFS/A*, object pool) plus ten gameplay math questions aloud; 120 min per week.
- Games: none (careers domain).
- Sources (facts): https://gameprogrammingpatterns.com/
