import Random from "../util/Random";
import rawDataEn from "../assets/json/haiku-phrases-en.json";
import rawDataFr from "../assets/json/haiku-phrases-fr.json";
import { stemmer } from "porter-stemmer";

const tokenize = (line) =>
  line
    .replace(/\'[a-z]+/g, "")
    .replace(/\-/g, " ")
    .split(/\s+/g)
    .filter(Boolean);

const stopwordStems = `of,the,on,for,and,in,a,from,at`
  .split(",")
  .map((t) => stemmer(t));

export default function createHaikuGen() {
  const data = rawDataEn;
  const random = Random();

  const tokens = Object.keys(data);
  // console.log("tokens", tokens);

  return {
    generate({ tokens: curTokens, ignore = [] } = {}) {
      curTokens = curTokens || this.randomTokens();
      let state = [];
      curTokens.forEach((token, stanza) => {
        const line = this.generateStanza({ token, stanza, state, ignore });
        state.push(line);
      });
      return state;
    },
    randomTokens() {
      return random.shuffle(tokens).slice(0, 3);
    },
    generateStanza({ stanza, token, state = [], ignore = [] }) {
      const en = generateStanzaLocalized({
        lang: "en",
        stanza,
        token,
        state: state.map((s) => s.en),
        ignore: ignore.map((s) => s.en),
      });
      const fr = generateStanzaLocalized({
        // NOTE: French skips the state/ignore functionality as there's so few lines
        lang: "fr",
        stanza,
        token,
      });
      return {
        en,
        fr,
      };
    },
  };

  function generateStanzaLocalized({
    lang = "en",
    stanza,
    token,
    state = [],
    ignore = [],
  }) {
    if (stanza == null || (stanza < 0 && stanza > 2))
      throw new Error(`Must specify stanza index 0, 1 or 2 `);
    if (!token) throw new Error(`Must specify token`);
    const data = lang === "en" ? rawDataEn : rawDataFr;
    if (!(token in data)) throw new Error(`No haiku data for token ${token}`);

    // 1 - choose all available stanza phrases from data + token
    const phrases = data[token][stanza].map((t) => t.trim());

    // 2 - if we have some previous state (i.e. previous line(s) of poem)
    // then we combine and stem, and any phrases that have matches are ignored
    const stateStems = tokenize(state.join(" ")).map((t) => stemmer(t));
    const stateKeywords = stateStems.filter(
      (stem) => !stopwordStems.includes(stem)
    );

    // console.log("kw", stateKeywords);

    let bestPhrases = phrases.slice();
    if (stateStems.length) {
      // 3 - Remove phrases that have a non-stopword match
      // with previous stems
      bestPhrases = filterThreshold(
        bestPhrases,
        (phrase) => {
          return !stateKeywords.some((stem) => phrase.includes(stem));
        },
        2
      );
    }

    // 4 - remove any phrases that exactly match a previously picked phrase
    const ignoreLines = ignore.flat();
    const old = bestPhrases.slice();
    bestPhrases = filterThreshold(
      bestPhrases,
      (phrase) => {
        return !ignoreLines.includes(phrase);
      },
      2
    );
    // if (old.length !== bestPhrases.length) {
    //   console.log(
    //     "got some removed",
    //     filterThreshold(
    //       bestPhrases,
    //       (phrase) => {
    //         return ignoreLines.includes(phrase);
    //       },
    //       2
    //     )
    //   );
    // }

    // safeguard to avoid repetitive results
    bestPhrases = bestPhrases.length >= 2 ? bestPhrases : phrases;

    return random.pick(bestPhrases);
  }

  function filterThreshold(lines, filterFn, minThreshold = 1) {
    const newLines = lines.filter(filterFn);
    return newLines.length > minThreshold ? newLines : lines;
  }
}
