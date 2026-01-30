window.HELP_IMPROVE_VIDEOJS = false;

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');

    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function () {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';

            setTimeout(function () {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function () {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function () {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');

    if (carouselVideos.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });

    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function patchCarouselPaginationDots(carousel) {
    if (!carousel.options.pagination)
        return;
    carousel.on('before:show', function(state) {
        const dots = carousel.element.querySelectorAll('.slider-pagination .slider-page');
        if (dots.length === 0) return;

        const itemCount = dots.length;
        const realNextIndex = ((state.next % itemCount) + itemCount) % itemCount;
        dots.forEach((dot, index) => {
            if (index === realNextIndex) {
                dot.classList.add('is-active');
            } else {
                dot.classList.remove('is-active');
            }
        });
    });
}

$(document).ready(function () {
    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    }
    var static_options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: false,
    }

    // Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.results-carousel:not(.static-carousel)', options);
    var staticCarousels = bulmaCarousel.attach('.static-carousel', static_options);
    bulmaSlider.attach();

    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // const btnControlledCarousel = carousels[0];
    const btnControlledCarousel = carousels.find(instance =>
        instance.element.classList.contains('button-controlled-carousel') ||
        instance.element.id === 'videos-carousel'
    );
    const sceneCount = $('.nav-btn').length;
    $('.nav-btn').on('click', function (e) {
        e.preventDefault();
        var index = parseInt($(this).data('index'));

        if (btnControlledCarousel) {
            // btnControlledCarousel.show(index);
            btnControlledCarousel.state.next = index;
            btnControlledCarousel.show();
        }
        $(this).blur();
        $('.nav-btn').removeClass('is-link is-selected active');
        $(this).addClass('is-link is-selected active');
    });
    if (btnControlledCarousel) {
        // disable pagination dots
        const isMobile = window.screen.orientation > -1;
        if (!isMobile) {
            btnControlledCarousel.options.pagination = false;
            const paginationBase = btnControlledCarousel.element.querySelector('.slider-pagination');
            if (paginationBase) {
                paginationBase.style.display = 'none';
            }
        }
        btnControlledCarousel.on('before:show', function (state) {
            const realNextIndex = ((state.next % sceneCount) + sceneCount) % sceneCount;
            $('.nav-btn').removeClass('is-link is-selected active');
            $('.nav-btn[data-index="' + realNextIndex + '"]').addClass('is-link is-selected active');
        });
    }

    carousels.forEach(patchCarouselPaginationDots);
    staticCarousels.forEach(patchCarouselPaginationDots);
})
