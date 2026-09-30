item | kind | verdict | change
multiplayer-design Godot Matching | code | ok | none
multiplayer-design Unity Matching | code | ok | none
multiplayer-design Elo/TrueSkill facts | fact | ok | none
multiplayer-design inbound link | content | fix | added reverse link from server-matchmaking
audio-implementation Godot duck | code | fix | duck restored bus to 0 dB, overwriting slider; now relative to _base_db; slider clamped
audio-implementation Unity duck | code | fix | same, baseDb added
audio-implementation FMOD claim | fact | fix | unverifiable thresholds removed
audio-implementation Wwise claim | fact | fix | unverifiable 200-asset claim softened
audio-implementation Godot max_polyphony/sidechain | fact | ok | matches docs
monetisation-design Godot/Unity gacha | code | ok | none
monetisation-design Belgian study | fact | fix | unsupported "82 of 100, May 2022" softened
monetisation-design Apple/Google/Dutch/ESRB/PEGI/China | fact | ok | primary pages not fetched; wording matches known secondary sources
careers-game-coding-interviews | content | ok | none
Source pass 2
Apple 3.1.1 odds before purchase | fact | ok (opened) | none
Google Play odds policy | fact | ok wording (opened); page gives no date, May 2019 rests on pocketgamer | none
ESRB Includes Random Items April 2020 | fact | ok (opened) | none
Dutch ruling 9 Mar 2022 | fact | fix | akd.eu summary: packs not a separate game of chance; penalty payments not "fine"; raadvanstate 403
PEGI, Belgian, China | fact | unreachable (404/403) | flagged as secondary-only in text
Godot max_polyphony, bus, get/set_bus_volume_db, get_bus_index -1 | code | ok; pitfall wording softened (docs do not state error)
Unity SetFloat returns false if not exposed | code | ok; note: avoid calling in Awake/OnEnable, and snapshots stop controlling the parameter
