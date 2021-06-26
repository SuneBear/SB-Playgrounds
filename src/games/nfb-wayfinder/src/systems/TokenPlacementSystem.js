import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import * as THREE from "three";
import { tweenTo } from "./AnimationSystem";
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
import { sendAnalytics } from "../nfb";

import { circlesIntersect } from "../util/geometry";
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

const Y_LINE_POSITION = 1.25;

export default function TokenPlacementSystem(world) {
  const bloom = 0.666;
  const renderLayers = world.findTag(Tags.RenderLayers);
  const renderer = world.findTag(Tags.Renderer);
  const white = new THREE.Color(1, 1, 1);
  const whiteWithBloom = new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom);
  const shadowAlpha = 0.1;
  const shadowColor = new THREE.Color("#000");
  // const shadowColor = new THREE.Color("#280422").lerp(white, 1 - shadowAlpha);
  const haiku = Haiku();

  const timeline = createTimeline();

  const [blobShadowMap] = Assets.createGPUTextureTask(
    renderer,
    "image/data/soft-circle"
  );

  const tokenSpritePool = new ObjectPool({
    initialCapacity: 10,
    create() {
      return createTokenSprite();
    },
    renew(m) {},
    release(m) {},
  });

  const availableTypes = Object.keys(TokenURLs);
  // const tokenMap = entries.reduce((dict, t) => {
  //   dict[t.key] = t.texture;
  //   return dict;
  // }, {});

  const tokenViewWithObject = world.view([
    Tags.GroundAsset,
    Tags.GroundAssetToken,
    Tags.Object3D,
  ]);
  const tokenViewWaitingForCollection = world.view(Tags.TokenIsCollecting);
  const tokenViewTriggers = world.view(Tags.TriggerTokenLine);
  const tokenEvents = world.listen(Tags.GroundAssetToken);
  const hakiCardSavedEvents = world.listen(Tags.HaikuCardSaved);

  const finishedPoemView = world.view(Tags.FinishedPoem);
  const collectedTokenView = world.view(Tags.CollectedToken);
  const collectedTokenEvents = world.listen(Tags.CollectedToken);
  const messages = world.view(Tags.TutorialMessage);

  const writtenLineView = world.view([Tags.WrittenStanzaLine]);

  const tmpUserPos2D = [0, 0];
  const tmpTokenPos2D = [0, 0];

  const tokensDiscovered = world.tag(Tags.TokensDiscoveredSet, new Set());
  const activeEnvEvents = world.listen(Tags.ActiveEnvironmentState);
  const userChar = world.findTag(Tags.UserCharacter);
  const orbGeom = new THREE.SphereBufferGeometry(1, 16, 16);

  let isFinalizingPoem = false;
  let finalPoemTime = 0;
  let finalPoemDelay = 1;

  const random = Random();

  return function TokenPlacementSystemDT(dt) {
    timeline.tick(dt);

    const userPos3D = userChar.position;
    tmpUserPos2D[0] = userPos3D.x;
    tmpUserPos2D[1] = userPos3D.z;

    if (activeEnvEvents.changed) {
      tokensDiscovered.clear();
      collectedTokenView.forEach((c) => c.kill());
      tokenViewWaitingForCollection.forEach((e) =>
        e.tagOff(Tags.TokenIsCollecting)
      );
      tokenViewTriggers.forEach((e) => e.tagOff(Tags.TriggerTokenLine));
    }

    // add tokens to world
    tokenEvents.added.forEach((e) => {
      const asset = e.get(Tags.GroundAsset);
      const tokenData = e.get(Tags.GroundAssetToken);
      const spriteGroup = tokenSpritePool.next();
      const object = spriteGroup.userData.sprite;
      setSpriteToken(renderer, object, tokenData.type, 1.25);
      const floorGap = 1;
      object.userData.startY = floorGap;
      object.userData.endY = object.userData.startY + 1;
      object.position.x = asset.x;
      object.position.z = asset.z;
      object.position.y = object.userData.startY;
      object.userData.show = null;

      const shadow = spriteGroup.userData.shadow;
      shadow.position.copy(object.position);
      shadow.position.y = 0;

      spriteGroup.visible = false;
      e.add(Tags.Object3D, spriteGroup);
      e.add(Tags.ShaderUniformTime);
      const shader = e.get(Tags.ShaderUniformTime);
      shader.uniform = object.material.uniforms.time;
    });

    tokenEvents.removing.forEach((e) => {
      // console.log("removing", e.get(Tags.GroundAssetToken).type);
      if (e.has(Tags.Object3D)) {
        const spriteGroup = e.get(Tags.Object3D);
        tokenSpritePool.release(spriteGroup);
      }
    });

    const isDirectingToOrigin = Boolean(world.findTag(Tags.DirectUserToOrigin));
    const introSeq = Boolean(world.findTag(Tags.OriginTreeIntroSequence));
    const ignoreTokens = Boolean(world.findTag(Tags.BlockTokenCollection));
    const canCollect =
      !introSeq &&
      collectedTokenView.length < 3 &&
      !isDirectingToOrigin &&
      !ignoreTokens;

    const isCollectingOne = tokenViewWaitingForCollection.length > 0;
    const isTriggeringOne = tokenViewTriggers.length > 0;
    const isCollecting = isCollectingOne || isTriggeringOne;

    tokenViewWithObject.forEach((e) => {
      const asset = e.get(Tags.GroundAsset);
      const t = e.get(Tags.GroundAssetToken);
      const spriteGroup = e.get(Tags.Object3D);
      const object = spriteGroup.userData.sprite;
      const shadow = spriteGroup.userData.shadow;

      // see if user can collect this type (they don't have it already)
      const isShowing = object.userData.show;
      const canCollectType = !tokensDiscovered.has(t.type);

      const map = object.material.uniforms.map.value;
      const mapReady = Boolean(map);
      const shouldShow =
        canCollect && canCollectType && mapReady && !isCollecting;

      // object.material.uniforms.effect.value =
      // shouldShow && !hasCollectionFeature ? 1 : 0;
      if (shouldShow !== isShowing) {
        if (mapReady) {
          // const aspect = map.image.width / map.image.height;
          // const height = 1.25;
          // const width = height * aspect;
          // object.scale.set(width, height, 1);
        }

        object.userData.show = shouldShow;
        if (!isShowing && shouldShow) {
          // spriteGroup.visible = true;
        }
        timeline.to(object.position, {
          y: shouldShow ? object.userData.startY : object.userData.endY,
          ease: "sineOut",
          duration: 1,
        });
        timeline
          .to(object.userData, {
            alpha: shouldShow ? 1 : 0,
            ease: "sineOut",
            duration: 1,
          })
          .on("update", (ev) => {
            const t = object.userData.alpha;
            object.material.uniforms.opacity.value = t;
            const l = MathUtil.lerp(1, 1 + bloom, t);
            object.material.uniforms.color.value.setRGB(l, l, l);
            object.material.visible = t >= 1e-5;
            shadow.material.opacity = t * shadowAlpha;
          })
          .on("complete", (ev) => {
            if (!ev.cancelling) {
              if (!shouldShow) {
                spriteGroup.visible = false;
              }
            }
          });
      }

      tmpTokenPos2D[0] = asset.x;
      tmpTokenPos2D[1] = asset.z;

      const tokenRadius = 2;
      const userRadius = 1;
      if (
        canCollectType &&
        shouldShow &&
        circlesIntersect(tmpTokenPos2D, tokenRadius, tmpUserPos2D, userRadius)
      ) {
        e.tagOn(Tags.TriggerTokenLine);
        messages.forEach((e) => e.kill());
      }
    });

    if (collectedTokenEvents.added.length > 0) {
      const tokensCollected = collectedTokenEvents.query.entities;
      const lastEntity =
        collectedTokenEvents.added[collectedTokenEvents.added.length - 1];

      // sendAnalytics({
      //   event: "token_collect",
      //   eventLabel: "token_collect",
      // });

      // lastEntity.add(Tags.CapeMagicalEffect);
      // lastEntity.add(Tags.AutoRemoveCapeMagicalEffect);

      if (tokensCollected.length < 3) {
        const hint = world.entity().add(Tags.TutorialMessage);
        const last = lastEntity.get(Tags.CollectedToken);
        const msg = hint.get(Tags.TutorialMessage);
        msg.iconMode = "token";
        msg.token = last.type;
        msg.message = last.stanza;
        msg.id = last.type;
        msg.delay = 0.5;
        msg.duration = 6;
      }

      if (!isFinalizingPoem && tokensCollected.length >= 3) {
        isFinalizingPoem = true;
        finalPoemTime = 0;
      }
    }

    if (isFinalizingPoem) {
      finalPoemTime += dt;
      if (finalPoemTime >= finalPoemDelay) {
        isFinalizingPoem = false;

        // add final poem
        const poemEntity = world.entity().add(Tags.FinishedPoem);
        const fp = poemEntity.get(Tags.FinishedPoem);
        const curTokens = collectedTokenEvents.query.entities;
        for (let i = 0; i < 3; i++) {
          const c = curTokens[i].get(Tags.CollectedToken);
          fp.lines[i] = c.stanza;
          fp.tokens[i] = c.type;
        }
        collectedTokenView.forEach((e) => e.kill());

        // sendAnalytics({
        //   event: "poem_collect",
        //   eventLabel: "poem_collect",
        // });
      }
    }
  };

  function createText(text, position) {
    const startY = 1.75;
    const endY = 2.25;
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
    tweenTo(world, g.position, "y", endY, 2, "expoOut");
    tweenTo(world, textData, "opacity", 1, 1, "sineOut");
    return textEntity;
  }

  function createTokenSprite() {
    const sprite = new THREE.Mesh(
      getSpriteGeometry(),
      createTokenMaterial(bloom, false)
    );
    sprite.layers.set(renderLayers.groundNormalElement)
    sprite.renderOrder = 10;
    sprite.userData.alpha = 1;
    sprite.name = "token";
    sprite

    const shadow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: blobShadowMap,
        depthTest: false,
        depthWrite: false,
        // blending: THREE.MultiplyBlending,
        color: shadowColor,
        opacity: shadowAlpha,
        transparent: true,
      })
    );
    shadow.scale.set(2, 0.66, 1).multiplyScalar(0.75);
    shadow.layers.disableAll();
    shadow.layers.enable(renderLayers.shadow);

    const spriteGroup = new THREE.Group();
    spriteGroup.add(sprite);
    spriteGroup.add(shadow);
    spriteGroup.userData.sprite = sprite;
    spriteGroup.userData.shadow = shadow;
    return spriteGroup;
  }
}
