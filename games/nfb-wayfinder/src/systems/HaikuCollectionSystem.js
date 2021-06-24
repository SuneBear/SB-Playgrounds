import * as Tags from "../tags";
import * as THREE from "three";
// import { generateStanza } from "../test/haiku-gen";
import { localize } from "../util/locale";
import Haiku from "../util/haikugen";
import { tweenFromTo } from "./AnimationSystem";
import query from "../util/query-string";
import { AllTokens } from "../util/tokens";
import Random from "../util/Random";
import resetPlayerPos, { setPlayerPos } from "../util/resetPlayerPos";
// import EndStateOverlay from "../overlays/EndStateOverlay.svelte";
import queryString from "../util/query-string";
import { sendAnalytics } from "../nfb";

// when you collect 5, show something to
// bring the user back to the home tree
// and then when you get within tree range,
// trigger a 'resolve' + transition to new world
export default function HaikuCollectionSystem(world) {
  // const collectedTokenView = world.view(Tags.CollectedToken);
  // const collectedTokenEvents = world.listen(Tags.CollectedToken);
  // const collectedHaikuEvents = world.listen(Tags.FinishedPoem);

  const random = Random();

  window.addPoem = (tokens, lines) => {
    const haiku = Haiku();
    if (!tokens) {
      tokens = random.shuffle(AllTokens).slice(0, 3);
    }
    lines =
      lines ||
      tokens.map((t, i) => {
        return haiku.generateStanza({
          stanza: i,
          token: t,
        });
      });
    console.log(lines, tokens);
    const poem = world.entity().add(Tags.FinishedPoem, {
      lines: lines.slice(),
      tokens: tokens.slice(),
    });
    console.log(tokens);
    console.log(lines.map((e) => e.en).join(" / "));
  };
  window.addTestPoem = () => {
    window.addPoem(random.shuffle(AllTokens).slice(0, 3));
  };

  const collectedHaikuEvents = world.listen(Tags.FinishedPoem);
  const haikuInventoryEvents = world.listen(Tags.HaikuInInventory);
  const haikuAddingToInventoryView = world.view(Tags.HaikuAddingToInventory);
  const haikuInventoryView = world.view(Tags.HaikuInInventory);
  const entity = world.entity();
  const cardSavedEvents = world.listen(Tags.HaikuCardSaved);

  let lastEnv;
  const envStates = world.view(Tags.ActiveEnvironmentState);
  const envStateEvents = world.listen(Tags.ActiveEnvironmentState);
  const originTrees = world.view([
    Tags.SpriteAnimation,
    Tags.SpriteAnimationOriginTreeTag,
  ]);

  let isAboutToAnimate = false;
  let isAboutToTransition = false;
  let animateTime = 0;
  let animateDelay = 4;
  let tundraAnimateDelay = 17;

  let transitionTime = 0;
  let transitionDelay = 10;
  let tundraTransitionDelay = 23;

  let animatingOutChar = false;
  let animOutCharDelay = 3;
  const endGameView = world.view(Tags.EndGameState);

  const biomes = ["forest", "grasslands", "tundra"];

  let hasSeenResolveMessage = false;
  const allTextView = world.view(Tags.TextHint);

  setTimeout(() => {
    const numTestPoems = query.poems;
    if (typeof numTestPoems === "number") {
      for (let i = 0; i < numTestPoems; i++) window.addTestPoem();
    }
  }, 0);

  const finalBiomeFinish = world.listen(Tags.ResetToCameraDrift);
  const autoCapeEffects = world.view(Tags.AutoRemoveCapeMagicalEffect);
  // const endEntity = world.entity().add(Tags.ViewLayer, {
  //   id: "end-state",
  //   component: EndStateOverlay,
  //   props: {
  //     onIntroEnd() {
  //       // world.findTag(Tags.AppState).running = false;
  //     },
  //   },
  // });

  return function haikuCollectSystem(dt) {
    const curEnvState = envStates[0];
    const envState = curEnvState
      ? curEnvState.get(Tags.EnvironmentState)
      : null;
    const envName = envState ? envState.name : null;

    if (finalBiomeFinish.changed && finalBiomeFinish.added.length > 0) {
      entity.remove(Tags.FinalBiomeResolution);

      const activeEnv = world.findEntity(Tags.ActiveEnvironmentState);
      if (activeEnv) {
        const state = activeEnv.get(Tags.EnvironmentState);
        setPlayerPos(world, state.idleViewPoint);
      }

      // clear previous environment tags
      entity.tagOff(Tags.DirectUserToOrigin);
      entity.tagOff(Tags.CapeMagicalEffect);
      entity.tagOff(Tags.AutoRemoveCapeMagicalEffect);
      entity.tagOff(Tags.WaitingForBiomeResolution);
      entity.tagOff(Tags.ShowBiomeResolution);
      entity.tagOff(Tags.CameraFocusOnTarget);
      entity.tagOff(Tags.MoveUserToOrigin);

      const endEntity = world.entity();
      endEntity.tagOn(Tags.GameLandingCameraDrift);
      endEntity.tagOn(Tags.CameraZoomOut);
      endEntity.tagOn(Tags.BlockTokenCollection);
      endEntity.tagOn(Tags.HideCharacter);
      endEntity.tagOn(Tags.HideHUD);
      endEntity.tagOn(Tags.BlockUserMove);
      endEntity.tagOn(Tags.CameraStopUserMovement);
      endEntity.tagOn(Tags.ModalStoppingUserMovement);

      let e = world.entity().add(Tags.ScreenFade);
      const fade = e.get(Tags.ScreenFade);
      fade.from = 1;
      fade.to = 0;
    }

    if (envStateEvents.changed) {
      entity.remove(Tags.DirectUserToOrigin);
      entity.tagOff(Tags.CapeMagicalEffect);
      entity.tagOff(Tags.AutoRemoveCapeMagicalEffect);
      entity.remove(Tags.WaitingForBiomeResolution);
      entity.remove(Tags.ShowBiomeResolution);
      entity.remove(Tags.CameraFocusOnTarget);
      entity.remove(Tags.MoveUserToOrigin);
      entity.remove(Tags.TriggerTreeTransitionAudio);
      // entity.remove(Tags.CameraStopUserMovement);
      haikuInventoryView.forEach((e) => {
        e.remove(Tags.HaikuInInventory);
      });

      originTrees.forEach((e) => {
        const anim = e.get(Tags.SpriteAnimation);
        anim.reset();
      });
      lastEnv = envName;

      // NOTE: This kills ALL text in the world ! maybe we should place this in env
      allTextView.forEach((e) => e.kill());
    }

    const totalForEnv = envState ? envState.haikusTotal : 2;
    const currentInView = haikuInventoryView.length;

    // console.log(collectedHaikuEvents.changed, collectedHaikuEvents.added);
    if (collectedHaikuEvents.changed) {
      // add each to inventory
      const remaining = Math.max(0, totalForEnv - currentInView);
      for (
        let i = 0;
        i < remaining && i < collectedHaikuEvents.added.length;
        i++
      ) {
        collectedHaikuEvents.added[i].add(Tags.HaikuAddingToInventory);
      }
    }

    haikuAddingToInventoryView.forEach((e) => {
      const t = e.get(Tags.HaikuAddingToInventory);
      t.time += dt;
      if (t.time >= t.delay) {
        e.remove(Tags.HaikuAddingToInventory);
        e.add(Tags.HaikuInInventory);
      }
    });

    if (haikuInventoryView.length >= totalForEnv) {
      if (!entity.has(Tags.DirectUserToOrigin)) {
        entity.add(Tags.DirectUserToOrigin);
        autoCapeEffects.forEach((e) => {
          const d = e.get(Tags.AutoRemoveCapeMagicalEffect);
          d.elapsed = 0;
          e.remove(Tags.AutoRemoveCapeMagicalEffect);
        });
        entity.add(Tags.CapeMagicalEffect);
        entity.add(Tags.WaitingForBiomeResolution);
      }
    }

    const canResolve = !world.findTag(Tags.IsGameUIActive);

    const isResolving = Boolean(world.findTag(Tags.DirectUserToOrigin));
    if (
      isResolving &&
      canResolve &&
      cardSavedEvents.added.length &&
      cardSavedEvents.changed &&
      !hasSeenResolveMessage
    ) {
      if (!queryString.resolve) {
        hasSeenResolveMessage = true;
        world.entity().add(Tags.TutorialMessage, {
          id: "resolve",
          message: localize.get().tutorialResolve,
          iconMode: "tree",
          delay: 0,
          duration: 6,
        });
      }
    }

    if (
      envState &&
      entity.has(Tags.DirectUserToOrigin) &&
      canResolve &&
      entity.has(Tags.WaitingForBiomeResolution)
    ) {
      // we are ready to resolve the biome
      const user = world.findTag(Tags.UserCharacter).position;
      const threshold = 20;
      const thresholdSq = threshold * threshold;
      const distSq = user.lengthSq();
      if (distSq < thresholdSq) {
        tweenFromTo(world, envState, "solved", 0, 1, 4, "sineInOut", 0);
        entity.remove(Tags.WaitingForBiomeResolution);
        entity.add(Tags.CameraFocusOnTarget);
        entity.add(Tags.MoveUserToOrigin);
        entity.add(Tags.ShowBiomeResolution);
        entity.tagOff(Tags.CapeMagicalEffect);
        entity.tagOff(Tags.AutoRemoveCapeMagicalEffect);
        if (envName === "tundra") {
          animatingOutChar = true;
          entity.add(Tags.FinalBiomeResolution);
        }
        // entity.add(Tags.CameraStopUserMovement);
        const camFocus = entity.get(Tags.CameraFocusOnTarget);
        camFocus.target.set(0, 4, 0);
        // haikuInventoryView.forEach((e) => {
        //   e.remove(Tags.HaikuInInventory);
        // });
        isAboutToTransition = true;
        isAboutToAnimate = true;
        animateTime = 0;
        transitionTime = 0;

        // addTextHints(envName);
      }
    }

    if (isAboutToAnimate) {
      animateTime += dt;
      const delay = envName === "tundra" ? tundraAnimateDelay : animateDelay;
      if (animateTime >= delay) {
        isAboutToAnimate = false;
        // entity.add(Tags.UserHitAudioTrigger);
        // const t = entity.get(Tags.UserHitAudioTrigger);
        // t.type = "origin_tree";
        originTrees.forEach((e) => {
          const anim = e.get(Tags.SpriteAnimation);
          anim.start();
        });
        entity.add(Tags.TriggerTreeTransitionAudio);
      }
    }

    if (isAboutToTransition) {
      transitionTime += dt;
      if (animatingOutChar && transitionTime >= animOutCharDelay) {
        animatingOutChar = false;
        entity.add(Tags.AnimateOutCharacter);
      }
      const delay =
        envName === "tundra" ? tundraTransitionDelay : transitionDelay;
      if (transitionTime >= delay) {
        isAboutToTransition = false;
        haikuInventoryView.forEach((e) => {
          e.remove(Tags.HaikuInInventory);
        });
        if (envName === "tundra") {
          // const endEntity = world
          //   .entity()
          //   .add(Tags.ViewLayer, {
          //     id: "end-state",
          //     component: EndStateOverlay,
          //     props: {
          //       onIntroEnd() {
          //         // world.findTag(Tags.AppState).running = false;
          //       },
          //     },
          //   })
          //   .add(Tags.EndGameState);
          const endEntity = world.entity();
          endEntity.add(Tags.EndGameState);
          let e = world.entity().add(Tags.ScreenFade);
          const fade = e.get(Tags.ScreenFade);
          fade.from = 0;
          fade.to = 1;
          fade.callbackOnFinish = () => {
            endEntity.add(Tags.ResetToCameraDrift);
            endEntity.add(Tags.OutroFinished);
            // store.update((d) => ({ ...d, ...opts, state }));
          };

          sendAnalytics({
            event: "completed",
            eventLabel: "end",
          });
        } else {
          entity.add(Tags.TransitionToNextBiome);
        }
      }
    }
  };

  function addTextHints(biome) {
    addText(
      {
        forest: "below the old wood trees",
        grasslands: "below the old wood trees",
        tundra: "below the old wood trees",
      }[biome],
      -10,
      3,
      -5,
      1
    );
    addText("forgotten memories made whole", -8, 3, -3.5, 2.5);
  }

  function addText(text, x, y, z, delay = 0) {
    const e = world.entity();
    e.add(Tags.TextHint);
    const t = e.get(Tags.TextHint);
    t.text = text;
    t.position.set(x, y, z);
    t.killing = true;
    t.duration = 15;
    t.delay = delay;
  }
}
