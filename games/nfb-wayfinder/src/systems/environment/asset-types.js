import * as Tags from "../../tags";
import { fastAssign } from "../../util/objects";

// const itemsTypeClasses = {
//   forest: ["forest-dry", "forest-autumn", "forest-triangle"],
// };

const baseWeights = {
  flower: 50,
  tree: 75,
  twig: 25,
  // grass: 25,
  acorns: 10,
  stump: 25,
  shroom: 25,
  rock: 50,
  "flower-patch": 10,
  sapling: 20,
};

export function getWeightedSets(instances) {
  const setMap = new Map();
  const items = instances
    .filter((child) => child.userData.tag)
    .map((child) => {
      const tag = child.userData.tag;
      let list;
      if (setMap.has(tag)) {
        list = setMap.get(tag);
      } else {
        list = [];
        setMap.set(tag, list);
      }
      list.push(child);
      return {
        tag,
        child,
      };
    });

  return Array.from(setMap.entries()).map(([tag, children]) => {
    const weight = tag in baseWeights ? baseWeights[tag] : 50;
    return {
      value: children,
      weight,
      tag,
    };
  });
}

export function addSampleData(container, itemsMap, entity, cellClass, random) {
  if (!itemsMap) return;
  // if (cellClass === "grasslands-water") cellClass = "grasslands-yellow";
  if (!itemsMap.has(cellClass)) {
    console.warn(`No cell class by key ${cellClass}`);
    return;
  }

  const items = itemsMap.get(cellClass);
  if (!items || !items.sets || !items.sets.length) {
    console.warn(`Cell not yet ready ${cellClass}`);
    return;
  }

  const set = random.weightedSet(items.sets);

  const child = items.next(random.pick(set));
  if (!child || !child.userData.tag) {
    if (child) console.warn("no tag for", child.name, cellClass);
    return;
  }

  // container.add(child);

  // console.log("Spawning child", child.userData.tag);
  const key = child.uuid;
  entity.add(Tags.GroundAssetData);

  const data = entity.get(Tags.GroundAssetData);
  data.key = key;
  data.variance = random.gaussian(0, 1);
  data.rotation = random.range(-1, 1) * Math.PI * 2;
  data.flip = random.boolean();
  data.instance = child;
  data.audio = child.scale.y > 5;
  data.ignoreFlip = child.userData.tag === "tree";

  // if (cellClass.includes("water")) {
  //   // console.log("CELL WATER", child, data);
  // }
  return child;
}
