const scrollContainer = document.getElementById('scrollContainer');
let lastCenteredImage = null;
let isScrolling = false;

const images = document.querySelectorAll('.image');

images.forEach(image => {
    const src = image.src;
    image.src = '';
    const imgElement = new Image();
    imgElement.src = src;
    imgElement.onload = () => {
        image.src = src;
        image.style.opacity = 1;
    };
});

let inertiaTimer;
let velocity = 0;
let lastTouchTime = 0;

function setupInfiniteScroll() {
    const images = document.querySelectorAll('.image-wrapper');
    const imageCount = images.length;

    // Clona le immagini per creare l'effetto di scorrimento infinito
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < imageCount; j++) {
            const clone = images[j].cloneNode(true);
            scrollContainer.appendChild(clone);
            scrollContainer.insertBefore(clone, images[0]);
        }
    }

    // Modifica il comportamento iniziale per dispositivi mobili
    if (window.innerWidth <= 768) {
        // Sposta il carosello verso sinistra, così che la prima immagine sia quella 1
        scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3.1; // Inizializza il carosello verso la prima immagine
        snapToCenter(); // Funzione per centrare l'immagine visibile al centro
    } else {
        // Nei dispositivi più grandi, il carosello è già centrato
        scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
    }
}


function maintainInfiniteScroll() {
    const images = document.querySelectorAll('.image-wrapper');
    const totalWidth = scrollContainer.scrollWidth;

    if (scrollContainer.scrollLeft <= 0) {
        scrollContainer.scrollLeft += totalWidth / 3;
    }

    if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= totalWidth) {
        scrollContainer.scrollLeft -= totalWidth / 3;
    }

    enlargeImageAtCenter();
}

let currentImageUrl = '';

function enlargeImageAtCenter() {
    const images = document.querySelectorAll('.image-wrapper');
    const containerRect = scrollContainer.getBoundingClientRect();
    const centerPosition = containerRect.left + containerRect.width / 2;

    let closestImage = null;
    let closestDistance = Infinity;

    images.forEach(imageWrapper => {
        const imageRect = imageWrapper.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;
        const distance = Math.abs(centerPosition - imageCenter);

        const tolerance = 550;

        if (distance < closestDistance && distance <= tolerance) {
            closestDistance = distance;
            closestImage = imageWrapper;
        }
    });

    if (closestImage && closestImage !== lastCenteredImage) {
        if (lastCenteredImage) {
            lastCenteredImage.querySelector('.image').style.width = '200px';
            lastCenteredImage.querySelector('.image').style.height = '250px';
        }

        const currentImage = closestImage.querySelector('.image');
        if (window.innerWidth > 768) {
            currentImage.style.width = '500px';
            currentImage.style.height = '550px';
        }

        currentImageUrl = currentImage.src;

        lastCenteredImage = closestImage;
    }

    return closestImage;
}

function applyInertia() {
    if (Math.abs(velocity) > 0.01) {
        scrollContainer.scrollLeft += velocity * 20;
        velocity *= 0.95;
        inertiaTimer = setTimeout(applyInertia, 10);
    } else {
        if (window.innerWidth <= 768) {
            snapToCenter();
        }
    }
}

function snapToCenter() {
    const centeredImage = enlargeImageAtCenter();

    if (centeredImage) {
        const imageRect = centeredImage.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const offset = imageCenter - containerCenter;

        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft + offset,
            behavior: 'smooth'
        });
    }
}

// Variabili per tracciare il tocco
let touchStartX = 0;
let touchEndX = 0;

scrollContainer.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    lastTouchTime = Date.now();
    velocity = 0;
    clearInterval(inertiaTimer);
}, { passive: true });

scrollContainer.addEventListener('touchmove', (event) => {
    touchEndX = event.touches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    velocity = deltaX / (Date.now() - lastTouchTime);
    touchStartX = touchEndX;
    lastTouchTime = Date.now();

    scrollContainer.scrollLeft += deltaX;
}, { passive: true });

scrollContainer.addEventListener('touchend', () => {
    maintainInfiniteScroll();
    applyInertia();
});

document.getElementById('listLink').addEventListener('click', function(event) {
    window.location.href = `list.html?image=${encodeURIComponent(currentImageUrl)}`;
});

window.addEventListener('wheel', function(event) {
    isScrolling = true;
    event.preventDefault();

    scrollContainer.scrollLeft += event.deltaY;
    maintainInfiniteScroll();

    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 100);
});

window.onload = () => {
    setupInfiniteScroll();
    scrollContainer.addEventListener('scroll', maintainInfiniteScroll);
};


document.addEventListener("DOMContentLoaded", function () {
    const scrollMessage = document.getElementById("scrollMessage");

    let hasScrolled = false;

    const hideScrollMessage = () => {
        if (!hasScrolled) {
            hasScrolled = true;
            scrollMessage.classList.add("hidden");
        }
    };

    // Nascondi il messaggio quando l'utente scorre
    window.addEventListener("scroll", hideScrollMessage);

    // Se l'utente inizia a interagire con la pagina usando il mouse (ad esempio, scorre con la rotella)
    window.addEventListener("wheel", hideScrollMessage);
});




document.addEventListener("DOMContentLoaded", () => {
    const scrollMessage = document.getElementById("scrollMessage");

    // Funzione per rilevare dispositivi touch
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Nascondi il messaggio sui dispositivi touch
    if (isTouchDevice()) {
        scrollMessage.style.display = "none";
    }

    // Event listener per nascondere il messaggio dopo il primo scroll
    let hasScrolled = false;
    window.addEventListener("scroll", () => {
        if (!hasScrolled) {
            scrollMessage.style.opacity = "0"; // Nascondi con transizione
            setTimeout(() => scrollMessage.style.display = "none", 500); // Rimuovi completamente
            hasScrolled = true;
        }
    });
});
