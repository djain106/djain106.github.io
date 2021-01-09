document.addEventListener('DOMContentLoaded', function () {
    fixCodeColoring();
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