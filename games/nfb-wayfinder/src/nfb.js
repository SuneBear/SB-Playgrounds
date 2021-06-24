import loadScript from "load-script";
import getConfig from "./config.js";
import { language } from "./util/locale.js";
import { audioState } from "./util/stores.js";

// const UA_ACCOUNTS = ["UA-32257069-1", "UA-124182036-7"];
const UA_ACCOUNTS = ["UA-124182036-7"];
const PROJECT_NAME = "wayfinder";
const USE_HEADER = true;

let headerTimer = null;
let headerVisible = false;
let resolve;
const promise = new Promise((cb) => {
  resolve = cb;
});

let headerReady;
const headerReadyPromise = new Promise((cb) => {
  headerReady = cb;
});

export function sendTrackingPixel() {
  if (!getConfig().nfbHeader) return;
  const url =
    "https://ad.doubleclick.net/ddm/activity/src=10976879;type=1;cat=start0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=1?";
  let img = new Image();
  img.onload = () => {
    console.log("[analytics] Tracking Pixel");
    img = null;
  };
  img.onerror = () => {
    img = null;
    console.warn("[analytics] Tracking Pixel Ignored");
  };
  img.src = url;
}

export async function revealHeader() {
  await Promise.all([promise, headerReadyPromise]);
  // if (headerVisible) return;
  // headerVisible = true;
  // clearTimeout(headerTimer);
  // headerTimer = null;
  window.ifw_header.reveal();
  // document.body.classList.remove("hide-header");
  // document.body.classList.remove("anim-out-header");
  // if (window.ifw_header) window.ifw_header.reveal();
}

window.revealHeader = revealHeader;
export async function hideHeader() {
  await Promise.all([promise, headerReadyPromise]);
  // if (!headerVisible) return;
  // headerVisible = false;
  // clearTimeout(headerTimer);
  // headerTimer = null;
  window.ifw_header.hide();
  // // document.body.classList.add("anim-out-header");
  // headerTimer = setTimeout(() => {
  //   // document.body.classList.add("hide-header");
  // }, 1025);
  // if (window.ifw_header) window.ifw_header.hide();
}

export async function sendAnalytics(opt = {}) {
  await promise;
  if (
    typeof google_analytics !== "undefined" &&
    typeof google_analytics.gaTrack === "function"
  ) {
    console.log("[analytics] Sending", opt);
    const curLang = language.get();
    try {
      UA_ACCOUNTS.forEach((ua_code) => {
        google_analytics.gaTrack({
          ...opt,
          language: curLang,
          name: PROJECT_NAME,
          ua_code,
        });
      });
    } catch (err) {
      console.warn(err);
    }
  }
}

if (getConfig().nfbHeader && USE_HEADER) {
  document.addEventListener("ifw_muteSound", (ev) => {
    audioState.update((d) => ({ ...d, muted: true }));
  });
  document.addEventListener("ifw_unmuteSound", (ev) => {
    audioState.update((d) => ({ ...d, muted: false }));
  });

  document.addEventListener("ifw_headerAdded", () => {
    window.ifw_header.hide();
    headerReady();
  });
  document.addEventListener("ifw_headerLoaded", () => {
    window.ifw_header.init({
      projectId: 237,
      baseUrl: {
        en: "http://wayfinder.nfb.ca/",
        fr: "http://traversees.onf.ca/",
      },
      analytics_name: "wayfinder",
      analytics_code: UA_ACCOUNTS[0],
      buttons: {
        shareTwitter: false,
        shareFB: false,
        // hideOnNoActivity: 10000,
        hideOnScroll: false,
      },
      forceLocale: language.get(),
    });
    // setTimeout(revealHeader, 2500);
    // window.ifw_header.header.trackAnalytics = function () {
    //   debugger;
    //   return oldFunc.call(window.ifw_header.header);
    // };
    // window.ifw_header.stopAutoHide();
    // setTimeout(() => {
    //   window.ifw_header.hide();
    // }, 0);
    // document.querySelector('')
    console.log("NFB Header Loaded");
    // document.body.classList.remove("hide-header");
    resolve();

    sendAnalytics({
      pageview: "index",
    });
    sendAnalytics({
      event: "auto_begin",
      eventLabel: "Wayfinder",
    });
    // revealHeader();
  });

  // document.body.classList.add("anim-out-header");
  loadScript(
    "https://interactive-pip.nfb.ca/v2/app.js",
    {
      async: true,
      type: "text/javascript",
    },
    (err, script) => {
      if (err) {
        console.error("Could not load NFB header");
        console.error(err);
        resolve();
      }
    }
  );
} else {
  setTimeout(resolve, 0);
}

export function startButtonTracking() {
  const url =
    "https://ad.doubleclick.net/ddm/activity/src=10976879;type=1;cat=start0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};ord=1?";
  // what to do?
  // const img = new Image();
  // img.onload = () => console.error("image error");
  // img.src = url;
  // ,
  //   {
  //     type: "text/javascript",
  //   },
  //   (err, script) => {
  //     if (err) {
  //       console.error("[tracker] Could not load start tracking");
  //       console.error(err);
  //     } else {
  //       console.log("[tracker] Loaded start tracking");
  //     }
  //   }
  // );
}
