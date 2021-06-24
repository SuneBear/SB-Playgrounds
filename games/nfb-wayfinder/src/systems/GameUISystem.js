import GamePages from "../overlays/GamePages.svelte";

import * as Tags from "../tags";
import { writable, get } from "svelte/store";
import queryString from "../util/query-string";
import getConfig from "../config";
import {
  hideHeader,
  revealHeader,
  sendAnalytics,
  sendTrackingPixel,
  startButtonTracking,
} from "../nfb";

export default function GameUISystem(world, opts = {}) {
  const { readyToInitialize, readyToShowEngine } = opts;
  const showLanding = !queryString.nolanding;

  const showHaikuCard = !queryString.nocard;
  // console.log("SHOW CARD", showHaikuCard);

  const landing = showLanding ? "landing" : null;
  const embed = getConfig().embed;
  const initialPage = embed
    ? null
    : queryString.initial
    ? queryString.initial
    : landing;
  const showIntro = !queryString.nointro;
  const letterboxView = world.view(Tags.LetterboxBars);
  const onOutroEvent = world.listen([
    Tags.EndGameState,
    Tags.ResetToCameraDrift,
  ]);

  let canCollectTokens = null;

  const store = writable({
    initGame: showIntro && !embed ? false : true,

    state: initialPage,
    active: true,

    embed,

    // if pause, then we show the restart/resume, otherwise we show initial
    pause: false,

    hint: null,

    notifyHaiku: false,
    endState: false,

    moving: false,

    letterboxes: false,

    isButtonHovered: false,
    isButtonClicked: false,

    canCollectTokens,

    tokensCollected: [],
    finishedHaikus: [],

    poem: [],

    playing: false,

    haikusCollected: 0,
    haikusTotal: 3,
    newlyCollectedHaiku: null,
    transitionOverlay: null,
    transitionCurrentBiome: null,
    resolving: false,

    hideHUD: true,

    intro: showIntro && !embed,
  });

  world.tag(Tags.GameUIStore, store);

  window.setUIData = (v) => {
    store.update((d) => ({ ...d, ...v }));
  };

  window.toggleOpenJournal = function () {
    store.update((t) => {
      if (t.state != "journal") {
        t.state = "journal";
      } else {
        t.state = null;
      }
      return t;
    });
  };

  window.setPoemText = function (lineOne, lineTwo, lineThree) {
    store.update((p) => {
      p.poem = [lineOne, lineTwo, lineThree];
      p.tokensCollected = ["sun", "rain", "snow"];
      return p;
    });
  };

  const pages = world.entity().add(Tags.ViewLayer, {
    id: "game-pages",
    component: GamePages,
    props: {
      store,
    },
  });

  const uiEntity = world.entity();

  let isActive = false;
  let wasActive = null;
  let visited = false;
  let wasIntro = null;
  let didInitGame = false;
  let wasLetterboxes = false;
  let wasHideHUD = true;
  let hasHaikuPopup = false;

  const haikuCardEntity = world.entity();

  const lazyMergeCallbacks = [];

  store.subscribe((v) => {
    // console.log("PLAYSTATE", v.playing);
    isActive = Boolean(v.active);
    if (!v.state && !visited) {
      visited = true;
      if (!uiEntity.has(Tags.GameStarted)) {
        uiEntity.add(Tags.GameStarted);
        uiEntity.add(Tags.ClearInputPress);
        startButtonTracking();
        sendAnalytics({
          event: "main",
          eventLabel: "start",
        });
        sendTrackingPixel();
      }
      store.update((d) => ({
        ...d,
        // hint: "move",
        initGame: true,
        intro: false,
      }));
    }

    if (isActive !== wasActive) {
      wasActive = isActive;
      if (isActive) {
        // console.log("GAME ACTIVE, TURN OFF STOP");
        pages.tagOff(Tags.CameraStopUserMovement);
        pages.tagOff(Tags.LetterboxBars);
        pages.tagOff(Tags.CameraZoomOut);
        store.update((d) => ({ ...d, playing: true }));
      } else {
        // console.log("GAME INACTIVE, TURN ON STOP");
        pages.tagOn(Tags.CameraStopUserMovement);
        pages.tagOn(Tags.LetterboxBars);
        pages.tagOn(Tags.CameraZoomOut);
        store.update((d) => ({ ...d, playing: false }));
      }
    }

    if (v.playing) pages.tagOff(Tags.IsGameUIActive);
    else pages.tagOn(Tags.IsGameUIActive);

    // Page state
    const isJournalOpen = v.state === "journal";
    const wasJournalOpen = uiEntity.has(Tags.JournalOpen);
    if (isJournalOpen !== wasJournalOpen) {
      if (!uiEntity.has(Tags.JournalOpen)) uiEntity.add(Tags.JournalOpen);
      else uiEntity.remove(Tags.JournalOpen);
    }

    const isPaused = Boolean(v.state);
    const wasPaused = pages.has(Tags.PauseOpen);
    if (isPaused !== wasPaused) {
      if (!pages.has(Tags.PauseOpen)) pages.add(Tags.PauseOpen);
      else pages.remove(Tags.PauseOpen);
    }

    // Button state
    if (v.isButtonHovered) pages.add(Tags.ButtonHover);
    else pages.remove(Tags.ButtonHover);

    // if (v.isButtonClicked) {
    //   pages.add(Tags.ButtonClick);
    //   store.update((d) => ({ ...d, isButtonClicked: false }));
    //   pages.remove(Tags.ButtonClick);
    // }

    if (v.initGame && !didInitGame) {
      didInitGame = true;
      if (readyToInitialize) readyToInitialize();
    }

    if (v.intro !== wasIntro && !v.intro) {
      wasIntro = v.intro;
      if (readyToShowEngine) {
        readyToShowEngine();
      }
    }

    if (hasHaikuPopup !== v.newlyCollectedHaiku) {
      let wasVisible = hasHaikuPopup;
      hasHaikuPopup = v.newlyCollectedHaiku;
      if (hasHaikuPopup) {
        haikuCardEntity.tagOn(Tags.BlockUserMove);
        haikuCardEntity.tagOn(Tags.LetterboxBars);
        haikuCardEntity.tagOn(Tags.CameraZoomOut);
      } else {
        haikuCardEntity.tagOff(Tags.BlockUserMove);
        haikuCardEntity.tagOff(Tags.LetterboxBars);
        haikuCardEntity.tagOff(Tags.CameraZoomOut);
      }

      if (showHaikuCard) {
        // card is being shown or not
        if (hasHaikuPopup && !wasVisible) {
          haikuCardEntity.tagOn(Tags.HaikuCardShown);
        } else {
          haikuCardEntity.tagOff(Tags.HaikuCardShown);
        }

        // card is being saved or not
        if (!hasHaikuPopup && wasVisible) {
          if (v.onNotifyHaiku) v.onNotifyHaiku();
          haikuCardEntity.tagOn(Tags.HaikuCardSaved);
        } else {
          haikuCardEntity.tagOff(Tags.HaikuCardSaved);
        }
      }
    }

    wasLetterboxes = v.letterboxes;
    wasHideHUD = v.hideHUD;
  });

  const envEvents = world.listen([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);
  const envView = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  const collectedTokenView = world.view(Tags.CollectedToken);
  const collectedTokenEvents = world.listen(Tags.CollectedToken);

  const finishedPoemView = world.view(Tags.FinishedPoem);

  const collectedHaikuEvents = world.listen([
    Tags.FinishedPoem,
    Tags.HaikuInInventory,
  ]);
  const allFinishedHaikuEvents = world.listen(Tags.FinishedPoem);
  const allFinishedHaikus = world.view(Tags.FinishedPoem);
  const collectedHaikuView = world.view(Tags.HaikuInInventory);

  let wasMoving = null;
  let wasTransition = false;
  let wasResolving = false;

  return function uiSystem(dt) {
    if (!world.findTag(Tags.AppState).ready) {
    }

    if (onOutroEvent.added.length > 0) {
      store.update((d) => ({
        ...d,
        pause: true,
        endState: true,
        state: "landing",
      }));
    }

    const target = world.findTag(Tags.UserTarget);
    const newMoving = target && target.forceApplied;
    if (newMoving !== wasMoving) {
      store.update((d) => ({ ...d, moving: newMoving }));
      wasMoving = newMoving;
    }

    const hasLetterboxes = letterboxView.length > 0;
    if (wasLetterboxes !== hasLetterboxes) {
      store.update((d) => ({ ...d, letterboxes: hasLetterboxes }));
      wasLetterboxes = hasLetterboxes;
    }

    const isHideHUD = uiEntity.has(Tags.GameStarted)
      ? Boolean(world.findTag(Tags.HideHUD))
      : true;
    if (wasHideHUD !== isHideHUD) {
      store.update((d) => ({ ...d, hideHUD: isHideHUD }));
      wasHideHUD = isHideHUD;
    }

    if (envEvents.changed) {
      if (envView.length > 0) {
        const active = envView[0].get(Tags.EnvironmentState);
        store.update((d) => ({ ...d, haikusTotal: active.haikusTotal }));
      }
    }

    if (collectedTokenEvents.changed) {
      const tokensCollected = collectedTokenEvents.query.entities.map(
        (e) => e.get(Tags.CollectedToken).type
      );
      // console.log("tokens", tokensCollected);
      store.update((d) => ({
        ...d,
        tokensCollected,
      }));
    }

    const isDirectingToOrigin = Boolean(world.findTag(Tags.DirectUserToOrigin));
    const isCameraStopped = Boolean(world.findTag(Tags.CameraStopUserMovement));
    const blockTokens = Boolean(world.findTag(Tags.BlockTokenCollection));
    const newCanCollectTokens =
      !isCameraStopped && !isDirectingToOrigin && !blockTokens;
    if (newCanCollectTokens !== canCollectTokens) {
      canCollectTokens = newCanCollectTokens;
      store.update((d) => ({
        ...d,
        canCollectTokens,
      }));
    }

    const isResolving = Boolean(world.findTag(Tags.ShowBiomeResolution));
    if (isResolving !== wasResolving) {
      store.update((d) => ({ ...d, resolving: isResolving }));
      wasResolving = isResolving;
    }

    const isTransition = Boolean(world.findTag(Tags.TransitionToNextBiome));
    if (isTransition !== wasTransition) {
      const curEnv = envView.length
        ? envView[0].get(Tags.EnvironmentState).name
        : null;
      if (isTransition && curEnv !== "tundra") {
        store.update((d) => ({
          ...d,
          transitionOverlay: true,
          transitionCurrentBiome: curEnv,
        }));
      }
      wasTransition = isTransition;
    }

    if (collectedHaikuEvents.changed && collectedHaikuEvents.added.length > 0) {
      const poem = collectedHaikuEvents.added[0].get(Tags.FinishedPoem);
      const collected = collectedHaikuEvents.query.entities.map((e) => {
        const poem = e.get(Tags.FinishedPoem);
        return {
          tokens: poem.tokens.slice(),
          lines: poem.lines.slice(),
        };
      });
      store.update((d) => {
        return {
          ...d,
          newlyCollectedHaiku: showHaikuCard
            ? {
                tokens: poem.tokens.slice(),
                lines: poem.lines.slice(),
              }
            : false,
        };
      });
    }

    if (allFinishedHaikuEvents.changed) {
      const finished = allFinishedHaikus.map((e) => {
        const poem = e.get(Tags.FinishedPoem);
        return {
          tokens: poem.tokens.slice(),
          lines: poem.lines.slice(),
        };
      });
      store.update((d) => {
        return {
          ...d,
          finishedHaikus: finished,
        };
      });
    }

    if (collectedHaikuEvents.changed) {
      // let { haikusCollected, haikusTotal } = get(store);

      // const newCards = collectedHaikuEvents.added.length;
      // const newHaikusCollected = Math.min(
      //   haikusTotal,
      //   haikusCollected + newCards
      // );

      store.update((d) => ({
        ...d,
        haikusCollected: collectedHaikuView.length,
      }));
    }
  };
}
