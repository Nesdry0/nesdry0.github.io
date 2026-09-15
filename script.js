(function () {
    var contactForm = document.getElementById('contactForm');
    var contactStatus = document.getElementById('contactStatus');
    var moduleSections = document.querySelectorAll('.module-section');
    var moduleLinks = document.querySelectorAll('.module-link');
    var backgroundVideo = document.querySelector('.background-video');

    if (backgroundVideo) {
        backgroundVideo.muted = true;
        backgroundVideo.volume = 0;
    }

    function showModule(moduleName) {
        moduleSections.forEach(function (section) {
            section.classList.toggle('is-visible', section.dataset.module === moduleName);
        });
        moduleLinks.forEach(function (link) {
            link.classList.toggle('active', link.dataset.module === moduleName);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    moduleLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            showModule(link.dataset.module);
            window.history.replaceState(null, '', link.hash);
        });
    });

    showModule(window.location.hash === '#curriculum' ? 'curriculum' : window.location.hash === '#contacto' ? 'contacto' : window.location.hash === '#portafolio' ? 'portafolio' : 'inicio');
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
