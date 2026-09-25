/* =====================================================================
   ENGINES AND TOOLS
   One guide per engine or tool, walking the same eight stages: what it is,
   how it is built, the editor, the content pipeline, building and
   deploying, licensing and cost, working with AI, and interview questions.
   Stages share the platform guides' parts: `points`, dated `facts`, an
   optional `diagram`, `deploy` steps `{t, d, shot?}` drawn as a numbered
   walkthrough, `shots` (each image credited with its licence, see
   IMAGE_LICENCES), and `iv` interview items `{q, a, follow, red}`.
   `glance` is licence and cost, languages, and target platforms.
   Engine tabs inside topics stay Godot and Unity; these guides cover the
   rest of an engine, and say so where it matters.
   ===================================================================== */
const ENGINE_STAGES = [
  ['what', 'What it is and who uses it'], ['architecture', 'How it is built'], ['editor', 'The editor'],
  ['pipeline', 'Content pipeline'], ['deploy', 'Building and deploying'], ['licence', 'Licensing and cost'],
  ['ai', 'Working with AI'], ['interview', 'Interview questions']
];
const ENGINES = [];
/** @param {string} id @param {any} o */
function ENGINE_GUIDE(id, o){ o.id = id; ENGINES.push(o); }
