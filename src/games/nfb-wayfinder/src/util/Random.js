// import PRNG from "./prng-mersenne";
import getConfig from "../config";
import defined from "./defined";
import PCG, { getRandomState } from "./prng-pcg";
import queryString from "./query-string";

const embed = getConfig().embed;

//[39783, 27946, 21768, 27541]
// 9103, 33041, 40850, 9357
// We can use a single fixed state to generate
// all the random numbers in the game.
const TRUE_RANDOM = !embed && !queryString.deterministic;
const SEED_STATE = new Uint16Array(
  embed ? [39783, 27946, 21768, 27541] : [9697, 37140, 38490, 15272]
  );
console.log("Random Seed:", [...SEED_STATE]);
const SEED_PCG = PCG(SEED_STATE);

export default function Random() {
  let seed = null;
  // console.log("GOT RANDOM", seed);
  if (seed == null) seed = Random.nextSeed();
  const prng = PCG(seed);
  let _nextGaussian = null;
  let _hasNextGaussian = false;

  return {
    seed(v) {
      prng.seed(v);
      _nextGaussian = null;
      _hasNextGaussian = false;
    },
    value,
    valueNonZero: valueNonZero,
    sign: sign,
    boolean: boolean,
    chance: chance,
    range: range,
    rangeFloor: rangeFloor,
    pick: pick,
    shuffle: shuffle,
    onCircle: onCircle,
    insideCircle: insideCircle,
    onSphere: onSphere,
    insideSphere: insideSphere,
    quaternion: quaternion,
    weighted: weighted,
    weightedSet: weightedSet,
    weightedSetIndex: weightedSetIndex,
    deck,
    gaussian: gaussian,
  };

  function value() {
    return prng.next();
  }

  function valueNonZero() {
    var u = 0;
    while (u === 0) u = value();
    return u;
  }

  function sign() {
    return boolean() ? 1 : -1;
  }

  function boolean() {
    return value() > 0.5;
  }

  function chance(n) {
    n = defined(n, 0.5);
    if (typeof n !== "number") throw new TypeError("expected n to be a number");
    return value() < n;
  }

  function range(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== "number" || typeof max !== "number") {
      throw new TypeError("Expected all arguments to be numbers");
    }

    return value() * (max - min) + min;
  }

  function rangeFloor(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }

    if (typeof min !== "number" || typeof max !== "number") {
      throw new TypeError("Expected all arguments to be numbers");
    }

    return Math.floor(range(min, max));
  }

  function pick(array) {
    if (array.length === 0) return undefined;
    return array[rangeFloor(0, array.length)];
  }

  function shuffle(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError("Expected Array, got " + typeof arr);
    }

    var rand;
    var tmp;
    var len = arr.length;
    var ret = arr.slice();
    while (len) {
      rand = Math.floor(value() * len--);
      tmp = ret[len];
      ret[len] = ret[rand];
      ret[rand] = tmp;
    }
    return ret;
  }

  function onCircle(radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var theta = value() * 2.0 * Math.PI;
    out[0] = radius * Math.cos(theta);
    out[1] = radius * Math.sin(theta);
    return out;
  }

  function insideCircle(radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    onCircle(1, out);
    var r = radius * Math.sqrt(value());
    out[0] *= r;
    out[1] *= r;
    return out;
  }

  function onSphere(radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var phi = u;
    var theta = Math.acos(v);
    out[0] = radius * Math.sin(theta) * Math.cos(phi);
    out[1] = radius * Math.sin(theta) * Math.sin(phi);
    out[2] = radius * Math.cos(theta);
    return out;
  }

  function insideSphere(radius, out) {
    radius = defined(radius, 1);
    out = out || [];
    var u = value() * Math.PI * 2;
    var v = value() * 2 - 1;
    var k = value();

    var phi = u;
    var theta = Math.acos(v);
    var r = radius * Math.cbrt(k);
    out[0] = r * Math.sin(theta) * Math.cos(phi);
    out[1] = r * Math.sin(theta) * Math.sin(phi);
    out[2] = r * Math.cos(theta);
    return out;
  }

  function quaternion(out) {
    out = out || [];
    var u1 = value();
    var u2 = value();
    var u3 = value();

    var sq1 = Math.sqrt(1 - u1);
    var sq2 = Math.sqrt(u1);

    var theta1 = Math.PI * 2 * u2;
    var theta2 = Math.PI * 2 * u3;

    var x = Math.sin(theta1) * sq1;
    var y = Math.cos(theta1) * sq1;
    var z = Math.sin(theta2) * sq2;
    var w = Math.cos(theta2) * sq2;
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  }

  function weightedSet(set) {
    set = set || [];
    if (set.length === 0) return null;
    return set[weightedSetIndex(set)].value;
  }

  function weightedSetIndex(set) {
    set = set || [];
    if (set.length === 0) return -1;
    return weighted(
      set.map(function (s) {
        return s.weight;
      })
    );
  }

  function weighted(weights) {
    weights = weights || [];
    if (weights.length === 0) return -1;
    var totalWeight = 0;
    var i;

    for (i = 0; i < weights.length; i++) {
      totalWeight += weights[i];
    }

    if (totalWeight <= 0) throw new Error("Weights must sum to > 0");

    var random = value() * totalWeight;
    for (i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return 0;
  }

  function gaussian(mean, standardDerivation) {
    mean = defined(mean, 0);
    standardDerivation = defined(standardDerivation, 1);

    // https://github.com/openjdk-mirror/jdk7u-jdk/blob/f4d80957e89a19a29bb9f9807d2a28351ed7f7df/src/share/classes/java/util/Random.java#L496
    if (_hasNextGaussian) {
      _hasNextGaussian = false;
      var result = _nextGaussian;
      _nextGaussian = null;
      return mean + standardDerivation * result;
    } else {
      var v1 = 0;
      var v2 = 0;
      var s = 0;
      do {
        v1 = value() * 2 - 1; // between -1 and 1
        v2 = value() * 2 - 1; // between -1 and 1
        s = v1 * v1 + v2 * v2;
      } while (s >= 1 || s === 0);
      var multiplier = Math.sqrt((-2 * Math.log(s)) / s);
      _nextGaussian = v2 * multiplier;
      _hasNextGaussian = true;
      return mean + standardDerivation * (v1 * multiplier);
    }
  }

  function deck(array) {
    array = shuffle(array);
    let index = 0;
    return {
      get array() {
        return array;
      },
      get index() {
        return index;
      },
      get current() {
        return array[index];
      },
      reset() {
        this.shuffle();
        index = 0;
      },
      next() {
        let cur = this.current;
        index++;
        if (index > array.length - 1) {
          this.shuffle();
          index = 0;
        }
        return cur;
      },
      nextIndex() {
        let cur = index;
        index++;
        if (index > array.length - 1) {
          this.shuffle();
          index = 0;
        }
        return cur;
      },
      shuffle() {
        array = shuffle(array);
      },
    };
  }
}

Random.nextSeed = function nextSeed(out = new Uint16Array(4)) {
  for (let i = 0; i < 4; i++) {
    out[i] = TRUE_RANDOM ? Math.random() * 0x10000 : SEED_PCG.next() * 0x10000;
  }
  return out;
};

Random.getRandomState = getRandomState;
