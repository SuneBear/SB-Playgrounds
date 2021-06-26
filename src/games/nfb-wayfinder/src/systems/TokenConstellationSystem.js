import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import * as THREE from "three";
import * as Helpers from "../util/helpers";
import { setEntityTweenFromTo, tweenFromTo, tweenTo } from "./AnimationSystem";
import Line3D from "./writing/Line3D";
import createTimeline from "../util/tween-ticker";
import {
  TokenURLs,
  BiomeFeatures,
  AllTokens,
  Atmospheres,
  Themes,
  Subjects,
} from "../util/tokens";

import { loadTexture } from "../util/load";
import { circlesIntersect, getBoundingCircle } from "../util/geometry";
import Haiku from "../util/haikugen";
import * as ShaderManager from "../util/ShaderManager";
import {
  createSpriteMaterial,
  getEmptyTexture,
  setSpriteToken,
  getSpriteGeometry,
  createTokenMaterial,
} from "../util/materials";
import Assets from "../util/Assets";
import ObjectPool from "../util/ObjectPool";
import { localize, language } from "../util/locale";
import Random from "../util/Random";
import { TokenChildren } from "../tags";
import { detachObject } from "../util/three-util";
import queryString from "../util/query-string";
import { sendAnalytics } from "../nfb";

const Y_LINE_POSITION = 1.25;
const userHitRadius = 2.5;
const userHitRadiusSq = userHitRadius * userHitRadius;

function splitPhrase(phrase) {
  const words = phrase.split(" ");
  const result = [];
  words.forEach((w) => {
    const chunks = w.split("-");
    chunks.forEach((c, i, list) => {
      let str = c;
      if (i < list.length - 1) {
        str += "-";
      }
      if (str) result.push(str);
    });
  });
  return result;
}

export default function TokenConstellationSystem(world) {
  const bloom = 0.666;
  const renderLayers = world.findTag(Tags.RenderLayers);
  const renderer = world.findTag(Tags.Renderer);
  const white = new THREE.Color(1, 1, 1);
  const whiteWithBloom = new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom);
  const shadowAlpha = 0.1;
  const shadowColor = new THREE.Color("#280422").lerp(white, 1 - shadowAlpha);
  const haiku = Haiku();

  const timeline = createTimeline();
  const startY = 1.75;
  const endY = 2.25;

  const planeGeo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

  const tokenCollectingEvents = world.listen([
    Tags.GroundAsset,
    Tags.GroundAssetToken,
    Tags.Object3D,
    Tags.TriggerTokenLine,
  ]);

  // const availableTypes = Object.keys(TokenURLs);
  // // const tokenMap = entries.reduce((dict, t) => {
  // //   dict[t.key] = t.texture;
  // //   return dict;
  // // }, {});

  // const tokenViewWithObject = world.view([
  //   Tags.GroundAsset,
  //   Tags.GroundAssetToken,
  //   Tags.Object3D,
  // ]);

  // const tokenViewWaitingForCollection = world.view([
  // Tags.GroundAsset,
  // Tags.GroundAssetToken,
  // Tags.Object3D,
  // Tags.TokenIsCollecting,
  // ]);

  // const tokenEvents = world.listen(Tags.GroundAssetToken);

  const finishedPoemView = world.view(Tags.FinishedPoem);
  const collectedTokenView = world.view(Tags.CollectedToken);
  const collectedTokenEvents = world.listen(Tags.CollectedToken);
  const collectedHaikuView = world.view(Tags.HaikuInInventory);

  const discoveredSet = world.findTag(Tags.TokensDiscoveredSet);

  const tmpUserPos2D = [0, 0];
  const tmpTokenPos2D = [0, 0];

  // const tokensDiscovered = world.tag(Tags.TokensDiscoveredSet, new Set());
  const activeEnvEvents = world.listen(Tags.ActiveEnvironmentState);
  const userChar = world.findTag(Tags.UserCharacter);
  // const orbGeom = new THREE.SphereBufferGeometry(1, 16, 16);

  const random = Random();
  const tokenChildrenView = world.view(Tags.TokenChildren);

  const [dotMap] = Assets.createGPUTextureTask(
    renderer,
    `image/data/compass-dot`
  );

  const orbPool = new ObjectPool({
    initialCapacity: 12,
    name: "orbs",
    create() {
      const m = new THREE.Mesh(
        planeGeo,
        createTokenMaterial(1, false)
        // new THREE.MeshBasicMaterial({
        //   depthTest: false,
        //   depthWrite: false,
        //   transparent: true,
        //   color: whiteWithBloom,
        // })
      );
      m.material.uniforms.map.value = dotMap;
      m.renderOrder = 10;
      m.position.y = Y_LINE_POSITION;
      m.userData.smallScale = 0.0;
      m.userData.bigScale = 0.45;
      m.userData.alpha = 1;
      m.userData.visibility = 0;
      m.userData.finalScale = 1;
      m.userData._entity = null;
      updateSphereScale(m);
      m.layers.set(renderLayers.groundNormalElement)
      return m;
    },
    renew(m) {
      m.userData._pool = this;
    },
    release(m) {
      m.userData._pool = null;
      if (m.userData._entity) {
        m.userData._entity.kill();
        m.userData._entity = null;
      }
    },
  });

  const directToOrigin = world.view(Tags.DirectUserToOrigin);
  const directToOriginEvent = world.listen(Tags.DirectUserToOrigin);
  const musicalOrbs = world.view([Tags.Object3D, Tags.MusicalOrb]);
  let orbSpawnTime = 0;
  let orbSpawnDelay = 1;
  const tmpVecA = new THREE.Vector3();
  const tmpVecB = new THREE.Vector3();
  const tmp2D = [0, 0];
  let orbLine = null;

  const spawnMusicalOrb = (position) => {
    // const radius = 10;
    // direction to center
    // tmpVecA.copy(userPos).normalize().negate();
    // tmpVecB.copy(userPos).addScaledVector(tmpVecA, radius);
    // random.insideCircle(radius / 2, tmp2D);
    // tmpVecB.x += tmp2D[0];
    // tmpVecB.z += tmp2D[1];

    const orb = orbPool.next();
    if (orb.userData._entity) console.error("already has entity");

    orb.userData._entity = world.entity();
    orb.position.copy(position);
    orb.position.y = Y_LINE_POSITION;
    const e = orb.userData._entity;
    e.add(Tags.Object3D, orb);
    e.add(Tags.MusicalOrb);
    orb.userData.alpha = 1;
    orb.userData.visibility = 0;
    orb.userData.finalScale = 1;
    updateSphereScale(orb);
    timeline
      .to(orb.userData, {
        visibility: 1,
        duration: 1,
        ease: "expoOut",
      })
      .on("update", () => {
        updateSphereScale(orb);
      });
  };

  const animOutOrb = (orb, shouldKill = false) => {
    if (orb) {
      if (orb.userData._pool) {
        orbPool.release(orb);
      }
      if (shouldKill && orb.userData._entity) {
        orb.userData._entity.kill();
        orb.userData._entity = null;
      }
      detachObject(orb);
    }
    timeline
      .to(orb.userData, {
        alpha: 0,
        duration: 1,
        ease: "expoOut",
      })
      .on("update", () => {
        updateSphereScale(orb);
      })
      .on("complete", () => {
        if (orb) {
          if (orb.userData._pool) {
            orbPool.release(orb);
          }
          if (shouldKill && orb.userData._entity) {
            orb.userData._entity.kill();
            orb.userData._entity = null;
          }
          detachObject(orb);
        }
      });
  };

  return function TokenConstellationSystem(dt) {
    timeline.tick(dt);

    const userPos3D = userChar.position;
    tmpUserPos2D[0] = userPos3D.x;
    tmpUserPos2D[1] = userPos3D.z;

    // if (directToOriginEvent.added.length > 0 && !orbLine) {
    //   const a = userPos3D;
    //   const b = new THREE.Vector3(0, 0, 0);
    //   const steps = 10;
    //   const points = [];
    //   for (let i = 0; i < steps; i++) {
    //     const t = i / steps;
    //     const p = a.clone().lerp(b, t);
    //     random.insideCircle(5, tmp2D);
    //     p.x += tmp2D[0];
    //     p.z += tmp2D[1];
    //     p.y = Y_LINE_POSITION;
    //     const dstSq = p.x * p.x + p.z * p.z;
    //     const thresh = 25;
    //     const threshSq = thresh * thresh;
    //     if (dstSq >= threshSq) {
    //       points.push(p);
    //     }
    //   }
    //   const curve = new THREE.CatmullRomCurve3(points);
    //   orbLine = curve.getSpacedPoints(20).map((p) => {
    //     spawnMusicalOrb(p);
    //   });
    // }

    // if (directToOrigin.length > 0 && musicalOrbs.length < 10) {
    //   orbSpawnTime += dt;
    //   if (orbSpawnTime >= orbSpawnDelay) {
    //     orbSpawnTime %= orbSpawnDelay;
    //     spawnMusicalOrb(userPos3D);
    //   }
    // }

    musicalOrbs.forEach((e) => {
      const d = e.get(Tags.MusicalOrb);
      const orb = e.get(Tags.Object3D);
      if (d.killing) return;
      // d.elapsed += dt;
      // if (d.elapsed >= d.duration) {
      //   d.killing = true;
      //   // animOutOrb(orb, true);
      // }

      if (!d.killing && !d.hit) {
        const dx = orb.position.x - tmpUserPos2D[0];
        const dz = orb.position.z - tmpUserPos2D[1];
        const dstSq = dx * dx + dz * dz;
        if (dstSq <= userHitRadiusSq) {
          d.hit = true;
          e.tagOff(Tags.CollectTokenOrb);
          e.tagOn(Tags.CollectTokenOrb);
          e.add(Tags.ParticleEmit);
          const particle = e.get(Tags.ParticleEmit);
          particle.position.copy(orb.position);

          d.killing = true;
          animOutOrb(orb, true);
        }
      }
    });

    tokenCollectingEvents.added.forEach((e) => {
      const asset = e.get(Tags.GroundAsset);
      const t = e.get(Tags.GroundAssetToken);
      const spriteGroup = e.get(Tags.Object3D);
      e.tagOff(Tags.TriggerTokenLine);
      showLine(t.type, asset);
    });

    tokenChildrenView.forEach((e) => {
      const c = e.get(Tags.TokenChildren);
      if (c.complete || c.killing) return;

      const userInside = circlesIntersect(tmpUserPos2D, 5, c.center, c.radius);
      // if not completed and we are too far away
      if (!c.removing && !userInside) {
        console.log("token out of range");
        c.removeTime = 0;
        c.removing = true;
        // should remove
        // animateOutChildren(e, c);
      } else if (c.removing && userInside) {
        c.removing = false;
        console.log("token back in range");
      }

      if (c.removing) {
        c.removeTime += dt;
        if (c.removeTime >= c.removeDelay) {
          c.killing = true;
          c.removing = true;
          animateOutChildren(e, c);
        }
      }

      if (!c.complete && !c.killing && !c.removing) {
        checkMarkerHits(e, c);
      }
    });

    if (activeEnvEvents.changed) {
      tokenChildrenView.forEach((e) => {
        killChildrenImmediate(e);
      });
    }
  };

  function updateSphereScale(sphere) {
    const scl =
      MathUtil.lerp(
        sphere.userData.smallScale,
        sphere.userData.bigScale,
        sphere.userData.alpha
      ) *
      sphere.userData.visibility *
      sphere.userData.finalScale;
    sphere.visible = scl > 1e-14;
    sphere.scale.setScalar(Math.max(scl, 1e-14));
  }

  function checkMarkerHits(e, c) {
    for (let i = 0; i < c.markers.length; i++) {
      const m = c.markers[i];
      // if this marker isn't hit
      if (!m.hit) {
        // if the marker has a previous non-hit marker, ignore rest
        const prev = i > 0 && c.markers.length > 1 ? c.markers[i - 1] : null;
        if (prev && !prev.hit) break;

        const dx = m.position.x - tmpUserPos2D[0];
        const dz = m.position.z - tmpUserPos2D[1];
        const dstSq = dx * dx + dz * dz;
        if (dstSq <= userHitRadiusSq) {
          m.hit = true;
          e.tagOff(Tags.CollectTokenOrb);
          e.tagOn(Tags.CollectTokenOrb);
          e.add(Tags.ParticleEmit);
          const particle = e.get(Tags.ParticleEmit);
          particle.position.copy(m.position);

          if (m.word) {
            m.text = createText(m.word, m.sphere.position);
          }

          const newFill =
            c.markers.length <= 1 ? 0.5 : i / (c.markers.length - 1);

          timeline
            .to(m.sphere.userData, {
              alpha: 0,
              duration: 1,
              ease: "expoOut",
            })
            .on("update", () => {
              updateSphereScale(m.sphere);
            })
            .on("complete", () => {
              if (m.sphere) {
                if (m.sphere.userData._pool) {
                  orbPool.release(m.sphere);
                }
                detachObject(m.sphere);
              }
            });

          const next = i < c.markers.length - 1 ? c.markers[i + 1] : null;
          if (next) {
            timeline
              .to(next.sphere.userData, {
                visibility: 1,
                duration: 1,
                ease: "expoOut",
              })
              .on("update", () => {
                updateSphereScale(next.sphere);
              });
          }

          // c.line.material.uniforms.filling.value = true;
          // timeline.to(c.line.material.uniforms.draw, {
          //   value: newFill2,
          //   duration: 1,
          //   ease: "expoOut",
          // });
          if (i === c.markers.length - 1) {
            c.complete = true;

            discoveredSet.add(c.type);
            e.tagOff(Tags.TokenIsCollecting);

            const collected = world.entity().add(Tags.CollectedToken);
            const collectedData = collected.get(Tags.CollectedToken);
            collected.add(Tags.CapeMagicalEffect);
            collected.add(Tags.AutoRemoveCapeMagicalEffect);
            collectedData.x = c.x;
            collectedData.z = c.z;
            collectedData.type = c.type;
            collectedData.stanza = c.stanza;
            collectedData.stanzaIndex = c.stanzaIndex;

            timeline.to(c.line.material.uniforms.dottedFill, {
              value: 1,
              duration: 1,
              ease: "quadInOut",
            });
          } else {
          }
        }
      }
    }
  }

  function animateOutChildren(e, c) {
    removeChildren(e);
  }

  function killChildrenImmediate(e) {
    if (!e.has(Tags.TokenChildren)) return;
    const c = e.get(Tags.TokenChildren);
    c.markers.forEach((m) => {
      if (m.text) {
        killText(m.text);
      }
      if (m.sphere) {
        if (m.sphere.userData._pool) {
          orbPool.release(m.sphere);
        }
        detachObject(m.sphere);
      }
    });
    // c.parentEntity.tagOff(Tags.TokenIsCollecting);

    c.line.geometry.dispose();
    c.shadow.geometry.dispose();
    detachObject(c.line);
    detachObject(c.shadow);
    detachObject(c.group);
    e.kill();
  }

  function removeChildren(e) {
    if (!e.has(Tags.TokenChildren)) return;
    const c = e.get(Tags.TokenChildren);
    c.markers.forEach((m) => {
      if (m.text) {
        removeText(m.text);
      }
      const sphere = m.sphere;
      timeline
        .to(m.sphere.userData, {
          finalScale: 0,
          duration: 1,
          ease: "sineOut",
        })
        .on("update", () => updateSphereScale(m.sphere))
        .on("complete", () => {
          if (sphere.userData._pool) {
            orbPool.release(sphere);
          }
          detachObject(sphere);
        });
    });
    // c.parentEntity.tagOff(Tags.TokenIsCollecting);
    // detachObject(c.group);

    timeline.to(c.line.material.uniforms.thickness, {
      value: 0,
      duration: 1,
      ease: "sineOut",
    });
    timeline
      .to(c.shadow.material.uniforms.thickness, {
        value: 0,
        duration: 1,
        ease: "sineOut",
      })
      .on("complete", () => {
        console.log("dispose");
        c.line.geometry.dispose();
        c.shadow.geometry.dispose();
        detachObject(c.line);
        detachObject(c.shadow);
        detachObject(c.group);
        e.kill();
      });

    // const tweenEntity = tweenTo(
    //   world,
    //   c.line.material.uniforms.thickness,
    //   "value",
    //   0,
    //   1,
    //   "sineOut"
    // );
    // const tween = tweenEntity.get(Tags.TargetKeyTween);
    // tween.callbackOnFinish = () => {
    //   console.log("dispose");

    // };

    // e.kill();
  }

  function showLine(type, asset) {
    // tokensDiscovered.add(type);
    const userAngle = Math.atan2(userChar.direction.z, userChar.direction.x);
    const children = world.entity().add(Tags.TokenChildren);
    children.add(Tags.TokenIsCollecting);

    const c = children.get(Tags.TokenChildren);
    const group = new THREE.Group();
    c.group = group;
    const angle = userAngle; //MathUtil.degToRad(0);
    const u = Math.cos(angle);
    const v = Math.sin(angle);

    const initialOff = 4;
    const posA = new THREE.Vector3(asset.x, 0, asset.z).addScaledVector(
      new THREE.Vector3(u, 0, v),
      initialOff
    );

    const allPreviousPoems = finishedPoemView.map(
      (e) => e.get(Tags.FinishedPoem).lines
    );
    const previousState = collectedTokenView
      .slice(0, 2)
      .map((e) => e.get(Tags.CollectedToken).stanza);

    const stanzaIndex = collectedTokenView.length;
    const stanza = haiku.generateStanza({
      stanza: stanzaIndex,
      token: type,
      ignore: allPreviousPoems,
      state: previousState,
    });

    c.x = asset.x;
    c.z = asset.z;
    c.type = type;
    c.stanzaIndex = stanzaIndex;
    c.stanza = stanza;

    // children.add(Tags.CollectedToken);
    // const collectedData = children.get(Tags.CollectedToken);
    // collectedData.x = asset.x;
    // collectedData.z = asset.z;
    // collectedData.type = type;
    // collectedData.stanza = stanza;
    // collectedData.stanzaIndex = stanzaIndex;

    const phrase = stanza[language.get()];
    const words = splitPhrase(phrase);

    const markerWords = [];

    // CollectedToken
    const substeps = collectedTokenView.length;
    for (let i = 0; i < words.length; i++) {
      markerWords.push(words[i]);
      for (let c = 0; c < substeps; c++) {
        if (i < words.length - 1) {
          markerWords.push(null);
        }
      }
    }

    const wordCount = words.length;
    const off = wordCount * 5;
    const dir = random.sign();

    const posB = posA.clone().addScaledVector(new THREE.Vector3(u, 0, v), off);

    const midA = posA.clone().lerp(posB, 0.25);
    const midB = posA.clone().lerp(posB, 0.75);
    const norm = new THREE.Vector2(posA.x, posA.z)
      .sub(new THREE.Vector2(posB.x, posB.z))
      .normalize();
    const perp = new THREE.Vector2(-norm.y, norm.x);
    let curve;
    const perp3 = new THREE.Vector3(perp.x, 0, perp.y);
    if (wordCount > 3) {
      midA.addScaledVector(perp3, (-off / 2) * dir);
      midB.addScaledVector(perp3, (off / 2) * dir);
      curve = new THREE.CubicBezierCurve3(posA, midA, midB, posB);
    } else {
      midA.addScaledVector(perp3, (off / 2) * dir);
      curve = new THREE.QuadraticBezierCurve3(posA, midA, posB);
    }

    const drawAmount = 1; //wordCount <= 2 ? 1 : 1 / (wordCount - 1);
    const line = new Line3D(world, {
      taper: true,
      thickness: 0.35,
      dotted: true,
      filling: false,
      draw: drawAmount,
      depthWrite: false,
      depthTest: false,
    });

    const shadow = new Line3D(world, {
      bloom: 0,
      thickness: 0.75,
      blending: THREE.MultiplyBlending,
      // depthTest: false,
      // depthWrite: false,
      color: shadowColor,
      geometry: line.geometry,
    });
    shadow.layers.set(renderLayers.shadow);
    shadow.userData.thickness = shadow.material.uniforms.thickness.value;

    const curvePoints = words.map((word, i, list) => {
      const t = list.length <= 1 ? 0.5 : i / (list.length - 1);
      const pos = new THREE.Vector3();
      curve.getPointAt(t, pos);
      return pos;
    });

    const lineCurve = new THREE.CatmullRomCurve3(
      curvePoints,
      false,
      "catmullrom",
      0.5
    );

    const drawCurve = lineCurve;
    c.markers.length = 0;
    const wordOrbs = markerWords;
    for (let i = 0; i < wordOrbs.length; i++) {
      const word = wordOrbs[i];
      const t = wordOrbs.length <= 1 ? 0.5 : i / (wordOrbs.length - 1);

      const m = orbPool.next();
      console.log(orbPool.log());
      drawCurve.getPointAt(t, m.position);
      m.position.y = Y_LINE_POSITION;
      m.userData.alpha = 1;
      m.userData.visibility = 0;
      m.userData.finalScale = 1;
      group.add(m);
      updateSphereScale(m);
      if (i === 0) {
        // first sphere is always visible
        timeline
          .to(m.userData, {
            visibility: 1,
            duration: 1,
            ease: "expoOut",
          })
          .on("update", () => updateSphereScale(m));
      }
      c.markers.push({
        hit: false,
        word,
        sphere: m,
        position: m.position,
      });
    }

    const points = c.markers.map((p) => {
      const pos = p.position;
      return pos;
    });

    const circle = getBoundingCircle(points.map((p) => [p.x, p.z]));
    c.center = circle.center;
    c.radius = circle.radius;
    // const circleGeom = Helpers.circleHelper2D(circle.center, circle.radius);
    // world.entity().add(Tags.Object3D, circleGeom);

    // const curved = true;
    // if (curved) {
    //   const lineCurve = new THREE.CatmullRomCurve3(
    //     points,
    //     false,
    //     "catmullrom",
    //     0.5
    //   );
    //   line.updatePath(curve.getSpacedPoints(40), false, true);
    // } else {
    //   line.updatePath(points, false, true);
    // }

    line.updatePath(drawCurve.getSpacedPoints(30), false, true);

    const toThick = line.material.uniforms.thickness.value;
    tweenFromTo(
      world,
      line.material.uniforms.thickness,
      "value",
      0,
      toThick,
      1,
      "sineOut"
    );
    line.material.uniforms.filling.value = true;
    shadow.material.uniforms.filling.value = true;
    tweenFromTo(
      world,
      line.material.uniforms.draw,
      "value",
      0,
      1,
      1,
      "sineOut"
    );
    tweenFromTo(
      world,
      shadow.material.uniforms.draw,
      "value",
      0,
      1,
      1,
      "sineOut"
    );
    group.add(line);
    group.add(shadow);
    line.position.y = Y_LINE_POSITION;
    c.line = line;
    c.shadow = shadow;
    children.add(Tags.Object3D, group);
  }

  function removeText(entity) {
    if (entity.has(Tags.Object3D)) {
      const obj = entity.get(Tags.Object3D);
      if (obj && obj.userData.tweenA) {
        obj.userData.tweenA.kill();
        obj.userData.tweenB.kill();
      }
      // entity.kill();
      const textData = entity.get(Tags.TextSprite3D);
      const t0 = tweenTo(world, obj.position, "y", startY, 1, "expoOut");
      setEntityTweenFromTo(entity, textData, "opacity", 1, 0, 1, "sineOut");
      const t1 = entity.get(Tags.TargetKeyTween);
      t1.killEntityOnFinish = true;
      t1.assignFromOnStart = true;
    }
  }

  function killText(entity) {
    if (entity.has(Tags.Object3D)) {
      const obj = entity.get(Tags.Object3D);
      if (obj && obj.userData.tweenA) {
        obj.userData.tweenA.kill();
        obj.userData.tweenB.kill();
      }
    }
    entity.kill();
  }

  function createText(text, position) {
    const g = new THREE.Group();
    g.position.copy(position);
    g.position.y = startY;
    const textEntity = world
      .entity()
      .add(Tags.TextSprite3D)
      .add(Tags.Object3D, g);
    const textData = textEntity.get(Tags.TextSprite3D);
    textData.text = text;
    textData.depth = false;
    textData.parent = g;
    textData.fontSize = 16;
    textData.opacity = 0;
    const tweenA = tweenTo(world, g.position, "y", endY, 2, "expoOut");
    const tweenB = tweenTo(world, textData, "opacity", 1, 1, "sineOut");
    g.userData.tweenA = tweenA.ref();
    g.userData.tweenB = tweenB.ref();
    return textEntity;
  }
}
