var isndarray = require('isndarray')

module.exports = function(data, mesher, scaleFactor, three, mesherExtraData) {
  return new Mesh(data, mesher, scaleFactor, three, mesherExtraData)
}

module.exports.Mesh = Mesh

function Mesh(data, mesher, scaleFactor, three, mesherExtraData) {
  this.THREE = three || THREE
  this.data = data
  var geometry = this.geometry = new this.THREE.Geometry()
  this.scale = scaleFactor || new this.THREE.Vector3(10, 10, 10)

  var result, voxels, dims
  if (isndarray(data)) {
    voxels = data.data
    dims = data.shape
  } else {
    voxels = data.voxels
    dims = data.dims
  }

  result = mesher( voxels, dims, mesherExtraData )
  this.meshed = result

  geometry.vertices.length = 0
  geometry.faces.length = 0

  for (var i = 0; i < result.vertices.length; ++i) {
    var q = result.vertices[i]
    geometry.vertices.push(new this.THREE.Vector3(q[0], q[1], q[2]))
  } 
  
  for (var i = 0; i < result.faces.length; ++i) {
    var q = result.faces[i]
    if (q.length === 5) {
      var uv1 = this.faceVertexUv(i)
      var f = new this.THREE.Face3(q[0], q[1], q[3])
      f.color = new this.THREE.Color(q[4])
      geometry.faces.push(f)
      geometry.faceVertexUvs[0].push([uv1[0], uv1[1], uv1[3]])

      var uv2 = this.faceVertexUv(i)
      var g = new this.THREE.Face3(q[1], q[2], q[3])
      g.color = new this.THREE.Color(q[4])
      geometry.faces.push(g)
      geometry.faceVertexUvs[0].push([uv2[1], uv2[2], uv2[3]])
    } else if (q.length == 4) {
      var f = new this.THREE.Face3(q[0], q[1], q[2])
      f.color = new this.THREE.Color(q[3])
      geometry.faces.push(f)
      geometry.faceVertexUvs[0].push(this.faceVertexUv(i))
    }
  }
  
  geometry.computeFaceNormals()

  geometry.verticesNeedUpdate = true
  geometry.elementsNeedUpdate = true
  geometry.normalsNeedUpdate = true

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

}

Mesh.prototype.createWireMesh = function(hexColor) {    
  var wireMaterial = new this.THREE.MeshBasicMaterial({
    color : hexColor || 0xffffff,
    wireframe : true
  })
  var wireMesh = new this.THREE.Mesh(this.geometry, wireMaterial)
  wireMesh.scale.copy(this.scale)
  wireMesh.doubleSided = true
  this.wireMesh = wireMesh
  return wireMesh
}

Mesh.prototype.createSurfaceMesh = function(material) {
  material = material || new this.THREE.MeshNormalMaterial()
  var surfaceMesh  = new this.THREE.Mesh( this.geometry, material )
  surfaceMesh.scale.copy(this.scale)
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

Mesh.prototype.faceVertexUv = function(i) {
  return [new this.THREE.Vector2(0,0),
	  new this.THREE.Vector2(1,0),
	  new this.THREE.Vector2(2,0),
	  new this.THREE.Vector2(3,0)];
};
