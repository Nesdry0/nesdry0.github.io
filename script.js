(function () {
    function sanitizeText(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isSuspiciousInput(value) {
        return /(<|>|javascript:|on\w+=|data:)/i.test(String(value || ''));
    }

    var contactForm = document.getElementById('contactForm');
    var contactStatus = document.getElementById('contactStatus');
    var welcomeOverlay = document.querySelector('.welcome-overlay');
    var welcomeButton = document.querySelector('.welcome-button');
    if (window.particlesJS && document.getElementById('particles-js')) {
        window.particlesJS('particles-js', {
            particles: {
                number: { value: 58, density: { enable: true, value_area: 850 } },
                color: { value: ['#1769aa', '#4db7d9', '#7bc8ed'] },
                opacity: { value: 0.42, random: true, anim: { enable: true, speed: 0.7, opacity_min: 0.16, sync: false } },
                size: { value: 2, random: true, anim: { enable: true, speed: 1.2, size_min: 0.6, sync: false } },
                line_linked: { enable: true, distance: 155, color: '#4b9fca', opacity: 0.22, width: 1 },
                move: { enable: true, speed: 0.55, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: false, mode: 'push' }, resize: true },
                modes: { grab: { distance: 170, line_linked: { opacity: 0.42 } } }
            },
            retina_detect: true
        });
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
            welcomeButton.addEventListener('click', function () {
                closeWelcome();
            });
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
        contactForm.setAttribute('accept-charset', 'UTF-8');
        contactForm.addEventListener('submit', function (event) {
            var name = contactForm.querySelector('[name="name"]');
            var email = contactForm.querySelector('[name="email"]');
            var message = contactForm.querySelector('[name="message"]');
            var reason = contactForm.querySelector('[name="reason"]');

            var fields = [name, email, message, reason];
            var invalid = false;

            fields.forEach(function (field) {
                if (!field) {
                    invalid = true;
                    return;
                }

                field.value = String(field.value || '').trim();

                if (isSuspiciousInput(field.value)) {
                    field.value = sanitizeText(field.value);
                    invalid = true;
                }
            });

            if (!name || !email || !message || !reason || invalid) {
                event.preventDefault();
                if (contactStatus) {
                    contactStatus.textContent = 'Revisa los datos del formulario antes de enviarlos.';
                    contactStatus.style.color = '#ffb4b4';
                }
                return;
            }

            if (name.value.length < 2 || name.value.length > 80) {
                event.preventDefault();
                if (contactStatus) {
                    contactStatus.textContent = 'El nombre debe tener entre 2 y 80 caracteres.';
                    contactStatus.style.color = '#ffb4b4';
                }
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                event.preventDefault();
                if (contactStatus) {
                    contactStatus.textContent = 'Ingresa un correo electrónico válido.';
                    contactStatus.style.color = '#ffb4b4';
                }
                return;
            }

            if (message.value.length < 10 || message.value.length > 1000) {
                event.preventDefault();
                if (contactStatus) {
                    contactStatus.textContent = 'El mensaje debe tener entre 10 y 1000 caracteres.';
                    contactStatus.style.color = '#ffb4b4';
                }
                return;
            }

            if (contactStatus) {
                contactStatus.textContent = 'Tu mensaje está listo para enviarse.';
                contactStatus.style.color = '#d6ffe1';
            }
        });
    }

    if (contactStatus) {
        contactStatus.textContent = 'Envía tu mensaje y revisa tu correo o Formspree.';
    }

})();
