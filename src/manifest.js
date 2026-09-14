// Single source of truth for the build: which source files exist and in what
// order. build.js, validate.js and check-layout.js all read this, so adding or
// renaming a data file is a one-line change here instead of four.
const HEAD = '01-head.html';
const DATA = [
  '10-data-domains.js',
  '11-data-topics-systems.js',
  '12-data-topics-ux.js',
  '13-data-topics-product-ai.js',
  '14-data-diagnostics.js',
  '15-data-ai.js',
  '16-data-references.js',
  '17-data-topics-gameai.js',
  '18-data-tech.js',
  '19-data-tech.js',
  '20-data-tech.js',
  '21-data-tech.js',
  '22-data-practice.js',
  '23-data-practice.js',
  '24-data-backend.js',
  '25-data-infra.js',
  '26-data-server.js',
  '27-data-management.js',
  '28-data-leadership.js',
  '29-data-experience.js',
  '30-data-engine-a.js',
  '31-data-engine-b.js',
  '32-data-engine-c.js',
  '33-data-experience-systems-a.js',
  '34-data-experience-systems-b.js',
  '35-data-experience-systems-c.js',
  '40-data-interview-a.js',
  '41-data-interview-b.js',
  '42-data-interview-c.js'
];
const GRAPH = '89-graph.js';
const APP = ['90-app.js', '91-map.js', '92-ideas.js', '93-lab.js'];
const TAIL = '99-tail.js';
const ORDER = [HEAD, ...DATA, GRAPH, ...APP, TAIL];
module.exports = { HEAD, DATA, GRAPH, APP, TAIL, ORDER };
