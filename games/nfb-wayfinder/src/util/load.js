import * as THREE from "three";

// export function load(opt = {}) {
//   return loadAsset(opt);
// }

export function loadImage(url, opt = {}) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onerror = () => {
      console.error(`Could not load Texture by URL ${url}`);
      // TODO: nil canvas fallback image
      resolve(img);
    };
    img.onload = () => {
      resolve(img);
    };
    if (opt.crossOrigin != null) img.crossOrigin = opt.crossOrigin;
    img.src = url;
  });
}

let container;

export function loadTexture(url, opt = {}) {
  const imgPromise = /\.svg$/i.test(url)
    ? loadSVGToImage(url, opt)
    : loadImage(url, opt);
  return imgPromise.then((img) => {
    const tex = new THREE.Texture();
    tex.image = img;
    const texOpts = { ...opt };
    delete texOpts.crossOrigin;
    Object.assign(tex, texOpts);
    tex.needsUpdate = true;
    return tex;
  });
}

async function loadSVGToImage(url, opt = {}) {
  const resp = await fetch(url);
  const svg = await resp.text();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const dataUrl = "data:image/svg+xml;charset-utf-8," + encodeURIComponent(svg);
  const image = await loadImage(dataUrl, opt);
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);
  return canvas;
}

// async function svgToImage (svgStr, opt = {}) {
//   let blob;
//   try {
//     blob = new window.Blob([ svgStr ], {
//       type: 'image/svg+xml;charset=utf-8'
//     })
//   } catch (e) {
//     return Promise.reject(e);
//   }

//   const DOMURL = getURL();
//   let url = DOMURL.createObjectURL(blob);
//   loadImage(url, opt)
//     .then(img => {
//       revoke();
//     })
//     .catch(err => {
//       revoke();
//       // try again for Safari 8.0, using simple encodeURIComponent
//       // this will fail with DOM content but at least it works with SVG
//       var url2 = 'data:image/svg+xml,' + encodeURIComponent(svg.join(''))
//       return loadImage(url2, opt);
//     });
// }

// function getURL () {
//   return window.URL ||
//   window.webkitURL ||
//   window.mozURL ||
//   window.msURL
// }
