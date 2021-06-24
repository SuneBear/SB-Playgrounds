import * as Tags from "../tags";
import { AudioMeta } from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import AudioAssets from "../assets/audio/*.{mp3,ogg}";
import documentVisibility from "../util/documentVisibility";
import { Howl, Howler } from "howler";

// Howler.autoUnlock = false;

// Audio options to be binded to start screen later
import createPlayer from "web-audio-player";
import Random from "../util/Random";
// import audioRamp from "../util/audio-ramp";
import rightNow from "right-now";
import { addFrameTask } from "../util/addFrameTasks";
import queryString from "../util/query-string";
import getConfig from "../config";
import { audioState } from "../util/stores";

const IS_NATIVE = Boolean(getConfig().native);
const USE_OGG = false;
// On native we will be able to circumvent user gesture issues
const isAutoPlaySupported = IS_NATIVE;
const ALLOW_BUFFER = true;
const isLowQualityAudio = false;
const defaultOptions = { volume: 0.6 };

Object.keys(AudioAssets).forEach((key) => {
  const { mp3, ogg } = AudioAssets[key];
  const arr = (USE_OGG ? [ogg, mp3] : [mp3]).filter(Boolean);
  AudioAssets[key] = arr;
});

const CurAudioContext = window.AudioContext || window.webkitAudioContext;

const resume = (context) => {
  if (context.state === "suspended" && typeof context.resume === "function") {
    return context.resume();
  }
};

export default function AudioSystem(world) {
  if (!CurAudioContext) {
    console.log("No audio context, audio system skipped");
    return;
  }

  const willTriggerAudios = world.view([Tags.WillTriggerAudio, Tags.Object3D]);
  const tapEmitter = world.findTag(Tags.InputGestureEmitter);
  const isIOS = /(iOS|iPad|iPod|iPhone)/i.test(navigator.userAgent);

  audioState.subscribe(({ muted, visible }) => {
    const shouldMute = muted || !visible;
    Howler.mute(shouldMute);
  });

  const gameIntroOverlayEvents = world.listen(
    Tags.OriginTreeIntroSequenceStarted
  );

  const random = Random();

  let started = false;
  // const orbQuery = world.query(Tags.CollectTokenOrb);
  const orbTriggerEvent = world.listen(Tags.CollectTokenOrb);
  const orbNotes = ["a3", "c3", "c4", "d3", "d4", "e3", "g3"];
  const orbDeck = random.deck(orbNotes);
  const orbCache = {};

  const backgrounds = {
    forest: {
      biome: "forest",
      musicId: "music1",
      natureId: "nature1",
    },
    grasslands: {
      biome: "grasslands",
      musicId: "music2",
      natureId: "nature2",
    },
    tundra: {
      biome: "tundra",
      musicId: queryString.musicA ? "music3a" : "music3b",
      natureId: "nature3",
    },
  };

  const triggers = triggerAudioEvents(
    [
      // {
      //   query: Tags.GameStarted,
      //   assets: ["score-start"],
      //   options: { volume: 1, preload: true },
      // },
      {
        query: Tags.CollectedToken,
        assets: ["writing-01", "writing-02", "writing-03"],
        options: { volume: 0.5 },
      },
      // {
      //   query: Tags.CollectedToken,
      //   assets: ["collect1"],
      // },
      {
        query: Tags.HaikuCardSaved,
        assets: ["haiku-card"],
      },
      {
        query: Tags.HaikuCardShown,
        assets: ["score-haiku"],
        options: { volume: 1 },
      },
      {
        query: Tags.UserHitAudioTrigger,
        condition: (entity) => {
          const d = entity.get(Tags.UserHitAudioTrigger);
          return d.type === "tree";
        },
        options: { volume: 0.5, allowMultiple: true },
        assets: ["leaves1", "leaves2", "leaves3", "leaves4"],
      },
      {
        needsCharacter: false,
        query: Tags.TriggerTreeTransitionAudio,
        // condition: (entity) => {
        //   const d = entity.get(Tags.UserHitAudioTrigger);
        //   return d.type === "origin_tree";
        // },
        options: { volume: 0.5, preload: false },
        assets: ["tree-transition-0"],
      },
      isLowQualityAudio
        ? false
        : {
            // leaf audio
            query: Tags.UserHitAudioTrigger,
            condition: (entity) => {
              const d = entity.get(Tags.UserHitAudioTrigger);
              return d.type === "ice";
            }, // https://freesound.org/people/skinnytecboy/sounds/174388/
            options: {
              volume: 0.5,
              allowMultiple: false,
              preload: false,
              playthrough: true,
            },
            assets: ["ice-01", "ice-02", "ice-03"],
          },
      isLowQualityAudio
        ? false
        : {
            // leaf audio
            query: Tags.UserHitAudioTrigger,
            condition: (entity) => {
              const d = entity.get(Tags.UserHitAudioTrigger);
              return d.type === "water";
            },
            envelope: {
              attack: 0.2,
              sustain: 1,
              volume: [0.4, 0.75],
              release: 0.5,
              delay: 0,
            },
            options: { volume: 0.5, preload: false, allowMultiple: true },
            assets: ["water-01", "water-02"],
          },
      isLowQualityAudio
        ? false
        : {
            // leaf audio
            query: Tags.UserHitAudioTrigger,
            condition: (entity) => {
              const d = entity.get(Tags.UserHitAudioTrigger);
              return d.type === "leaf";
            },
            envelope: {
              attack: 0.2,
              sustain: 0.1,
              volume: [0.4, 0.75],
              release: 0.5,
              delay: 0,
            },
            options: { volume: 0.11, preload: false, allowMultiple: true },
            assets: ["grass-push1", "grass-push2"],
          },
      {
        query: Tags.WaitingForBiomeResolution,
        assets: ["collect-poem"],
        options: { preload: false },
      },
      isLowQualityAudio
        ? false
        : {
            query: Tags.HatTipWindLineSound,
            condition: (e) => {
              return random.chance(0.5);
            },
            assets: ["movement-forest"],
            options: { volume: 0.2, allowMultiple: true },
          },
      {
        query: Tags.TutorialBarrenGround,
        removing: true,
        assets: ["score-start"],
        options: { volume: 1 },
      },
      {
        query: Tags.TokenIsCollecting,
        assets: ["reveal01"],
        options: { volume: 1 },
      },
      {
        query: Tags.CompassVisible,
        assets: ["reveal02"],
        options: { volume: 0.75 },
      },
      // {
      //   query: orbQuery,
      //   deck: true,
      //   assets: [
      //     "bnote1",
      //     "bnote2",
      //     "bnote3",
      //     "bnote4",
      //     "bnote5",
      //     "bnote6",
      //     "bnote7",
      //   ],
      //   options: { volume: 0.65 },
      // },
      // {
      //   query: Tags.PauseOpen,
      //   assets: ["menu-open"],
      //   options: { volume: 0.6 },
      // },
      // {
      //   query: Tags.ButtonHover,
      //   assets: ["button-hover"],
      //   options: { volume: 0.6, preload: true },
      // },
      {
        query: Tags.ButtonClick,
        assets: ["click"],
        options: { volume: 0.75, preload: true },
      },
      // {
      //   query: Tags.HaikuInInventory,
      //   assets: ["haiku-card"],
      // },
      {
        query: Tags.JournalOpen,
        assets: ["journal-open"],
        options: { volume: 0.5, preload: false },
      },
      {
        query: Tags.AnimalSound,
        condition: (e) => e.get(Tags.AnimalSound) === "fish",
        assets: ["fish"],
        options: { volume: 0.45, preload: false },
      },
      {
        query: Tags.AnimalSound,
        condition: (e) =>
          random.chance(0.5) && e.get(Tags.AnimalSound) === "birdChirp",
        assets: ["bird0"],
        options: { volume: 0.4, preload: false },
      },
      {
        query: Tags.AnimalSound,
        condition: (e) => e.get(Tags.AnimalSound) === "birdFlap",
        assets: ["birdflap"],
        options: { volume: 0.25, preload: false },
      },
      {
        query: Tags.AnimalSound,
        condition: (e) => e.get(Tags.AnimalSound) === "butterfly",
        assets: ["butterfly"],
        options: { volume: 1, preload: false },
      },
      {
        needsCharacter: false,
        query: Tags.ShowBiomeResolution,
        assets: ["score-restore"],
        options: { volume: 1, preload: false },
      },
      {
        query: Tags.TransitionToNextBiome,
        condition: (entity) => {
          // const d = entity.get(Tags.UserHitAudioTrigger);
          // console.log("TRANSITIONING TO NEXT BIOME");
          return true;
        },
        assets: ["score-transition"],
        options: { volume: 1, preload: false },
      },
      {
        query: Tags.EndGameState,
        assets: ["score-outro"],
        options: { volume: 1, preload: false },
      },
      ,
      {
        query: Tags.FlashSound,
        assets: ["flash-build-up"],
        options: { volume: 0.25, preload: false },
      },
    ].filter(Boolean)
  );

  const tmp2DA = new THREE.Vector2();
  const tmp3DA = new THREE.Vector3();
  const tmp2DB = new THREE.Vector2();

  let audioTriggerCoolDown = false;
  let audioTriggerTime = 0;
  let audioTriggerThrottle = 0.1;
  let lastEnv;
  let curPlayingBackground;
  const envStates = world.view(Tags.ActiveEnvironmentState);
  const startCollectingEvent = world.listen(Tags.TokenIsCollecting);

  if (isAutoPlaySupported) {
    addFrameTask(() => start());
  } else {
    tapEmitter.once("tap", () => {
      // console.log("Tapped once!");
      start();
    });
  }

  // rain
  const rainEvent = world.listen(Tags.Raining);
  const rainVolume = 0.25;
  let rainSound, rainTimer;
  const startRain = () => {
    if (!rainSound) {
      rainSound = new Howl({
        src: AudioAssets.rain,
        loop: true,
        volume: 0.25,
      });
    }
    clearTimeout(rainTimer);
    rainSound.stop();
    rainSound.play();
    rainSound.fade(0, rainVolume, 1000);
  };

  // purring
  const purringEvent = world.listen(Tags.FoxPurring);
  const purringVolume = 0.18;
  let purringSound, purringTimer;
  const startPurring = () => {
    if (!purringSound) {
      purringSound = new Howl({
        src: AudioAssets.foxpurring,
        loop: true,
        volume: purringVolume,
      });
    }
    clearTimeout(purringTimer);
    purringSound.stop();
    purringSound.play();
    purringSound.fade(0, purringVolume, 1000);
  };

  const stopPurring = () => {
    if (!purringSound) return;
    purringSound.fade(purringVolume, 0, 1000);
    purringTimer = setTimeout(() => purringSound.stop(), 1000);
  };

  // hm?
  const foxHmEvent = world.listen(Tags.FoxHm);
  const foxHmVolume = 0.4;
  let foxHmSound;
  const startFoxHm = () => {
    if (!foxHmSound) {
      foxHmSound = new Howl({
        src: AudioAssets.foxhm,
        loop: false,
        volume: foxHmVolume,
      });
    }
    foxHmSound.stop();
    foxHmSound.play();
    foxHmSound.fade(0, foxHmVolume, 1);
  };

  const stopFoxHm = () => {
    if (!foxHmSound) return;
    foxHmSound.stop();
  };

  const createOrb = (id) => {
    return new Howl({
      volume: 0.55,
      src: AudioAssets[id],
    });
  };

  return function audioSystem(dt) {
    if (!started) return;

    if (rainEvent.changed) {
      if (rainEvent.added.length) {
        startRain();
      } else if (rainEvent.removing.length) {
        if (rainSound) {
          rainSound.fade(rainVolume, 0, 1000);
          rainTimer = setTimeout(() => rainSound.stop(), 1000);
        }
      }
    }

    if (purringEvent.changed) {
      if (purringEvent.added.length) {
        startPurring();
      } else if (purringEvent.removing.length) {
        stopPurring();
      }
    }

    if (foxHmEvent.changed) {
      if (foxHmEvent.added.length == 1) {
        startFoxHm();
      } else if (purringEvent.removing.length) {
        stopFoxHm();
      }
    }

    if (gameIntroOverlayEvents.changed) {
      const hasIntro = Boolean(
        world.findTag(Tags.OriginTreeIntroSequenceStarted)
      );
      if (
        curPlayingBackground &&
        curPlayingBackground.players &&
        curPlayingBackground.ids
      ) {
        curPlayingBackground.players.forEach((p) => {
          p.fade(hasIntro ? 1 : 0, hasIntro ? 0 : 1, 500);
        });
      }
    }
    const envState = envStates.length
      ? envStates[0].get(Tags.EnvironmentState)
      : null;
    const envName = envState && envState.name;

    if (envStates.length) {
      if (envName !== lastEnv) {
        const bg = backgrounds[envName];
        if (curPlayingBackground) {
          stopBackground(curPlayingBackground);
          // console.log("[Audio]", "Stop background");
        }
        playBackground(bg);
        // console.log("[Audio]", "Play new background");

        // cache orb music notes
        orbNotes.forEach((note) => {
          const id = `note-${envName}-${note}`;
          if (!(id in orbCache)) {
            orbCache[id] = createOrb(id);
          }
        });
      }
      lastEnv = envName;
    }

    if (audioTriggerCoolDown) {
      audioTriggerTime += dt;
      if (audioTriggerTime >= audioTriggerThrottle) {
        audioTriggerCoolDown = false;
        audioTriggerTime = 0;
      }
    }

    if (startCollectingEvent.added.length > 0) {
      orbDeck.reset();
      // const orb = triggers.listeners.find(
      //   (listener) => listener.query === orbQuery
      // );
      // if (orb && orb.deck) {
      //   // reset notes so we don't get duplicates
      //   orb.deck.reset();
      // }
    }
    if (orbTriggerEvent.added.length > 0) {
      const note = orbDeck.next();
      const id = `note-${envName}-${note}`;
      if (!(id in orbCache)) {
        orbCache[id] = createOrb(id);
      }
      orbCache[id].play();
    }
    triggers.update();

    // if (curPlayingBackground) {
    // curPlayingBackground.ramp.update(dt);
    // }

    const userPos = world.findTag(Tags.UserCharacter).position;
    tmp2DA.set(userPos.x, userPos.z);

    for (let i = 0; i < willTriggerAudios.length; i++) {
      const e = willTriggerAudios[i];
      const obj = e.get(Tags.Object3D);
      if (obj.visible) {
        obj.getWorldPosition(tmp3DA);
        tmp2DB.set(tmp3DA.x, tmp3DA.z);
        const distSq = tmp2DA.distanceToSquared(tmp2DB);
        const dTh = 2;
        const dThSq = dTh * dTh;
        const isInside = distSq <= dThSq;

        if (isInside) {
          if (!audioTriggerCoolDown && !e.has(Tags.UserHitAudioTrigger)) {
            audioTriggerCoolDown = true;
            audioTriggerTime = 0;
            e.add(Tags.UserHitAudioTrigger);
            const audioData = e.get(Tags.UserHitAudioTrigger);
            // TODO: other sound types
            audioData.type = "tree";
          }
        } else {
          if (e.has(Tags.UserHitAudioTrigger)) {
            e.remove(Tags.UserHitAudioTrigger);
          }
        }
      }
    }
  };

  function start() {
    started = true;

    let biome = "forest";
    if (envStates.length > 0) {
      const envState = envStates[0].get(Tags.EnvironmentState);
      biome = envState.name;
    }
    // console.log("starting audio");
    lastEnv = biome;
    const bg = biome in backgrounds ? backgrounds[biome] : null;
    if (bg) {
      playBackground(bg);
    }
  }

  function stopBackground(bg) {
    if (bg && bg.players) {
      // console.log("stopping background", bg);
      bg.players.forEach((p) => {
        p.stop();
      });
      bg.ids = null;
    }
    curPlayingBackground = null;
  }

  function playBackground(bg) {
    if (bg) {
      if (!bg.players) {
        // console.log("starting background", bg);
        bg.players = [bg.natureId, bg.musicId].map((id) => {
          return new Howl({
            src: AudioAssets[id],
            loop: true,
            html5: true,
          });
        });
      }
      bg.players.forEach((p) => p.stop());
      bg.ids = bg.players.map((p) => {
        return p.play();
      });
    }
    curPlayingBackground = bg;
  }

  function triggerAudioEvents(events) {
    const listeners = events.map(
      ({
        query,
        envelope,
        assets,
        options,
        condition,
        deck = false,
        removing = false,
      }) => {
        const listener = world.listen(query);
        const playerOptions = {
          ...defaultOptions,
          ...options,
        };
        const preload = playerOptions.preload !== false;
        const players = assets.map((id) => {
          const urls = AudioAssets[id];
          const sound = new Howl({
            ...playerOptions,
            src: urls,
            autoplay: false,
            preload,
            // html5: false,
          });
          return sound;
        });

        let hasLoaded = preload;
        if (hasLoaded) {
          // console.log(
          //   "[audio] Pre-loading",
          //   AudioAssets[[].concat(assets)[0]][0]
          // );
        }

        return {
          deck: deck ? random.deck(players) : null,
          query,
          removing,
          condition,
          players,
          load() {
            if (!hasLoaded) {
              // console.log(
              //   "[audio] Loading",
              //   AudioAssets[[].concat(assets)[0]][0]
              // );
              hasLoaded = true;
              players.forEach((p) => p.load());
            }
          },
          listener,
        };
      }
    );

    return {
      listeners,
      update(dt = 0) {
        const playerShowing =
          !world.findTag(Tags.HideCharacter) &&
          !world.findTag(Tags.AnimateOutCharacter);
        listeners.forEach((audio) => {
          const {
            listener,
            needsCharacter = true,
            condition,
            players,
            removing = false,
          } = audio;

          const list = removing ? listener.removing : listener.added;
          if (listener.changed && list.length > 0) {
            if (needsCharacter && !playerShowing) {
              return;
            }

            if (condition) {
              list.forEach((e) => {
                if (condition(e, audio)) {
                  playAudio(audio);
                }
              });
            } else {
              playAudio(audio);
            }
          }
        });
      },
    };

    function playAudio(audio) {
      audio.load();

      const player = audio.deck
        ? audio.deck.next()
        : random.pick(audio.players);
      // console.log("[audio] Playing", player._src);
      player.play();
    }
  }
}

function attachIOSAudioFix(audioCtx) {
  var fixAudioContext = function (e) {
    // Remove events
    document.removeEventListener("touchstart", fixAudioContext);
    document.removeEventListener("touchend", fixAudioContext);
    window.removeEventListener("mousedown", fixAudioContext);
    (async () => {
      const p = resume(audioCtx);
      if (p) await p;
      // Create empty buffer
      var buffer = audioCtx.createBuffer(1, 1, 22050);
      var source = audioCtx.createBufferSource();
      source.buffer = buffer;
      // Connect to output (speakers)
      source.connect(audioCtx.destination);
      // Play sound
      if (source.start) {
        source.start(0);
      } else if (source.play) {
        source.play(0);
      } else if (source.noteOn) {
        source.noteOn(0);
      }
    })();
  };
  // iOS 6-8
  document.addEventListener("touchstart", fixAudioContext);
  // iOS 9
  document.addEventListener("touchend", fixAudioContext);
  window.addEventListener("mousedown", fixAudioContext);
}
