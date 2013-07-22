var THREE = require('three')
var ndthree = require('ndthree')

module.exports = function(data, mesher, scaleFactor, three) {
  return new Mesh(data, mesher, scaleFactor, three)
}

module.exports.Mesh = Mesh

function Mesh(data, mesher, scaleFactor, three) {
  this.THREE = three || THREE
  this.data = data
  this.scale = scaleFactor || new this.THREE.Vector3(10, 10, 10)

  var geometry = this.geometry = new this.THREE.BufferGeometry()
  var material = this.material = {}

  // maybe we can simply transpose here to fix orientation?
  //data.transpose(1, 0, 2)

  var err = ndthree(data, geometry, material)

  if (err === false) this.data = false
}

Mesh.prototype.createWireMesh = function(hexColor) {    
  var wireMaterial = new this.THREE.MeshBasicMaterial({
    color : hexColor || 0xffffff,
    wireframe : true
  })
  wireMesh = new this.THREE.Mesh(this.geometry, wireMaterial)
  wireMesh.scale = this.scale
  wireMesh.doubleSided = true
  this.wireMesh = wireMesh
  return wireMesh
}

Mesh.prototype.createSurfaceMesh = function(tiles) {
  if (this.data === false) {
    return new this.THREE.Mesh(new this.THREE.Geometry(), new this.THREE.MeshNormalMaterial())
  }

  var surfaceMesh = ndthree.createMesh({
    THREE: this.THREE,
    geometry: this.geometry,
    // PROBLEM: Why is shader material so slow?
    material: new this.THREE.ShaderMaterial(this.material),
    map: tiles,
  })

  surfaceMesh.scale = this.scale
  surfaceMesh.doubleSided = false
  this.surfaceMesh = surfaceMesh
  return surfaceMesh
}

Mesh.prototype.addToScene = function(scene) {
  if (this.wireMesh) scene.add( this.wireMesh )
  if (this.surfaceMesh) scene.add( this.surfaceMesh )
}

Mesh.prototype.setPosition = function(x, y, z) {
  if (this.wireMesh) this.wireMesh.position = new this.THREE.Vector3(x, y, z)
  if (this.surfaceMesh) this.surfaceMesh.position = new this.THREE.Vector3(x, y, z)
}
