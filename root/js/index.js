let mesh, renderer, scene, camera, controls;
// if (window.DeviceOrientationEvent) {
//     window.addEventListener("deviceorientation", handleOrientation, true);
// }

// function handleOrientation(event) {
//     var alpha = Math.abs(event.alpha);
//     var beta = Math.abs(event.beta);
//     var gamma = Math.abs(event.gamma);
//     const page = document.body;
//     if (!alpha && !beta && !gamma) {
//         return;
//     }
//     var r = alpha * (255 / 360) % 255, g = beta * (255 / 360) % 255, b = gamma * (255 / 360) % 255;
//     page.style.backgroundColor = `rgb(${r + "," + g + "," + b})`;
// }

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
    renderer.toneMappingExposure = 30;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(WIDTH, HEIGHT);
    renderer.physicallyCorrectLights = true;
    animationDiv.appendChild(renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Camera
    camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.01, 500);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    // Scene
    scene = new THREE.Scene();
    const backgroundColor = new THREE.Color("rgb(10, 10, 10)");
    scene.background = backgroundColor;

    const loader = new THREE.GLTFLoader();

    loader.load('root/assets/room.glb', function (gltf) {
        const scale = new THREE.Vector3(10, 10, 10);
        gltf.scene.scale.set(scale.x, scale.y, scale.z);
        scene.add(gltf.scene);
        render();
        document.getElementById('activate_animation').style.display = "inline";
        // console.log(gltf.cameras[1]);
        // camera = gltf.cameras[1].clone();
    }, undefined, function (error) {
        console.error(error);
    });

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.autoRotate = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 500;
    controls.update();

    controls.addEventListener('change', render);
    render();
    // camera.position.z = 20;

    // const animate = function () {
    //     requestAnimationFrame(animate);
    //     sphere.rotation.x += 0.01;
    //     sphere.rotation.y += 0.01;

    //     renderer.render(scene, camera);
    // };

    // animate();
}

function render() { // to allow for very bright scenes.
    renderer.shadowMap.enabled = true;
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();
}