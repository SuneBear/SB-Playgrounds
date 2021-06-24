const tasks = [];
const postRenderCallbacks = [];
const preRenderCallbacks = [];

export function addFrameTask(cb) {
  tasks.push(cb);
}

export function nextFrameTask() {
  if (!tasks.length) return null;
  return tasks.shift();
}

export function addPostRenderCallback(cb) {
  postRenderCallbacks.push(cb);
}

export function addPreRenderCallback(cb) {
  preRenderCallbacks.push(cb);
}

export function preRender() {
  preRenderCallbacks.forEach((fn) => fn());
}

export function postRender() {
  postRenderCallbacks.forEach((fn) => fn());
}
