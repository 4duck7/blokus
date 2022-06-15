class Shape {
    constructor(type, x, z) {

        this.type = type;

        switch (this.type) {
            case 0: this.shape = [{ x: x, z: z }]; break; //test shape
            case 1: break;
            case 2: break;
            case 3: break;
            case 4: break;
            case 5: break;
        }
    }

    get = () => { return this.shape }

}