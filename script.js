const scrollContainer = document.getElementById('scrollContainer');
let lastCenteredImage = null;
let isScrolling = false; // Variabile per tenere traccia dello stato dello scroll

const images = document.querySelectorAll('.image');

images.forEach(image => {
    const src = image.src; // Memorizza il src originale
    image.src = ''; // Rimuovi il src iniziale per caricare dopo
    const imgElement = new Image();
    imgElement.src = src; // Precarica l'immagine
    imgElement.onload = () => {
        image.src = src; // Assegna il src una volta caricata
        image.style.opacity = 1; // Rendi l'immagine visibile
    };
});

let inertiaTimer;
let velocity = 0; // Velocità di scorrimento
let lastTouchTime = 0; // Tempo dell'ultimo tocco

function setupInfiniteScroll() {
    const images = document.querySelectorAll('.image-wrapper');
    const imageCount = images.length;
    const imageWidth = images[0].clientWidth;

    for (let cristo = 0; cristo < 9; cristo++) {
        // Duplica le immagini all'inizio e alla fine
        for (let i = 0; i < imageCount; i++) {
            const clone = images[i].cloneNode(true);
            scrollContainer.appendChild(clone);
            scrollContainer.insertBefore(clone, images[0]);
        }
    }

    // Posiziona lo scroll al centro
    scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
}

function maintainInfiniteScroll() {
    const images = document.querySelectorAll('.image-wrapper');
    const imageWidth = images[0].clientWidth;
    const totalWidth = scrollContainer.scrollWidth;

    // Se lo scroll è vicino alla fine delle immagini visibili, riportalo indietro al centro
    if (scrollContainer.scrollLeft <= 0) {
        scrollContainer.scrollLeft += totalWidth / 3;
    }

    // Se lo scroll è vicino all'inizio delle immagini visibili, riportalo avanti al centro
    if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= totalWidth) {
        scrollContainer.scrollLeft -= totalWidth / 3;
    }

    // Trova l'immagine che si trova a circa 50vw e ingrandiscila
    enlargeImageAtCenter();
}

// Funzione per il "snap" delle immagini al centro
function enlargeImageAtCenter() {
    const images = document.querySelectorAll('.image-wrapper');
    const containerRect = scrollContainer.getBoundingClientRect();
    const centerPosition = containerRect.left + containerRect.width / 2;

    let closestImage = null;
    let closestDistance = Infinity;

    // Trova l'immagine più vicina al centro dello schermo
    images.forEach(imageWrapper => {
        const imageRect = imageWrapper.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;  // Centro dell'immagine
        const distance = Math.abs(centerPosition - imageCenter);  // Distanza tra il centro del contenitore e il centro dell'immagine

        // Modifica il margine di tolleranza per rendere l'ingrandimento più preciso
        const tolerance = 550;  // Margine di tolleranza ridotto per dispositivi mobili e desktop (puoi regolarlo)

        if (distance < closestDistance && distance <= tolerance) {  // Considera solo immagini abbastanza vicine al centro
            closestDistance = distance;
            closestImage = imageWrapper;
        }
    });

    // Ingrandisci l'immagine corrente
    if (closestImage && closestImage !== lastCenteredImage) {
        // Ripristina la dimensione dell'immagine precedente
        if (lastCenteredImage) {
            lastCenteredImage.querySelector('.image').style.width = '200px';
            lastCenteredImage.querySelector('.image').style.height = '250px';
        }

        // Ingrandisci l'immagine corrente solo se non è mobile
        const currentImage = closestImage.querySelector('.image');
        if (window.innerWidth > 768) { // Solo su dispositivi desktop
            currentImage.style.width = '500px';
            currentImage.style.height = '550px';
        }

        // Aggiorna l'URL dell'immagine corrente per il link della lista
        currentImageUrl = currentImage.src; // Memorizza l'URL dell'immagine ingrandita

        // Aggiorna l'ultima immagine centrata
        lastCenteredImage = closestImage;
    }
}

// Variabili per tracciare il tocco
let touchStartX = 0;
let touchEndX = 0;

// Event listener per l'inizio del tocco
scrollContainer.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    lastTouchTime = Date.now(); // Salva il tempo dell'inizio del tocco
    velocity = 0; // Resetta la velocità all'inizio del tocco
    clearInterval(inertiaTimer); // Ferma eventuali scorrimenti precedenti
}, { passive: true });

// Event listener per il movimento del tocco
scrollContainer.addEventListener('touchmove', (event) => {
    touchEndX = event.touches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    // Calcola la velocità di scorrimento
    velocity = deltaX / (Date.now() - lastTouchTime);
    touchStartX = touchEndX;
    lastTouchTime = Date.now();

    // Applica il movimento
    scrollContainer.scrollLeft += deltaX;
}, { passive: true });

// Funzione per applicare l'inerzia dopo il rilascio del tocco
function applyInertia() {
    if (Math.abs(velocity) > 0.01) {
        scrollContainer.scrollLeft += velocity * 20; // Velocità moltiplicata per dare più effetto
        velocity *= 0.95; // Riduce la velocità per simulare la decelerazione
        inertiaTimer = setTimeout(applyInertia, 16); // Ripete la funzione finché la velocità è sufficiente
    }
}

// Mantieni lo scorrimento infinito quando il tocco termina
scrollContainer.addEventListener('touchend', () => {
    maintainInfiniteScroll(); // Mantieni lo scorrimento infinito
    applyInertia(); // Avvia la decelerazione
});

// Ascolta l'evento di scorrimento
window.addEventListener('wheel', function(event) {
    isScrolling = true; // Imposta lo stato di scrolling attivo
    event.preventDefault();

    // Scorre orizzontalmente in base alla direzione dello scorrimento verticale
    scrollContainer.scrollLeft += event.deltaY;

    // Chiama la funzione per mantenere lo scorrimento infinito
    maintainInfiniteScroll();

    // Reset dello stato di scrolling dopo un breve intervallo
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        isScrolling = false; // Ripristina lo stato di scrolling inattivo
    }, 100); // Aggiusta il timeout se necessario
});

window.onload = () => {
    setupInfiniteScroll();
    scrollContainer.addEventListener('scroll', maintainInfiniteScroll);
};
