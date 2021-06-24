import * as Tags from "../tags";
import * as THREE from "three";
import resetPlayerPos from "../util/resetPlayerPos";
import { setEntityTweenFromTo, tweenFromTo } from "./AnimationSystem";
import Line3D from "./writing/Line3D";
import { localize } from "../util/locale";
import Assets from "../util/Assets";
import queryString from "../util/query-string";

export default function IntroTutorialSystem(world) {
  const entity = world.entity();

  const tapClickText = /(iOS|Android|iPhone|iPad)/i.test(navigator.userAgent)
    ? "Tap"
    : "Click";

  let started = false;
  let hasReset = false;
  let readyToShow = false;
  let waitingToShowCharacter = false;
  const showCharacterDelay = 2;
  let delayTimer = 0;
  let waitingForForce = false;
  let waitingForMovement = false;
  let waitingForVisibleToken = false;
  let waitingForTokenCollect = false;
  let waitingForTokenCollectionHint = false;
  let waitingForSecondToken = false;
  let waitingForHaiku = false;
  let skipIntroMessages = false;
  const tokenCollectionHintDelay = 1.5;
  const moveFromTreeRadius = 10;
  const moveFromTreeRadiusSq = moveFromTreeRadius * moveFromTreeRadius;
  const lastTargetPosition = new THREE.Vector3();
  const messages = world.view(Tags.TutorialMessage);

  const haikuCollectedEvents = world.listen(Tags.FinishedPoem);
  let hasSeenFirstResolve = false;
  const firstResolve = world.listen(Tags.DirectUserToOrigin);
  const cardSavedEvents = world.listen(Tags.HaikuCardSaved);

  const addMessage = (opts = {}) => {
    return world.entity().add(Tags.TutorialMessage, opts);
  };

  if (queryString.resolve) skipIntroMessages = true;

  return (dt) => {
    const userTarget = world.findTag(Tags.UserTarget);
    const userPos = userTarget.position;

    // first we reset the character
    const readyToReset = world.findTag(Tags.CanSetIntroTags);
    if (!hasReset && readyToReset) {
      hasReset = true;
      world.findTag(Tags.UserTarget).position.set(0, 0, 0);
      entity.tagOn(Tags.BlockTokenCollection);
      entity.tagOn(Tags.TutorialState);
      // entity.tagOn(Tags.HideCharacter);
      // entity.tagOn(Tags.HideHUD);
      entity.tagOn(Tags.CameraZoomOut);
      // entity.tagOn(Tags.LetterboxBars);
      entity.tagOn(Tags.TutorialBarrenGround);
      entity.tagOn(Tags.ClearInputPress);
      // entity.tagOn(Tags.BlockUserMove);
      // entity.tagOn(Tags.CameraStopUserMovement);
      // entity.tagOn(Tags.ModalStoppingUserMovement);
    }

    const ready =
      world.findTag(Tags.GameStarted) &&
      readyToReset &&
      !world.findTag(Tags.OriginTreeIntroSequence);

    if (!started && ready) {
      started = true;
      waitingToShowCharacter = true;
    }

    if (waitingToShowCharacter) {
      delayTimer += dt;
      if (delayTimer >= showCharacterDelay) {
        delayTimer = 0;
        waitingToShowCharacter = false;
        // entity.tagOff(Tags.BlockUserMove);
        // entity.tagOff(Tags.CameraStopUserMovement);
        // entity.tagOff(Tags.ModalStoppingUserMovement);
        waitingForForce = true;
        if (!skipIntroMessages) {
          addMessage({
            id: "tap-to-move",
            // message: `${tapClickText} + Hold to Explore`,
            message: localize.get().tutorialTapHold,
            iconMode: "finger",
            delay: 1,
          });
        }
      }
    }

    if (waitingForForce && userTarget.forceApplied) {
      entity.tagOff(Tags.CameraZoomOut);
      waitingForForce = false;
      waitingForMovement = true;
    }

    if (waitingForMovement) {
      const lenSq = userTarget.position.lengthSq();
      if (lenSq >= moveFromTreeRadiusSq || queryString.resolve) {
        waitingForMovement = false;
        // messages.forEach((e) => e.kill()); // kill all
        entity.tagOff(Tags.TutorialBarrenGround);
        entity.tagOff(Tags.TutorialState);
        entity.tagOff(Tags.BlockTokenCollection);
        lastTargetPosition.copy(userPos);
        // addMessage(
        //   "find-token",
        //   "Connect the lost fragments to recover memories"
        // );
        if (!skipIntroMessages) {
          addMessage({
            id: "find-token",
            message: localize.get().tutorialCollect,
            iconMode: "token-random",
            delay: 3,
            duration: 6,
          });
        }
        // addTextBeyondCharacter(userTarget, ["below the old-wood trees"]);
      }
    }

    if (haikuCollectedEvents.changed) {
      skipIntroMessages = true;
      messages.forEach((e) => e.kill()); // kill all
    }

    // const isResolving = Boolean(world.findTag(Tags.DirectUserToOrigin));
    // if (
    //   !hasSeenFirstResolve &&
    //   isResolving &&
    //   cardSavedEvents.added.length &&
    //   cardSavedEvents.changed
    // ) {
    //   hasSeenFirstResolve = true;
    //   if (!queryString.resolve) {
    //     addMessage({
    //       id: "resolve",
    //       message: localize.get().tutorialResolve,
    //       iconMode: "tree",
    //       delay: 0,
    //       duration: 6,
    //     });
    //   }
    // }
  };
}
