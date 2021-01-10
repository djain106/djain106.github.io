let mesh, renderer, scene, camera, controls;

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation, true);
}

function handleOrientation(event) {
    var alpha = Math.abs(event.alpha);
    var beta = Math.abs(event.beta);
    var gamma = Math.abs(event.gamma);
    const page = document.body;
    if (!alpha && !beta && !gamma) {
        return;
    }
    var r = alpha * (255 / 360) % 255, g = beta * (255 / 360) % 255, b = gamma * (255 / 360) % 255;
    page.style.backgroundColor = `rgb(${r + "," + g + "," + b})`;
}

document.addEventListener('DOMContentLoaded', function () {
    highlightCode();
    typeCode();
    animateBackground();
    window.addEventListener('resize', onWindowResize, false);
}, false);

// Three JS animation
function animateBackground() {
    // Renderer
    renderer = new THREE.WebGLRenderer();
    const animationDiv = document.getElementById("animation");
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("animation").appendChild(renderer.domElement);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // Scene
    scene = new THREE.Scene();
    const backgroundColor = new THREE.Color("rgb(10, 10, 10)");
    scene.background = backgroundColor;

    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: "white" });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 20;

    const animate = function () {
        requestAnimationFrame(animate);
        camera.rotation.x += 0.02;
        camera.rotation.y += 0.02;
        // sphere.rotation.x += 0.01;
        // sphere.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    animate();
}

// Highlight code block with JS syntax
function highlightCode() {
    hljs.configure({
        tabReplace: ''
    });
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });

}

// Typing animation in code block
function typeCode() {
    var options = {
        strings: ["'PROGRAMMER'", "'ENGINEER'", "'STUDENT'", "'DEVELOPER'"],
        typeSpeed: 90,
        backSpeed: 70,
        loop: true,
        smartBackspace: false,
    };

    var typed = new Typed('#typed', options);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}