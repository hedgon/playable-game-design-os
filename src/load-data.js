// The full data, evaluated from the sources in Node, for checks that need the
// long fields the page only loads per page (worked examples, comparison
// sections, checkpoint solutions, Go snippets). The page's own data is the light
// index (see content-build.js), so a check must not read long fields from it.
const fs = require('fs'), path = require('path');
const { DATA } = require('./manifest.js');
module.exports = function loadData() {
  const src = DATA.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
  return new Function(src + '\nreturn { TOPICS, REFERENCE_GAMES, PATHS, CASE_STUDIES, PLATFORMS, ENGINES, COMPARISONS, SMELLS, CHECKLISTS, PROMPT_TEMPLATES, GLOSSARY };')();
};
