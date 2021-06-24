import * as THREE from "three";
import { spliceOne } from "./array";

const _addedEvent = { type: "added" };
const _removedEvent = { type: "removed" };

export function detachObject(object) {
  if (object.parent) {
    removeFromObject(object.parent, object);
  }
}

export function addObject(object, child) {
  detachObject(child);
  child.parent = object;
  object.children.push(child);
  object.dispatchEvent(_addedEvent);
}

export function removeFromObject(object, child) {
  const idx = object.children.indexOf(child);
  if (idx >= 0) {
    spliceOne(object.children, idx);
    child.parent = null;
    child.dispatchEvent(_removedEvent);
  }
}

export function clearGroup(g) {
  for (let i = 0; i < g.children.length; i++) {
    const child = g.children[i];
    child.parent = null;
    child.dispatchEvent(_removedEvent);
  }
  g.children.length = 0;
}

export function copyTextureHandle(renderer, textureInstance, textureAtlas) {
  if (textureAtlas.image && !textureInstance.__hasFixedTexture) {
    const atlas = renderer.properties.get(textureAtlas);
    if (!atlas.__webglTexture) {
      console.warn("Re-uploading texture data");
      renderer.initTexture(textureAtlas);
    }
    const data = renderer.properties.get(textureInstance);
    Object.assign(data, atlas);
    textureInstance.__hasFixedTexture = true;
  }
}

export function pruneUserData(obj) {
  const userData = obj.userData;
  Object.keys(userData).forEach((k) => {
    if (k.startsWith("_")) {
      delete userData[k];
    } else if (k === "name" && userData.name === obj.name) {
      delete userData[k];
    }
  });
}

export function disposeTree(obj, { textures = false } = {}) {
  obj.traverse((t) => {
    if (t.__hasDisposedAlready) return;
    if (typeof t.dispose === "function") {
      t.dispose();
      t.__hasDisposedAlready = true;
    }
    if (
      t.geometry &&
      typeof t.geometry.dispose === "function" &&
      !t.geometry.__hasDisposedAlready
    ) {
      t.geometry.dispose();
      t.geometry.__hasDisposedAlready = true;
    }
    if (
      t.material &&
      typeof t.material.dispose === "function" &&
      !t.material.__hasDisposedAlready
    ) {
      t.material.dispose();
      t.material.__hasDisposedAlready = true;
    }
    if (t.material && textures) {
      const m = t.material;
      Object.keys(m).forEach((key) => {
        if (m[key] && m[key].isTexture) {
          m[key].dispose();
        }
      });
      if (m.uniforms) {
        Object.keys(m.uniforms).forEach((key) => {
          if (m[key] && m[key].value && m[key].value.isTexture) {
            m[key].value.dispose();
          }
        });
      }
    }
  });
  clearGroup(obj);
}

export function setPointsToBufferPosition(geometry, points) {
  const vertices = points
    .map((p) => {
      if (Array.isArray(p)) return p;
      return p.toArray();
    })
    .flat();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
}

export function shareAtlasTexture(renderer, atlasTexture, spriteTexture) {
  if (atlasTexture.image && spriteTexture.__hasFixedTexture !== atlasTexture) {
    spriteTexture.__hasFixedTexture = atlasTexture;
    // console.log("Fixing WebGL Image");
    const atlas = renderer.properties.get(atlasTexture);
    if (!atlas.__webglTexture) {
      // console.warn("WARN: Re-uploading texture data for sprite atlas.");
      // console.log("[tex-upload]", atlasTexture.name || atlasTexture.image.src);
      renderer.initTexture(atlasTexture);
    }
    const data = renderer.properties.get(spriteTexture);
    Object.assign(data, atlas);
  }
}

export function fastCopyCameraData(cameraSrc, cameraDst) {
  THREE.Camera.prototype.copy.call(cameraDst, cameraSrc);
  cameraDst.fov = cameraSrc.fov;
  cameraDst.zoom = cameraSrc.zoom;
  cameraDst.near = cameraSrc.near;
  cameraDst.far = cameraSrc.far;
  cameraDst.focus = cameraSrc.focus;
  cameraDst.aspect = cameraSrc.aspect;
  cameraDst.filmGauge = cameraSrc.filmGauge;
  cameraDst.filmOffset = cameraSrc.filmOffset;
}

export function cloneMaterial(c) {
  const oldMat = c.material;
  c.material = oldMat.clone();
  c.material.uniforms = Object.assign({}, oldMat.uniforms);
  for (let p in oldMat.uniforms) {
    const oldV = oldMat.uniforms[p].value;
    if (
      oldV.isColor ||
      oldV.isMatrix3 ||
      oldV.isMatrix4 ||
      oldV.isVector2 ||
      oldV.isVector3 ||
      oldV.isVector4
    ) {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV.clone(),
      });
    } else if (Array.isArray(oldV)) {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV.slice(),
      });
    } else {
      c.material.uniforms[p] = Object.assign({}, c.material.uniforms[p], {
        value: oldV,
      });
    }
  }
}
