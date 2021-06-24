export default function defined(a, b) {
  return typeof a === "undefined" ? b : a;
}
