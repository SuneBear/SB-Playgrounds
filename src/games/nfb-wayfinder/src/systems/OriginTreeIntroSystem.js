import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import Random from "../util/Random";
import Assets from "../util/Assets";
import * as ShaderManager from "../util/ShaderManager";
import { newArray } from "../util/array";
import queryString from "../util/query-string";
import resetPlayerPos, { setPlayerPos } from "../util/resetPlayerPos";
import OriginTreeIntroOverlay from "../overlays/OriginTreeIntroOverlay.svelte";
import { createTimerTween } from "./AnimationSystem";
import { writable } from "svelte/store";
import { hideHeader, sendAnalytics } from "../nfb";

export default function OriginTreeIntroSystem(world) {
  const entity = world.entity();
  const gameStartedEvents = world.listen(Tags.GameStarted);
  if (!queryString.nointroseq && !queryString.nolanding) {
    // TODO
    const activeEnv = world.findEntity(Tags.ActiveEnvironmentState);
    if (activeEnv) {
      const state = activeEnv.get(Tags.EnvironmentState);
      setPlayerPos(world, state.idleViewPoint);
    }
    entity.add(Tags.OriginTreeIntroSequence);
    entity.add(Tags.GameLandingCameraDrift);
    entity.tagOn(Tags.CameraZoomOut);
    entity.tagOn(Tags.HideCharacter);
    entity.tagOn(Tags.LetterboxBars);
    entity.tagOn(Tags.HideHUD);
    entity.tagOn(Tags.BlockUserMove);
    entity.tagOn(Tags.CameraStopUserMovement);
    entity.tagOn(Tags.ModalStoppingUserMovement);
    entity.tagOn(Tags.ClearInputPress);
  } else {
    entity.tagOn(Tags.CanSetIntroTags);
  }

  const fades = world.view(Tags.ScreenFade);

  const uiStore = writable({
    finished: false,
    covering: false,
    visible: false,
  });

  const appState = world.findTag(Tags.AppState);
  uiStore.subscribe((v) => {
    if (v.covering) {
      appState.running = false;
    } else appState.running = true;

    if (!v.visible && entity.has(Tags.ViewLayer)) {
      entity.remove(Tags.ViewLayer);
      appState.running = true;
      entity.tagOn(Tags.CanSetIntroTags);
      entity.tagOff(Tags.HideHUD);
      entity.tagOff(Tags.OriginTreeIntroSequence);
      entity.tagOff(Tags.CameraStopUserMovement);
      entity.tagOff(Tags.OriginTreeIntroSequenceStarted);
      entity.tagOff(Tags.GameLandingCameraDrift);
      entity.tagOn(Tags.ClearInputPress);
    }

    if (v.finished) {
      entity.tagOff(Tags.HideCharacter);
      entity.tagOff(Tags.CameraZoomOut);
      entity.tagOff(Tags.LetterboxBars);
      entity.tagOff(Tags.BlockUserMove);
      entity.tagOff(Tags.CameraStopUserMovement);
      entity.tagOff(Tags.ModalStoppingUserMovement);
      entity.tagOn(Tags.ClearInputPress);

      entity.tagOn(Tags.AnimateInCharacter);
      sendAnalytics({
        event: "playing",
        eventLabel: "playing",
      });
    }
  });

  let time = 0;
  let delay = 0;
  let isWaitingToKillView = false;

  return function originTreeIntroSystem(dt) {
    const isStopping = world.findTag(Tags.CameraStopUserMovement);
    if (!world.findTag(Tags.AppState).ready) return;

    const isIntroSeq = entity.has(Tags.OriginTreeIntroSequence);
    if (
      isIntroSeq &&
      gameStartedEvents.changed &&
      gameStartedEvents.added.length > 0
    ) {
      hideHeader();
      entity.add(Tags.OriginTreeIntroSequenceStarted);
      // entity.get(Tags.GameLandingCameraDrift).fixed = 0.05;
      // entity.tagOff(Tags.LetterboxBars);
      entity.add(Tags.ViewLayer, {
        component: OriginTreeIntroOverlay,
        id: "origin-tree-intro-overlay",
        props: { delay: 1250, store: uiStore },
      });

      uiStore.update((d) => ({ ...d, visible: true }));
      // fades.forEach((e) => e.kill());

      // const initialDelay = 0.25;
      // const holdOnBlack = 5;
      // isWaitingToKillView = true;
      // time = 0;
      // delay = holdOnBlack + 1;

      // const fadeOut = world.entity().add(Tags.ScreenFade);
      // const d = fadeOut.get(Tags.ScreenFade);
      // d.from = 0;
      // d.duration = 1;
      // d.to = 1;
      // d.delay = initialDelay;

      // d.callbackOnFinish = onBlack;
      // const fadeIn = world.entity().add(Tags.ScreenFade);
      // const d2 = fadeIn.get(Tags.ScreenFade);
      // const holdDelay = 0.5;
      // d2.from = 1;
      // d2.to = 0;
      // d2.duration = 1;
      // d2.callbackOnStart = enableCharacter;
      // d2.callbackOnFinish = disableIntro;
      // d2.delay = holdOnBlack + d.delay + d.duration + holdDelay;
    }

    // if (isWaitingToKillView) {
    //   time += dt;
    //   if (time >= delay) {
    //     isWaitingToKillView = false;
    //     entity.tagOff(Tags.ViewLayer);
    //   }
    // }
  };

  function clearZoom() {}

  function onBlack() {
    // resetPlayerPos(world);
  }

  function enableCharacter() {}

  function disableIntro() {
    console.log("DISABLE INTRO!");
    clearZoom();
    entity.tagOff(Tags.HideHUD);
  }
}
