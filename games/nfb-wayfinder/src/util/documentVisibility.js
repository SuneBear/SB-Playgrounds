export default function documentVisibility(cb) {
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  if (hidden) {
    const trigger = () => {
      if (document[hidden]) cb(false);
      else cb(true);
    };
    // Handle page visibility change
    document.addEventListener(visibilityChange, trigger, false);
    trigger();
  } else {
    cb(true);
  }
}
