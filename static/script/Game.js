// @ts-nocheck
class Game {
    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xd1d1d1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("canvas").append(this.renderer.domElement);

        this.camera.position.set(40, 60, 40)
        this.camera.lookAt(this.scene.position)

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // this.axes = new THREE.AxesHelper(100)
        // this.scene.add(this.axes)

        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        // this.controls.minDistance = 100;
        this.controls.maxDistance = 300;
        this.controls.maxPolarAngle = Math.PI / 2;

        this.defeat = false;

        this.color = 0
        this.selectedShape = 0

        this.materials = {
            tiles: {
                basic: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, side: THREE.DoubleSide, map: new THREE.TextureLoader().load("../textures/lego.png") }),
                hover: new THREE.MeshPhongMaterial({ color: 0xa9a9a9, specular: 0xffffff, side: THREE.DoubleSide, map: new THREE.TextureLoader().load("../textures/lego.png") }),
                border: new THREE.MeshPhongMaterial({ color: 0xff6347, specular: 0xffffff, side: THREE.DoubleSide, map: new THREE.TextureLoader().load("../textures/lego.png") }),
            },
            colors: {
                blue: new THREE.MeshPhongMaterial({ color: 0x1e90ff, specular: 0xffffff }),
                pink: new THREE.MeshPhongMaterial({ color: 0xff3399, specular: 0xffffff })
            }
        }

        let frontLight = new Light(0xffffff, 50, 20, 50);
        let backLight = new Light(0xffffff, -50, 20, -50);
        this.scene.add(frontLight.get(), backLight.get())

        this.tab = []
        this.plansza;

        this.render();
        window.addEventListener('resize', this.resize);

        this.renderBoard(15)
        this.renderHoverPons(15)

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2()

        document.addEventListener('click', this.raycast)

        document.onmousemove = this.hover

        document.onkeydown = (e) => {
            if (e.keyCode === 13) {
                if (this.color == 1) { this.color = 0; }
                else if (this.color == 0) { this.color = 1; }
                // console.log(this.color)
            }
        }

        this.playerBlocksPlaced = 0
        this.numberOfDisabledBlocks = 0

    }

    render = () => {
        requestAnimationFrame(this.render);

        this.controls.update();

        this.renderer.render(this.scene, this.camera);
        TWEEN.update();

        // console.log("render going")
    }

    resize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    renderBoard = (size) => {

        console.log(this.scene.children)

        let parent = new THREE.Object3D();
        parent.name = 'plansza'

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {

                let position = { x: 2.5 * x, y: 2.5 * y }
                let cube = new Cube(2.3, 0.5, 2.3);

                cube.name = 'tile-' + x + '-' + y
                cube.position.set(position.x, 0, position.y);
                cube.material = this.materials.tiles.basic;

                parent.add(cube);
                parent.position.set(-(position.x / 2), 0, -(position.y / 2));

            }
        }

        this.scene.add(parent)
    }

    renderHoverPons = (size) => {

        let parent = new THREE.Object3D();
        parent.name = 'pionki'

        for (let x = 0; x < size; x++) {
            this.tab[x] = []
            for (let y = 0; y < size; y++) {
                let position = { x: 2.5 * x, y: 2.5 * y }

                this.loader = new THREE.GLTFLoader();
                this.loader.load('../models/kostka.glb', (gltf) => {
                    const model = gltf.scene

                    model.position.set(position.x, 100, position.y)
                    model.scale.set(0.5, 0.5, 0.5);
                    model.name = 'pon-' + x + '-' + y

                    model.traverse(child => {
                        if (child.isMesh) {
                            child.material = this.materials.colors.blue;
                        }
                    });
                    // game.scene.add(gltf.scene)                   
                    parent.add(model);
                }, undefined, (error) => console.error(error));

                parent.position.set(-(position.x / 2), 0, -(position.y / 2));

                this.tab[x][y] = 3
            }
        }

        this.scene.add(parent)
    }

    raycast = (event) => {

        this.mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
        this.mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
        this.raycaster.setFromCamera(this.mouseVector, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);

        let plansza, pionki
        this.scene.children.forEach(child => { if (child.name == 'plansza') plansza = child.children })
        this.scene.children.forEach(child => { if (child.name == 'pionki') pionki = child.children })
        // console.log(plansza)

        if (!net.toggleHold && net.turaGracza) {
            if (intersects.length > 0) {

                let collider = intersects[0].object

                if (collider.name.startsWith('tile')) {
                    let intel = collider.name.split('-')

                    if (this.tab[intel[1]][intel[2]] == 3) {
                        if (this.playerBlocksPlaced == 0) {
                            if ((intel[1] == 0 || intel[2] == 14) || (intel[1] == 14 || intel[2] == 0)) {
                                net.sendMove(intel[1], intel[2], this.color)
                                this.playerBlocksPlaced++;
                                document.querySelector('#console').innerHTML = ''
                            } else {
                                document.querySelector('#console').innerHTML = 'Nie mozesz postawic bloku tutaj<br>Spr??buj zacz???? po zewn??trznej.'
                            }
                        } else {
                            console.table(this.tab)

                            let canDeploy = false;

                            let x = parseInt(intel[1]);
                            let z = parseInt(intel[2]);

                            if (this.tab[x + 1]?.[z] == this.color) canDeploy = true;
                            if (this.tab[x - 1]?.[z] == this.color) canDeploy = true;
                            if (this.tab[x]?.[z + 1] == this.color) canDeploy = true;
                            if (this.tab[x]?.[z - 1] == this.color) canDeploy = true;

                            // if (this.tab[intel[1]]?.[intel[2]] == null) canDeploy = true; console.log(this.tab[intel[1]]?.[intel[2]])

                            if (canDeploy) {
                                net.sendMove(intel[1], intel[2], this.color)
                                this.playerBlocksPlaced++;

                                console.warn('touches ' + canDeploy)
                            } else {
                                console.warn('unable ' + canDeploy)
                            }

                        }
                    }

                }
            }
        }
    }

    hover = (event) => {

        this.mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
        this.mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
        this.raycaster.setFromCamera(this.mouseVector, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);

        this.scene.children.forEach(child => { if (child.name == 'plansza') this.plansza = child.children })
        this.plansza.forEach(plytka => plytka.material = this.materials.tiles.basic)


        if (intersects.length > 0) {

            let collider = intersects[0].object

            if (collider.name.startsWith('tile')) {
                let intel = collider.name.split('-')

                if (this.playerBlocksPlaced == 0) {
                    if ((intel[1] == 0 || intel[2] == 14) || (intel[1] == 14 || intel[2] == 0)) {
                        collider.material = this.materials.tiles.border
                    } else {
                        collider.material = this.materials.tiles.hover
                    }
                } else {
                    collider.material = this.materials.tiles.hover
                }

            }

        }

    }

    setColor = (color) => {
        this.color = color;
    }

    setCamera = (z) => {
        this.camera.position.set(0, 45, z)
        this.camera.lookAt(this.scene.position)
        this.camera.updateProjectionMatrix();
        console.log(this.camera, this.camera.position)
    }

    dropTile = (x, z, color) => {

        let pionki;
        this.scene.children.forEach(child => {
            if (child.name == 'pionki') {
                pionki = child.children
            }
        })

        pionki.forEach(pon => {
            if (pon.name == 'pon-' + x + '-' + z) {

                if (this.tab[x][z] == 3) {
                    const position = {
                        x: 2.5 * x,
                        y: 0.5,
                        z: 2.5 * z
                    }

                    switch (color) {
                        case 0:
                            pon.traverse(child => {
                                if (child.isMesh) {
                                    child.material = this.materials.colors.blue;
                                }
                            });
                            break;
                        case 1:
                            pon.traverse(child => {
                                if (child.isMesh) {
                                    child.material = this.materials.colors.pink;
                                }
                            });
                            break;
                    }

                    this.tab[x][z] = color

                    let anim = new TWEEN.Tween(pon.position).to({ x: position.x, y: position.y, z: position.z }, 400).repeat(0).easing(TWEEN.Easing.Elastic.InOut).onUpdate(() => { }).onComplete(() => { console.log("koniec animacji") })
                    anim.start()

                    // console.table(this.tab)     
                    this.detectVictory()
                }

            }
        })

    }

    detectVictory = () => {
        this.numberOfDisabledBlocks = 0

        for (let x = 0; x < this.tab.length; x++) {
            for (let z = 0; z < this.tab[x].length; z++) {
                if (this.tab[x][z] == this.color) {
                    if (this.tab[x + 1]?.[z] != 3 && this.tab[x - 1]?.[z] != 3 && this.tab[x]?.[z + 1] != 3 && this.tab[x]?.[z - 1] != 3) {

                        this.numberOfDisabledBlocks++;
                        console.warn(this.numberOfDisabledBlocks, this.playerBlocksPlaced);

                    }

                }
            }
        }

        if (this.playerBlocksPlaced > 5) {
            if (this.numberOfDisabledBlocks == this.playerBlocksPlaced) {
                this.defeat = true
                net.sendDefeat()
                console.error('defeat')
            }
        }

    }

}