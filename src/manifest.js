// Single source of truth for the build: which source files exist and in what
// order. build.js, validate.js, check-layout.js and inventory.js all read
// this, so adding or renaming a data file is a one-line change here.
// Data order matters: the registry and schema come first, then diagnostics,
// AI workflow and references, then one file per domain in map order, then
// case studies and learning paths, which only reference earlier data.
const HEAD = '01-head.html';
const DATA = [
  '05-registry.js',
  '10-schema.js',
  '12-diagnostics.js',
  '13-ai-workflow.js',
  '14-references.js',
  '20-topics-player.js',
  '21-topics-experience.js',
  '22-topics-core.js',
  '23-topics-systems.js',
  '24-topics-content.js',
  '25-topics-level.js',
  '26-topics-ux.js',
  '27-topics-narrative.js',
  '28-topics-presentation.js',
  '29-topics-product.js',
  '30-topics-production.js',
  '31-topics-ai.js',
  '32-topics-gameai.js',
  '33-topics-studio.js',
  '34-topics-backend.js',
  '35-topics-infra.js',
  '36-topics-server.js',
  '37-topics-management.js',
  '38-topics-leadership.js',
  '40-cases.js',
  '41-case-systems-a.js',
  '42-case-systems-b.js',
  '43-case-systems-c.js',
  '50-paths.js',
  '51-paths-engineering.js'
];
// DIAGRAM draws the topic diagrams, FLOW the workflow charts, GRAPH the mind
// maps. All are pure renderers; DIAGRAM hands flow-shaped specs to FLOW at
// render time, and the load order matches the file numbering the browser and
// the checkers share.
const DIAGRAM = '87-diagrams.js';
const FLOW = '88-flow.js';
const GRAPH = '89-graph.js';
const APP = ['90-app.js', '91-map.js', '92-ideas.js', '93-lab.js'];
const TAIL = '99-tail.js';
const ORDER = [HEAD, ...DATA, DIAGRAM, FLOW, GRAPH, ...APP, TAIL];
module.exports = { HEAD, DATA, DIAGRAM, FLOW, GRAPH, APP, TAIL, ORDER };
