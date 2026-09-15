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

    if (welcomeOverlay) {
        function closeWelcome() {
            welcomeOverlay.classList.add('is-closing');
            window.setTimeout(function () {
                welcomeOverlay.remove();
            }, 350);
        }

        welcomeOverlay.addEventListener('click', function (event) {
            if (event.target === welcomeOverlay || event.target === welcomeButton) {
                closeWelcome();
            }
        });

        if (welcomeButton) {
            welcomeButton.addEventListener('click', closeWelcome);
        }
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

    document.querySelectorAll('.gastro-preview').forEach(function (preview) {
        preview.querySelectorAll('[data-gastro-tab]').forEach(function (tab) {
            tab.addEventListener('click', function () {
                var tabName = tab.dataset.gastroTab;
                preview.querySelectorAll('[data-gastro-tab]').forEach(function (item) {
                    item.classList.toggle('is-active', item === tab);
                });
                preview.querySelectorAll('[data-gastro-panel]').forEach(function (panel) {
                    panel.classList.toggle('is-active', panel.dataset.gastroPanel === tabName);
                });
            });
        });
    });

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

            var formAction = contactForm.getAttribute('action');
            var formData = new FormData(contactForm);

            if (!formAction || formAction.includes('your-form-id')) {
                contactStatus.textContent = 'Falta configurar el endpoint real del formulario. Reemplaza "your-form-id" con tu ID de Formspree.';
                contactStatus.style.color = '#ffb4b4';
                return;
            }

            contactStatus.textContent = 'Enviando tu mensaje...';
            contactStatus.style.color = '#d9f3ff';

            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(function (response) {
                if (response.ok) {
                    contactForm.reset();
                    contactStatus.textContent = '¡Mensaje enviado correctamente!';
                    contactStatus.style.color = '#9ef7c7';
                    return;
                }

                return response.json().then(function (data) {
                    var errorMessage = data && data.errors && data.errors.length ? data.errors[0].message : 'No se pudo enviar el mensaje.';
                    throw new Error(errorMessage);
                });
            }).catch(function (error) {
                contactStatus.textContent = 'No se pudo enviar el mensaje. Inténtalo de nuevo o contáctame por correo directo.';
                contactStatus.style.color = '#ffb4b4';
                console.error(error);
            });
        });
    }

})();
