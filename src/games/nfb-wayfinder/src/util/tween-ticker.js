import eases from "eases";
import Ticker from "tween-ticker";
const defaultOpts = { eases };

export default function TweenTicker(opt = {}) {
  return Ticker({ ...defaultOpts, ...opt });
}
