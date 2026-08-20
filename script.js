(function () {
    var introOverlay = document.getElementById('introOverlay');
    var enterCvButton = document.getElementById('enterCvButton');
    var AUTO_OPEN_MS = 120000;

    if (!introOverlay) {
        document.body.classList.add('show-cv');
        return;
    }

    function showCurriculum() {
        if (!introOverlay.classList.contains('is-closing')) {
            introOverlay.classList.add('is-closing');
            document.body.classList.add('show-cv');

            window.setTimeout(function () {
                if (introOverlay.parentNode) {
                    introOverlay.parentNode.removeChild(introOverlay);
                }
            }, 450);
        }
    }

    function handleOverlayClick() {
        showCurriculum();
    }

    document.body.classList.remove('show-cv');
    window.setTimeout(showCurriculum, AUTO_OPEN_MS);

    introOverlay.addEventListener('click', handleOverlayClick);

    if (enterCvButton) {
        enterCvButton.addEventListener('click', showCurriculum);
    }

    window.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === 'Escape') {
            showCurriculum();
        }
    });
})();
