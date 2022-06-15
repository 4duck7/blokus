// @ts-nocheck
class Cube extends THREE.Mesh {
    constructor(x, y, z) {
        super()
        this.geometry = new THREE.BoxGeometry(x, y, z);
        this.material = new THREE.MeshNormalMaterial()
    }
}