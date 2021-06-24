import videoSrc from "../assets/video/intro.mp4";
import { audioState } from "./stores";

let video;
let metadataCB;
let metadata = new Promise((resolve) => {
  metadataCB = resolve;
});

audioState.subscribe(({ muted, visible }) => {
  const shouldMute = muted || !visible;
  if (hasVideo()) {
    const vid = getVideo();
    vid.muted = shouldMute;
  }
});

export function unmountVideo() {
  if (video) {
    console.log("pausing video");
    video.pause();
    if (video.parentElement) video.parentElement.removeChild(video);
    video = null;
  }
}

export function hasVideo() {
  return Boolean(video);
}

export function pauseVideo() {
  if (video) video.pause();
}

export function getMetadata() {
  return metadata;
}

export function getVideo() {
  if (!video) {
    video = document.createElement("video");
    video.className = "global-intro-video";
    video.style.visibility = "hidden";
    video.setAttribute("src", videoSrc);
    video.setAttribute("webkit-playsinline", "webkit-playsinline");
    video.setAttribute("playsinline", "playsinline");
    // video.setAttribute("volume", 0.3);
    video.setAttribute("preload", "auto");
    video.volume = 0.4;
    video.removeAttribute("controls");
    video.addEventListener("loadedmetadata", metadataCB);
    video.load();
  }
  return video;
}
