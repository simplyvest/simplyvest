const Sequencer = require("@jest/test-sequencer").default;

class AlphaSequencer extends Sequencer {
  sort(tests) {
    return Array.from(tests).toSorted((a, b) => a.path.localeCompare(b.path));
  }
}

module.exports = AlphaSequencer;
