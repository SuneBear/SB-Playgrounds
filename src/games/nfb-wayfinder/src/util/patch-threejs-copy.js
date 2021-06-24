import { Object3D, Box3, Layers, ShaderMaterial } from "three";

// Box3.prototype.expandByObject = function (object) {
//   // Computes the world-axis-aligned bounding box of an object (including its children),
// 	// accounting for both the object's, and children's, world transforms

// 	object.updateWorldMatrix( false, false );

// 	const geometry = object.geometry;

// 	if ( geometry !== undefined ) {

// 		if ( geometry.boundingBox === null ) {

// 			geometry.computeBoundingBox();

// 		}

// 		_box.copy( geometry.boundingBox );
// 		_box.applyMatrix4( object.matrixWorld );

// 		this.union( _box );

// 	}

// 	const children = object.children;

// 	for ( let i = 0, l = children.length; i < l; i ++ ) {

// 		this.expandByObject( children[ i ] );

// 	}

// 	return this;
// }

Object3D.prototype.copy = function copy(source, recursive) {
  if (recursive === undefined) recursive = true;

  this.name = source.name;

  this.up.copy(source.up);

  this.position.copy(source.position);
  this.rotation.order = source.rotation.order;
  this.quaternion.copy(source.quaternion);
  this.scale.copy(source.scale);

  this.matrix.copy(source.matrix);
  this.matrixWorld.copy(source.matrixWorld);

  this.matrixAutoUpdate = source.matrixAutoUpdate;
  this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

  this.layers.mask = source.layers.mask;
  this.visible = source.visible;

  this.castShadow = source.castShadow;
  this.receiveShadow = source.receiveShadow;

  this.frustumCulled = source.frustumCulled;
  this.renderOrder = source.renderOrder;

  for (let k in this.userData) {
    // clear current
    this.userData[k] = null;
  }
  for (let k in source.userData) {
    // assign source
    this.userData[k] = source.userData[k];
  }

  if (recursive === true) {
    for (let i = 0; i < source.children.length; i++) {
      const child = source.children[i];
      this.add(child.clone());
    }
  }

  return this;
};

// Layers.prototype.test = function (layers) {
//   return (this.mask & layers.mask) !== 0;
// };
