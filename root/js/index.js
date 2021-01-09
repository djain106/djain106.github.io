if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation, true);
}

function handleOrientation(event) {
    var alpha = Math.abs(event.alpha);
    var beta = Math.abs(event.beta);
    var gamma = Math.abs(event.gamma);
    const page = document.body;
    if (!alpha && !beta && !gamma) {
        page.style.backgroundColor = "#4BB";
        return;
    }
    var r = alpha * (255 / 360) % 255, g = beta * (255 / 360) % 255, b = gamma * (255 / 360) % 255;
    page.style.backgroundColor = `rgb(${r + "," + g + "," + b})`;
}

document.addEventListener('DOMContentLoaded', function () {
    hljs.configure({
        tabReplace: ''
    });
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
    typeCode();
}, false);

// Use typed.js to do typing animation
function typeCode() {
    var options = {
        strings: ["'PROGRAMMER'", "'ENGINEER'", "'STUDENT'", "'DEVELOPER'"],
        typeSpeed: 90,
        backSpeed: 70,
        loop: true,
        smartBackspace: false,
    };

    var typed = new Typed('#typed', options);
    return;
}