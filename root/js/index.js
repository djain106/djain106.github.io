let mesh, renderer, scene, camera, controls;

document.addEventListener('DOMContentLoaded', function () {
    highlight();
    type();
    init();
    window.addEventListener('resize', onWindowResize, false);
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
    document.getElementById('animation').style.zIndex = 1;
}

// Three JS animation
function init() {
    // Constants
    const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const animationDiv = document.getElementById("animation");
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    animationDiv.appendChild(renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Camera
    camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.01, 500);
    camera.position.set(4, 6, 4);

    // Scene
    scene = new THREE.Scene();
    const backgroundColor = new THREE.Color("rgb(10, 10, 10)");
    scene.background = backgroundColor;
    const fog = new THREE.Fog({ color: "white" });
    scene.fog = fog;

    // Load Computer
    const loader = new THREE.GLTFLoader();
    let group;
    loader.load('root/assets/scene.gltf', function (gltf) {
        // Desktop Computer by Tyler P Halterman is licensed under Creative Commons Attribution
        const scale = new THREE.Vector3(2, 2, 2);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        scene.add(gltf.scene);
        render();
        group = gltf.scene;
        group.position.y += 1.285;
        group.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        document.getElementById('activate_animation').style.display = "inline";
    }, undefined, function (error) {
        console.log('Loading alternative animation...');
        console.error(error);
    });

    // Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

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
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 50), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Grid
    const size = 50;
    const divisions = 50;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    // Load Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 500;
    controls.update();
    controls.addEventListener('change', render);

    // Do animation
    const animate = function () {
        requestAnimationFrame(animate);
        if (group) {
            group.rotateY(-0.001);
        }
        render();
    };

    animate();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}