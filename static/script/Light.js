// @ts-nocheck
class Light {
    constructor(color, x, y, z) {
        this.light = new THREE.SpotLight(color);
        this.light.position.set(x, y, z);
        this.light.castShadow = true;
    }

    get = () => {
        return this.light;
    }
}