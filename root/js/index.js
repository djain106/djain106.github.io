window.addEventListener("deviceorientation", handleOrientation, true);

function handleOrientation(event) {
    // var absolute = event.absolute;
    var alpha = Math.abs(event.alpha);
    var beta = Math.abs(event.beta);
    var gamma = Math.abs(event.gamma);

    var r = alpha * (360 / 255) % 255, g = beta * (360 / 255) % 255, b = gamma * (360 / 255) % 255;
    const page = document.body;
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

// Color the "code" written on the page
function fixCodeColoring() {
    var codeText = document.getElementById('coding').innerHTML;
    const variableTypes = ['var ', 'const '];
    for (let i = 0; i < variableTypes.length; i++) {
        let t = variableTypes[i];
        codeText = codeText.replaceAll(t, `<span class="variable_type">${t}</span>`);
    }
    document.getElementById('coding').innerHTML = codeText;
}

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