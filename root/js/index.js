// Constants
const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
const yOffset = 4.47;
const xOffset = -1;
const zOffset = -11;
// Global Variables
let mesh, renderer, scene, camera, controls, stats;

// Computer Screen Rendering
var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;
var MovingCube, textureCamera;

// Screens
var computerScreen, defaultScreen;
var usingCar = false;
const screenRatio = 1.65;
const screenHeight = 1000;

// Object Controls
var startCarButton, deactivateCarButton, helpCarButton;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// Animation Control
var doAnimation = false;

// Animation Div
var animationDiv;

document.addEventListener('DOMContentLoaded', function () {
    highlight();
    type();
    animationDiv = document.getElementById("animation");
    init();
    animate();
    document.getElementById('activate_animation').onclick = activateAnimation;
    document.getElementById('close_animation').onclick = hideAnimation;
    startCarButton = document.getElementById('use_car');
    startCarButton.onclick = activateCar;
    deactivateCarButton = document.getElementById('deactivate_car');
    deactivateCarButton.onclick = deactivateCar;
    helpCarButton = document.getElementById('controls_help');
    helpCarButton.onclick = toggleHelp;
    document.getElementById('contact-button').onclick = formSubmit;
}, false);

// Form submitted
function formSubmit() {
    document.getElementById('thank-you').style.display = 'block';
    document.getElementById('gform').style.display = 'none';
}

// Highlight code block with JS syntax
function highlight() {
    hljs.configure({
        tabReplace: ''
    });
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

// Typing animation in code block
function type() {
    var options = {
        strings: ["'PROGRAMMER'", "'ENGINEER'", "'STUDENT'", "'DEVELOPER'"],
        typeSpeed: 90,
        backSpeed: 70,
        loop: true,
        smartBackspace: true,
    };

    var typed = new Typed('#typed', options);
}

function activateAnimation() {
    // Stats
    stats = new Stats();
    animationDiv.appendChild(stats.domElement);

    // Start Animation
    doAnimation = true;
    animate();
    document.getElementById('content').style.display = 'none';
    document.getElementById('controls').style.display = 'inline';
}

function hideAnimation() {
    doAnimation = false;
    document.getElementById('content').style.display = '';
    document.getElementById('controls').style.display = 'none';
    if (!document.getElementById('instructions').hidden)
        toggleHelp();
}

// Three JS animation
function init() {

    // Scene
    scene = new THREE.Scene();
    const backgroundColor = new THREE.Color("rgb(135,206,235)");
    scene.background = backgroundColor;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMappingExposure = 1;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    animationDiv.appendChild(renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Camera
    camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 20000);
    camera.position.set(4 + xOffset, 6 + yOffset, 3 + zOffset);
    scene.add(camera);

    // Texture Camera
    textureCamera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 20000);
    textureCamera.position.set(-0.4 + xOffset, 3 + yOffset, -2 + zOffset);
    scene.add(textureCamera);

    // Load Computer
    const computer = new THREE.GLTFLoader();
    let group;
    computer.load('root/assets/computer/scene.gltf', function (gltf) {
        // Desktop Computer by Tyler P Halterman is licensed under Creative Commons Attribution
        const scale = new THREE.Vector3(2, 2, 2);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        group = gltf.scene;
        group.position.y += 1.30 + yOffset;
        group.position.x += xOffset;
        group.position.z += zOffset;
        group.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        scene.add(group);
        document.getElementById('activate_animation').style.display = "inline";
        render();
    }, undefined, function (error) {
        animationDiv.style.display = "none";
        console.error(error);
    });

    // Light
    const light = new THREE.AmbientLight(0x404040);
    light.intensity = 0.7;
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 20, 20);
    dirLight.castShadow = true;
    const shadowBox = 3;
    dirLight.shadow.camera.top = shadowBox;
    dirLight.shadow.camera.bottom = - shadowBox;
    dirLight.shadow.camera.left = - shadowBox;
    dirLight.shadow.camera.right = shadowBox;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);

    // Moving Object
    // var MovingCubeMat = new THREE.MeshPhongMaterial({
    //     color: "white",
    //     flatShading: true
    // });
    // var MovingCubeGeom = new THREE.BoxGeometry(1, 1, 1); // new THREE.SphereGeometry(1, 32, 32);
    // MovingCube = new THREE.Mesh(MovingCubeGeom, MovingCubeMat);
    // MovingCube.position.set(-0.4, 2, -2);
    // MovingCube.castShadow = true;
    // scene.add(MovingCube);

    const planeLoader = new THREE.GLTFLoader();
    planeLoader.load('root/assets/airplane/scene.gltf', function (gltf) {
        // "Airplane" (https://skfb.ly/6WXnK) by Omar_Mohamed is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
        const scale = new THREE.Vector3(0.1, 0.1, 0.1);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        MovingCube = gltf.scene;
        MovingCube.position.z += -0.6 + zOffset;
        MovingCube.position.x += -4 + xOffset;
        MovingCube.position.y += 0.2 + yOffset;
        MovingCube.rotateY(Math.PI);
        scene.add(MovingCube);
        render();
    }, undefined, function (error) {
        animationDiv.style.display = "none";
        console.error(error);
    });

    // Load Computer
    const roomLoader = new THREE.GLTFLoader();
    let roomGroup;
    roomLoader.load('root/assets/room/room.gltf', function (gltf) {
        const scale = new THREE.Vector3(6, 6, 6);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        roomGroup = gltf.scene;
        roomGroup.position.x += 6.5;
        roomGroup.position.y += 0.1;
        roomGroup.rotateY(0.5 * Math.PI);
        // Opt to not use shadows for this mesh.
        // roomGroup.traverse(function (object) {
        //     if (object.isMesh) {
        //         object.castShadow = true;
        //         object.receiveShadow = true;
        //     }
        // });
        scene.add(roomGroup);
        document.getElementById('activate_animation').style.display = "inline";
        render();
    }, undefined, function (error) {
        animationDiv.style.display = "none";
        console.error(error);
    });

    // Ground
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1100, 1100), new THREE.MeshPhongMaterial({ color: "green", side: THREE.DoubleSide }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Skybox
    var skyboxMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    var skyboxGeom = new THREE.CubeGeometry(5000, 5000, 5000, 1, 1, 1);
    var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
    scene.add(skybox);

    // Screen
    function callbackScreen() {
        const geometry = new THREE.PlaneBufferGeometry(2.78, 1.69);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: screen });
        defaultScreen = new THREE.Mesh(geometry, material);
        scene.add(defaultScreen);
        defaultScreen.position.y += 1.655 + yOffset;
        defaultScreen.position.z += -0.463 + zOffset;
        defaultScreen.position.x += -0.31 + xOffset;
    }
    const screen = new THREE.TextureLoader().load('root/images/screen.jpg', callbackScreen);

    // Intermediate Scene
    screenScene = new THREE.Scene();
    screenCamera = new THREE.OrthographicCamera(
        (screenRatio * HEIGHT) / -2, (screenRatio * HEIGHT) / 2,
        HEIGHT / 2, HEIGHT / -2,
        -10000, 10000);
    screenCamera.position.z = 1 + zOffset;
    screenCamera.position.y += yOffset;
    screenCamera.position.x += xOffset;
    screenScene.add(screenCamera);
    var screenGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    firstRenderTarget = new THREE.WebGLRenderTarget(screenHeight * screenRatio, screenHeight, {
        format: THREE.RGBFormat
    });
    var screenMaterial = new THREE.MeshBasicMaterial({
        map: firstRenderTarget.texture
    });
    var quad = new THREE.Mesh(screenGeometry, screenMaterial);
    screenScene.add(quad);

    // Screen Texture
    var planeGeometry = new THREE.PlaneGeometry(2.78, 1.69)
    finalRenderTarget = new THREE.WebGLRenderTarget(screenHeight * screenRatio, screenHeight, {
        format: THREE.RGBFormat
    });
    var planeMaterial = new THREE.MeshBasicMaterial({
        map: finalRenderTarget.texture
    });
    var computerScreen = new THREE.Mesh(planeGeometry, planeMaterial);
    computerScreen.position.x += -0.31 + xOffset;
    computerScreen.position.y += 1.655 + yOffset;
    computerScreen.position.z += -0.463 + zOffset;
    scene.add(computerScreen);

    // Load Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // Add Room
    // var roomGeometry = new THREE.BoxGeometry(20, 20, 20);
    // var roomMaterial = new THREE.MeshBasicMaterial({ color: "rgb(0,0,128)", side: THREE.BackSide, flatShading: true });
    // var room = new THREE.Mesh(roomGeometry, roomMaterial);
    // room.position.y += 9.9;
    // scene.add(room);

    // Add Buildings
    // Temporarily remove buildings for room render.
    // var buildingGeometry;
    // var buildingMaterial = new THREE.MeshPhongMaterial({ color: "gray", flatShading: true });
    // var building;
    // const buildings = [];
    // const buildingLength = 20;
    // const buildingWidth = 20;
    // const buildingHeight = 40;
    // for (let i = 0; i < 100; i++) {
    //     let x = Math.random() * 1000 - 500;
    //     let z = Math.random() * 1000 - 500;
    //     let randomness = Math.random() * 60;
    //     buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight + randomness, buildingLength);
    //     building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    //     building.position.x += x;
    //     building.position.z += z;
    //     building.position.y += randomness / 2 + 20;
    //     scene.add(building);
    //     buildings.push(building);
    // }

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

const animate = function () {
    if (!doAnimation) {
        return;
    }
    requestAnimationFrame(animate);
    render();
    if (usingCar) {
        update();
    }
    stats.update();
};

function render() {
    if (usingCar) {
        MovingCube.visible = false;
        renderer.setRenderTarget(firstRenderTarget);
        renderer.render(scene, textureCamera);
        renderer.setRenderTarget(null);
        renderer.clear();
        MovingCube.visible = true;

        renderer.setRenderTarget(finalRenderTarget);
        renderer.render(screenScene, screenCamera);
        renderer.setRenderTarget(null);
        renderer.clear();
    }

    renderer.render(scene, camera);
}

function update() {
    var delta = clock.getDelta();
    var moveDistance = 50 * delta;
    var rotateAngle = Math.PI / 2 * delta;
    if (keyboard.pressed("shift"))
        moveDistance *= 10;

    if (keyboard.pressed("W"))
        MovingCube.translateZ(-moveDistance);
    if (keyboard.pressed("S"))
        MovingCube.translateZ(moveDistance);
    if (keyboard.pressed("Q"))
        MovingCube.translateX(-moveDistance);
    if (keyboard.pressed("E"))
        MovingCube.translateX(moveDistance);

    if (keyboard.pressed("A"))
        MovingCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
    if (keyboard.pressed("D"))
        MovingCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
    // if (keyboard.pressed("R"))
    //     MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
    // if (keyboard.pressed("F"))
    //     MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);
    if (keyboard.pressed("space"))
        MovingCube.translateY(moveDistance);
    if (keyboard.pressed("ctrl") && MovingCube.position.y > 1.5)
        MovingCube.translateY(-moveDistance);

    if (keyboard.pressed("R")) {
        MovingCube.position.set(-0.5, 2, -2);
        MovingCube.rotation.set(0, 0, 0);
    }
    if (MovingCube.position.y < 1.5)
        MovingCube.position.y = 1.5;
    const newPos = MovingCube.position;
    const newRot = MovingCube.rotation;
    textureCamera.position.set(newPos.x, newPos.y, newPos.z);
    textureCamera.rotation.set(newRot.x, newRot.y, newRot.z);
}

function activateCar() {
    defaultScreen.visible = false;
    startCarButton.hidden = true;
    deactivateCarButton.hidden = false;
    controls.enabled = false;
    camera.position.set(-0.31 + xOffset, 1.655 + yOffset, 1.7 + zOffset);
    camera.lookAt(new THREE.Vector3(-0.31 + xOffset, 1.655 + yOffset, -0.463 + zOffset));
    helpCarButton.hidden = false;
    usingCar = true;
}

function deactivateCar() {
    camera.lookAt(new THREE.Vector3(-0.31 + xOffset, 1.655 + yOffset, -0.463 + zOffset));
    defaultScreen.visible = true;
    controls.enabled = true;
    usingCar = false;
    startCarButton.hidden = false;
    deactivateCarButton.hidden = true;
    helpCarButton.hidden = true;
    if (!document.getElementById('instructions').hidden)
        toggleHelp();
}

function toggleHelp() {
    document.getElementById("instructions").hidden = !document.getElementById("instructions").hidden;
}