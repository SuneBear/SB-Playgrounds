/**
 * @author mrdoob / http://mrdoob.com/
 */

// import { Cache } from './Cache.js';
import * as THREE from "three";
const Loader = THREE.Loader;
// const Cache = THREE.Cache;

const loading = {};

function FetchFileLoader(manager) {
  Loader.call(this, manager);
}

FetchFileLoader.prototype = Object.assign(Object.create(Loader.prototype), {
  constructor: FetchFileLoader,

  load: function (url, onLoad, onProgress, onError) {
    if (url === undefined) url = "";
    if (this.path !== undefined) url = this.path + url;
    url = this.manager.resolveURL(url);
    const scope = this;
    window
      .fetch(url)
      .then((resp) => {
        return resp.arrayBuffer();
      })
      .then(
        (buffer) => {
          onLoad(buffer);
        },
        (err) => {
          onError(err);
        }
      );
  },

  setResponseType: function (value) {
    // this.responseType = value;
    return this;
  },

  setWithCredentials: function (value) {
    // this.withCredentials = value;
    return this;
  },

  setMimeType: function (value) {
    // this.mimeType = value;
    return this;
  },
});

export { FetchFileLoader };
