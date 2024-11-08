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



function setupInfiniteScroll() {
    const images = document.querySelectorAll('.image-wrapper');
    const imageCount = images.length;
    const imageWidth = images[0].clientWidth;
    
    for(let cristo=0; cristo<9; cristo++){
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




// Event listener per il rilascio del tocco
scrollContainer.addEventListener('touchend', () => {
    maintainInfiniteScroll();
    
    // Implementa il "snap" se il dispositivo è mobile
    if (window.innerWidth <= 768) {
        const images = document.querySelectorAll('.image-wrapper');
        let closestImage = null;
        let closestDistance = Infinity;
        
        // Trova l'immagine più vicina al centro
        images.forEach(imageWrapper => {
            const imageRect = imageWrapper.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const imageCenter = imageRect.left + imageRect.width / 2;
            const containerCenter = containerRect.left + containerRect.width / 2;
            const distance = Math.abs(containerCenter - imageCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestImage = imageWrapper;
            }
        });

        // Calcola la posizione dello scroll per lo snap
        if (closestImage) {
            const targetPosition = closestImage.getBoundingClientRect().left - containerRect.left;
            scrollContainer.scrollTo({
                left: targetPosition,
                behavior: 'smooth' // Aggiunge un effetto di scorrimento fluido
            });
        }
    }
});




// Capture the currently enlarged image's URL
let currentImageUrl = '';

// Update the enlargeImageAtCenter function to set currentImageUrl
function enlargeImageAtCenter() {
    const images = document.querySelectorAll('.image-wrapper');
    const containerRect = scrollContainer.getBoundingClientRect();
    const centerPosition = containerRect.left + containerRect.width / 1.6;

    let closestImage = null;
    let closestDistance = Infinity;

    // Trova l'immagine più vicina al centro dello schermo
    images.forEach(imageWrapper => {
        const imageRect = imageWrapper.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;
        const distance = Math.abs(centerPosition - imageCenter);

        // Modifica il margine di tolleranza per dispositivi mobili
        const tolerance = window.innerWidth <= 768 ? 1000 : 100; // 50px per mobile, 100px per desktop

        if (distance < closestDistance && distance <= tolerance) { // Considera solo distanze minori o uguali al margine di tolleranza
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

        // Ingrandisci l'immagine corrente
        const currentImage = closestImage.querySelector('.image');
        if (window.innerWidth <= 768) { // Su dispositivi mobili
            currentImage.style.width = '300px';
            currentImage.style.height = '350px';
        } else { // Su dispositivi desktop
            currentImage.style.width = '500px';
            currentImage.style.height = '550px';
        }

        // Aggiorna l'URL dell'immagine corrente per il link della lista
        currentImageUrl = currentImage.src; // Memorizza l'URL dell'immagine ingrandita

        // Aggiorna l'ultima immagine centrata
        lastCenteredImage = closestImage;
    }
}


// Add event listener for the List link
document.getElementById('listLink').addEventListener('click', function(event) {
    // Redirect to list.html with the enlarged image URL
    window.location.href = `list.html?image=${encodeURIComponent(currentImageUrl)}`;
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






// Reindirizza alla seconda pagina solo se l'immagine 1 viene cliccata
const firstImage = document.querySelector('.image-wrapper'); // Seleziona solo la prima immagine
firstImage.addEventListener('click', function(event) {
    const rect = firstImage.getBoundingClientRect();
    const x = rect.left + window.scrollX + rect.width / 2; // Ottieni la posizione centrale dell'immagine
    const y = rect.top + window.scrollY + rect.height / 2; // Ottieni la posizione centrale dell'immagine
    window.location.href = `pagina1.html?x=${x}&y=${y}`; // Reindirizza alla seconda pagina
});

// Rimuovi il comportamento di clic dalle altre immagini
const otherImages = document.querySelectorAll('.image:not(:first-child)');
otherImages.forEach(image => {
    image.style.pointerEvents = 'none'; // Disabilita il clic sulle altre immagini
});



// Variabili per tracciare il tocco
let touchStartX = 0;
let touchEndX = 0;

// Event listener per l'inizio del tocco
scrollContainer.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
}, { passive: true });

// Event listener per il movimento del tocco
scrollContainer.addEventListener('touchmove', (event) => {
    touchEndX = event.touches[0].clientX;
    
    // Calcola la differenza e aggiorna lo scroll in base alla direzione
    const deltaX = touchStartX - touchEndX;
    scrollContainer.scrollLeft += deltaX;
    touchStartX = touchEndX;
}, { passive: true });

// Mantieni lo scorrimento infinito quando il tocco termina
scrollContainer.addEventListener('touchend', () => {
    maintainInfiniteScroll();
});

