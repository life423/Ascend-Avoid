// Force desktop layout for testing purposes, but still detect touch devices
document.addEventListener('DOMContentLoaded', function () {
    // Add desktop layout class
    document.body.classList.add('desktop-layout')
    console.log('Desktop layout forced for testing')

    // Detect touch capability and add appropriate class
    if (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
    ) {
        document.body.classList.add('touch-device')
        console.log(
            'Touch device detected - touch controls should remain visible'
        )
    } else {
        console.log('Non-touch device detected - touch controls will be hidden')
    }
})
