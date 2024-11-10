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

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < imageCount; j++) {
            const clone = images[j].cloneNode(true);
            scrollContainer.appendChild(clone);
            scrollContainer.insertBefore(clone, images[0]);
        }
    }

    // Posiziona lo scroll al centro
    scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;

    // Nei dispositivi mobili, applica lo "snap" iniziale
    if (window.innerWidth <= 768) {
        snapToCenter(); // Centra subito un'immagine all'avvio sui dispositivi mobili
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
        inertiaTimer = setTimeout(applyInertia, 16);
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
