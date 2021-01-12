
// Constants
const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
// Variables
let mesh, renderer, scene, camera, controls, stats;

var MovingCube, textureCamera;

var screenScene, screenCamera, firstRenderTarget, finalRenderTarget;

document.addEventListener('DOMContentLoaded', function () {
    highlight();
    type();
    init();
    animate();
    document.getElementById('activate_animation').onclick = activateAnimation;
    document.getElementById('controls').onclick = hideAnimation;
}, false);

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
    document.getElementById('content').style.display = 'none';
    document.getElementById('controls').style.display = 'inline';
}

function hideAnimation() {
    document.getElementById('content').style.display = '';
    document.getElementById('controls').style.display = 'none';
}

// Three JS animation
function init() {

    // Scene
    scene = new THREE.Scene();
    const backgroundColor = new THREE.Color("rgb(135,206,235)");
    scene.background = backgroundColor;
    // const fog = new THREE.Fog({ color: "white" });
    // scene.fog = fog;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const animationDiv = document.getElementById("animation");
    renderer.toneMappingExposure = 1;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    animationDiv.appendChild(renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Stats
    stats = new Stats();
    animationDiv.appendChild(stats.domElement);

    // Camera
    camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 20000);
    camera.position.set(4, 6, 4);
    scene.add(camera);

    // Texture Camera
    textureCamera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 20000);
    scene.add(textureCamera);
    textureCamera.position.set(4, 6, 4);

    // Load Computer
    const computer = new THREE.GLTFLoader();
    let group;
    computer.load('root/assets/scene.gltf', function (gltf) {
        // Desktop Computer by Tyler P Halterman is licensed under Creative Commons Attribution
        const scale = new THREE.Vector3(2, 2, 2);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        group = gltf.scene;
        group.position.y += 1.30;
        group.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        scene.add(group);
        document.getElementById('activate_animation').style.display = "inline";
    }, undefined, function (error) {
        animationDiv.style.display = "none";
        console.error(error);
    });

    // Light
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // Ground
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000), new THREE.MeshPhongMaterial({ color: "darkblue", depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Moving Object
    var MovingCubeMat = new THREE.MeshBasicMaterial({
        color: "green"
    });
    var MovingCubeGeom = new THREE.CubeGeometry(2, 2, 2, 1, 1, 1);
    MovingCube = new THREE.Mesh(MovingCubeGeom, MovingCubeMat);
    MovingCube.position.set(0, 25.1, 0);
    scene.add(MovingCube);

    // Skybox
    var skyboxMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    var skyboxGeom = new THREE.CubeGeometry(5000, 5000, 5000, 1, 1, 1);
    var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
    scene.add(skybox);

    // Grid
    const size = 1000;
    const divisions = 200;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    // Screen
    function callbackScreen() {
        const geometry = new THREE.PlaneBufferGeometry(2.78, 1.69);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: screen });
        const mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh);
        mesh.position.y += 1.655;
        mesh.position.z -= 0.463;
        mesh.position.x -= 0.31;
    }
    const screen = new THREE.TextureLoader().load('root/images/screen.jpg', callbackScreen);

    // Intermediate Scene
    screenScene = new THREE.Scene();
    screenCamera = new THREE.OrthographicCamera(
        window.innerWidth / -2, window.innerWidth / 2,
        window.innerHeight / 2, window.innerHeight / -2,
        -10000, 10000);
    screenCamera.position.z = 1;
    screenScene.add(screenCamera);
    var screenGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    firstRenderTarget = new THREE.WebGLRenderTarget(512, 512, {
        format: THREE.RGBFormat
    });
    var screenMaterial = new THREE.MeshBasicMaterial({
        map: firstRenderTarget.texture
    });
    var quad = new THREE.Mesh(screenGeometry, screenMaterial);
    screenScene.add(quad);

    // Screen Texture
    var planeGeometry = new THREE.PlaneGeometry(2.78, 1.69)
    finalRenderTarget = new THREE.WebGLRenderTarget(512, 512, {
        format: THREE.RGBFormat
    });
    var planeMaterial = new THREE.MeshBasicMaterial({
        map: finalRenderTarget.texture
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y += 1.655;
    plane.position.z -= 0.463;
    plane.position.x -= 0.31;
    scene.add(plane);

    // Load Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}

function update() {
    stats.update();
}

const animate = function () {
    requestAnimationFrame(animate);
    render();
    update();
};

function render() {
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

    renderer.render(scene, camera);
}