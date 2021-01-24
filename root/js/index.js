// Constants
const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
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
var startCarButton, deactivateCarButton;
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
        smartBackspace: false,
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
    camera.position.set(4, 6, 3);
    scene.add(camera);

    // Texture Camera
    textureCamera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 20000);
    textureCamera.position.set(-0.4, 2, -2);
    scene.add(textureCamera);

    // Load Computer
    const computer = new THREE.GLTFLoader();
    let group;
    computer.load('root/assets/computer/scene.gltf', function (gltf) {
        // Desktop Computer by Tyler P Halterman is licensed under Creative Commons Attribution
        const scale = new THREE.Vector3(2, 2, 2);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        group = gltf.scene;
        group.position.y += 1.30;
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
    var MovingCubeMat = new THREE.MeshBasicMaterial({
        color: "green",
        wireframe: true
    });
    var MovingCubeGeom = new THREE.BoxGeometry(1, 1, 1); // new THREE.SphereGeometry(1, 32, 32);
    MovingCube = new THREE.Mesh(MovingCubeGeom, MovingCubeMat);
    MovingCube.position.set(-0.4, 2, -2);
    MovingCube.castShadow = true;
    scene.add(MovingCube);

    // Ground
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000), new THREE.MeshPhongMaterial({ color: "green", side: THREE.DoubleSide }));
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
        defaultScreen.position.y += 1.655;
        defaultScreen.position.z -= 0.463;
        defaultScreen.position.x -= 0.31;
    }
    const screen = new THREE.TextureLoader().load('root/images/screen.jpg', callbackScreen);

    // Intermediate Scene
    screenScene = new THREE.Scene();
    screenCamera = new THREE.OrthographicCamera(
        (screenRatio * HEIGHT) / -2, (screenRatio * HEIGHT) / 2,
        HEIGHT / 2, HEIGHT / -2,
        -10000, 10000);
    screenCamera.position.z = 1;
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
    computerScreen.position.x -= 0.31;
    computerScreen.position.y += 1.655;
    computerScreen.position.z -= 0.463;
    scene.add(computerScreen);

    // Load Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // Add Room
    var roomGeometry = new THREE.BoxGeometry(20, 20, 20);
    var roomMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.BackSide });
    var room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);

    // Add Buildings
    var buildingGeometry;
    var buildingMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    var building;
    const buildingLength = 20;
    const buildingWidth = 20;
    const buildingHeight = 40;
    for (let x = -10; x < 10; x++) {
        for (let z = -10; z < 10; z++) {
            let randomness = Math.random() * 60
            buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight + randomness, buildingLength);
            building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.x += x * 30;
            building.position.z += z * 30;
            building.position.y += randomness / 2 + 20;
            scene.add(building);
        }
    }

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
    var moveDistance = 1 * delta;
    var rotateAngle = Math.PI / 2 * delta;
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
    if (keyboard.pressed("R"))
        MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
    if (keyboard.pressed("F"))
        MovingCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);

    if (keyboard.pressed("Z")) {
        MovingCube.position.set(-0.5, 2, -2);
        MovingCube.rotation.set(0, 0, 0);
    }

    const newPos = MovingCube.position;
    const newRot = MovingCube.rotation;
    textureCamera.position.set(newPos.x, newPos.y, newPos.z);
    textureCamera.rotation.set(newRot.x, newRot.y, newRot.z);
}

function activateCar() {
    defaultScreen.visible = false;
    startCarButton.disabled = true;
    deactivateCarButton.disabled = false;
    controls.enabled = false;
    camera.position.set(-0.31, 1.655, 1.7);
    camera.lookAt(new THREE.Vector3(-0.31, 1.655, -0.463));
    usingCar = true;
}

function deactivateCar() {
    camera.lookAt(new THREE.Vector3(-0.31, 1.655, -0.463));
    defaultScreen.visible = true;
    startCarButton.disabled = false;
    deactivateCarButton.disabled = true;
    controls.enabled = true;
    usingCar = false;
}