(function () {
    var contactForm = document.getElementById('contactForm');
    var contactStatus = document.getElementById('contactStatus');
    var welcomeOverlay = document.querySelector('.welcome-overlay');
    var welcomeButton = document.querySelector('.welcome-button');
    var backgroundVideo = document.querySelector('.background-video');

    if (backgroundVideo) {
        backgroundVideo.muted = true;
        backgroundVideo.volume = 0;
    }

    if (welcomeOverlay && welcomeButton) {
        welcomeButton.addEventListener('click', function () {
            welcomeOverlay.classList.add('is-closing');
            window.setTimeout(function () {
                welcomeOverlay.remove();
            }, 350);
        });
    }
    var demoScreens = document.querySelectorAll('.demo-screen');
    var demoSteps = document.querySelectorAll('.demo-step');
    var demoProgress = document.getElementById('demoProgress');
    var demoCode = document.getElementById('demoCode');
    var currentScreen = 0;
    var demoCodes = ['LOBO-LUNA-427', 'OSO-AGUILA-881', 'ZORRO-MAR-293', 'LEON-NUBE-514'];
    var profilePhoto = document.querySelector('[data-profile-photo]');

    if (profilePhoto) {
        profilePhoto.addEventListener('error', function () {
            profilePhoto.hidden = true;
            profilePhoto.parentElement.classList.add('is-placeholder');
        });
    }

    function goDemoScreen(screenNumber) {
        currentScreen = screenNumber;
        demoScreens.forEach(function (screen, index) {
            screen.hidden = index !== screenNumber;
            screen.classList.toggle('active', index === screenNumber);
        });
        demoSteps.forEach(function (step, index) {
            step.classList.toggle('active-step', index === screenNumber);
        });
        if (demoProgress) {
            demoProgress.textContent = (screenNumber + 1) + ' / 4';
        }
        if (screenNumber === 3 && demoCode) {
            demoCode.textContent = demoCodes[Math.floor(Math.random() * demoCodes.length)];
        }
    }

    document.querySelectorAll('[data-mode]').forEach(function (button) {
        button.addEventListener('click', function () {
            button.classList.add('selected');
            window.setTimeout(function () { goDemoScreen(1); }, 220);
        });
    });

    document.querySelectorAll('[data-type]').forEach(function (button) {
        button.addEventListener('click', function () {
            button.parentNode.querySelectorAll('.demo-option').forEach(function (option) {
                option.classList.remove('selected');
            });
            button.classList.add('selected');
            button.closest('.demo-screen').querySelector('.demo-next').disabled = false;
        });
    });

    document.querySelectorAll('[data-zone]').forEach(function (button) {
        button.addEventListener('click', function () {
            button.parentNode.querySelectorAll('.demo-option').forEach(function (option) {
                option.classList.remove('selected');
            });
            button.classList.add('selected');
        });
    });

    document.querySelectorAll('.demo-next').forEach(function (button) {
        button.addEventListener('click', function () {
            goDemoScreen(currentScreen === 3 ? 0 : currentScreen + 1);
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            var formData = new FormData(contactForm);
            var subject = encodeURIComponent(formData.get('reason') + ' desde mi portafolio');
            var body = encodeURIComponent(
                'Nombre: ' + formData.get('name') + '\n' +
                'Correo: ' + formData.get('email') + '\n\n' +
                formData.get('message')
            );

            window.location.href = 'mailto:Nesdry12@gmail.com?subject=' + subject + '&body=' + body;
            contactStatus.textContent = 'Se abrirá tu aplicación de correo para completar el envío.';
        });
    }

})();
