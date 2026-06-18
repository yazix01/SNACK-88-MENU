document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const currentMenuImage = document.getElementById('current-menu-image');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Navigation
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const imageCounter = document.getElementById('image-counter');
    const nextIndicator = document.getElementById('next-indicator');
    const imageContainer = document.getElementById('image-container');
    
    // Modal & Actions
    const qrBtn = document.getElementById('qr-btn');
    const qrModal = document.getElementById('qr-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyBtn = document.getElementById('copy-btn');
    const websiteUrl = document.getElementById('website-url');
    const toast = document.getElementById('toast');

    let updateLightboxIfOpen = () => {};

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxContainer = document.getElementById('lightbox-container');
    const zoomControls = document.getElementById('zoom-controls');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLabel = document.getElementById('zoom-label');

    // State
    let menuImages = [
        { url: 'assets/BURGER.webp', name: 'BURGER' },
        { url: 'assets/CHICKEN BOX.webp', name: 'CHICKEN BOX' },
        { url: 'assets/GRATINE.webp', name: 'GRATINE' },
        { url: 'assets/LES SALADES.webp', name: 'LES SALADES' },
        { url: 'assets/PIZZA.webp', name: 'PIZZA' },
        { url: 'assets/PLATS.webp', name: 'PLATS' },
        { url: 'assets/RIZ GRATINEE.webp', name: 'RIZ GRATINEE' },
        { url: 'assets/SANDWICH.webp', name: 'SANDWICH' },
        { url: 'assets/TACOS.webp', name: 'TACOS' }
    ];
    let currentIndex = 0;
    
    // Initialize App
    async function init() {
        preloadImages();
        
        // Ensure splash screen shows for 0.6 seconds (very fast intro)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        updateUI('next', true); // Pass isInitial = true

        // Reveal main content immediately underneath the splash screen
        mainContent.classList.remove('hidden');

        // Smooth transition out of splash screen
        splashScreen.classList.add('hidden');
        
        // Remove splash from DOM flow after it fades out
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 300); // Matches CSS transition duration
        
        setupEventListeners();
    }

    // Preload images for instant switching
    function preloadImages() {
        menuImages.forEach(item => {
            const img = new Image();
            img.src = item.url;
        });
    }

    function updateUI(direction = 'next', isInitial = false) {
        if (menuImages.length === 0) return;
        
        const nextImage = menuImages[currentIndex];
        
        // Initial setup: just insert the image
        if (isInitial) {
            imageContainer.innerHTML = ''; // clear loading spinner and static image
            const img = document.createElement('img');
            img.src = nextImage.url;
            img.className = 'menu-image';
            img.style.transform = 'translateX(0)';
            imageContainer.appendChild(img);
            
            updateIndicators();
            return;
        }

        // --- Fast-click cleanup ---
        // If there are multiple images animating, keep only the latest one to transition out
        const existingImages = Array.from(imageContainer.querySelectorAll('.menu-image'));
        if (existingImages.length > 1) {
            for (let i = 0; i < existingImages.length - 1; i++) {
                existingImages[i].remove();
            }
        }

        const oldImg = imageContainer.querySelector('.menu-image');
        
        // Create new image element for the slide
        const newImg = document.createElement('img');
        newImg.src = nextImage.url;
        newImg.className = 'menu-image';
        
        // Position it off-screen depending on direction
        newImg.style.transition = 'none';
        newImg.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
        
        imageContainer.appendChild(newImg);
        
        // Force browser to register the new position
        void newImg.offsetWidth;
        
        // Apply smooth transition
        const transitionSettings = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        newImg.style.transition = transitionSettings;
        if (oldImg) {
            oldImg.style.transition = transitionSettings;
        }
        
        // Trigger the slide
        newImg.style.transform = 'translateX(0)';
        if (oldImg) {
            oldImg.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
        }
        
        // Clean up the old image after transition
        setTimeout(() => {
            if (oldImg && oldImg.parentNode) {
                oldImg.parentNode.removeChild(oldImg);
            }
        }, 400); // Wait for transition to finish
        
        updateIndicators();
    }

    function updateIndicators() {
        imageCounter.textContent = `${currentIndex + 1} / ${menuImages.length}`;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        const nextIdx = (currentIndex + 1) % menuImages.length;
        nextIndicator.textContent = `Next: ${menuImages[nextIdx].name}`;
    }

    function goToNext() {
        currentIndex = (currentIndex + 1) % menuImages.length;
        updateUI('next');
        updateLightboxIfOpen();
    }

    function goToPrev() {
        currentIndex = (currentIndex - 1 + menuImages.length) % menuImages.length;
        updateUI('prev');
        updateLightboxIfOpen();
    }

    function setupEventListeners() {
        // Navigation Buttons
        prevBtn.addEventListener('click', goToPrev);
        nextBtn.addEventListener('click', goToNext);
        
        // Touch Swipe Navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        imageContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        imageContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        function handleSwipe() {
            const swipeThreshold = 40; // Minimum distance to register as swipe
            const distance = touchStartX - touchEndX;
            
            if (distance > swipeThreshold) {
                // Swiped Left -> Go to Next Image
                goToNext();
            } else if (distance < -swipeThreshold) {
                // Swiped Right -> Go to Previous Image
                goToPrev();
            }
        }
        
        // QR Code Modal
        qrBtn.addEventListener('click', () => {
            qrModal.classList.remove('hidden');
        });
        
        closeModalBtn.addEventListener('click', () => {
            qrModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                qrModal.classList.add('hidden');
            }
        });
        
        // Copy to Clipboard
        copyBtn.addEventListener('click', () => {
            websiteUrl.select();
            websiteUrl.setSelectionRange(0, 99999); // For mobile devices
            
            // Use modern clipboard API if available
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(websiteUrl.value).then(() => {
                    showToast();
                }).catch(err => {
                    fallbackCopyText();
                });
            } else {
                fallbackCopyText();
            }
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            // Ignore if qr modal is open
            if (!qrModal.classList.contains('hidden')) return;
            
            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            }
        });

        // Lightbox setup
        setupLightbox();
    }

    function fallbackCopyText() {
        try {
            document.execCommand('copy');
            showToast();
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
    }
    
    function showToast() {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // ─── Lightbox with Pinch-to-Zoom & Pan ─────────────
    function setupLightbox() {
        let scale = 1;
        const minScale = 1;
        const maxScale = 5;
        let lastTap = 0;
        let translateX = 0;
        let translateY = 0;

        function updateZoomUI() {
            const pct = Math.round(scale * 100);
            zoomLabel.textContent = `${pct}%`;
        }

        function applyTransform(newScale, newTx, newTy, animated = false) {
            scale = Math.min(maxScale, Math.max(minScale, newScale));
            
            // Reset translation if fully zoomed out
            if (scale === 1) {
                translateX = 0;
                translateY = 0;
            } else {
                translateX = newTx;
                translateY = newTy;
            }

            if (animated) {
                lightboxImg.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
                setTimeout(() => { lightboxImg.style.transition = ''; }, 260);
            } else {
                lightboxImg.style.transition = '';
            }
            
            lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            updateZoomUI();
        }

        function applyScale(newScale, animated = false) {
            applyTransform(newScale, translateX, translateY, animated);
        }

        updateLightboxIfOpen = () => {
            if (!lightbox.classList.contains('hidden')) {
                lightboxImg.src = menuImages[currentIndex].url;
                applyTransform(1, 0, 0, false); // Reset zoom
            }
        };

        // Open lightbox when clicking the image container
        imageContainer.addEventListener('click', () => {
            const currentImg = imageContainer.querySelector('.menu-image');
            if (!currentImg) return;
            lightboxImg.src = currentImg.src;
            applyTransform(1, 0, 0, false);
            lightbox.classList.remove('hidden');
            zoomControls.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

        // Zoom buttons
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyScale(scale + 0.5, true);
        });
        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyScale(scale - 0.5, true);
        });

        // Close button
        lightboxClose.addEventListener('click', closeLightbox);

        // Close by tapping background
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxContainer) {
                closeLightbox();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });

        function closeLightbox() {
            lightbox.classList.add('hidden');
            zoomControls.classList.add('hidden');
            document.body.style.overflow = '';
            applyTransform(1, 0, 0, false);
        }

        // ── Pinch-to-Zoom & Panning (Touch) ──
        let initialDist = 0;
        let initialScale = 1;
        let isDragging = false;
        let startX = 0, startY = 0;
        let startTx = 0, startTy = 0;

        lightboxContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isDragging = false;
                initialDist = getDistance(e.touches[0], e.touches[1]);
                initialScale = scale;
                e.preventDefault();
            } else if (e.touches.length === 1) {
                // Check double tap
                const now = Date.now();
                const delta = now - lastTap;
                if (delta < 300 && delta > 0) {
                    applyTransform(scale > 1 ? 1 : 2.5, 0, 0, true);
                } else if (scale > 1) {
                    // Start dragging if zoomed in
                    isDragging = true;
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    startTx = translateX;
                    startTy = translateY;
                }
                lastTap = now;
            }
        }, { passive: false });

        lightboxContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist = getDistance(e.touches[0], e.touches[1]);
                applyScale(initialScale * (dist / initialDist));
            } else if (e.touches.length === 1 && isDragging && scale > 1) {
                e.preventDefault();
                const dx = e.touches[0].clientX - startX;
                const dy = e.touches[0].clientY - startY;
                
                // Divide dx and dy by scale so dragging feels 1:1 to finger
                applyTransform(scale, startTx + (dx / scale), startTy + (dy / scale), false);
            }
        }, { passive: false });
        
        lightboxContainer.addEventListener('touchend', () => {
            isDragging = false;
        });

        // ── Mouse Wheel Zoom (Desktop) ──
        lightboxContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            applyScale(scale + (e.deltaY > 0 ? -0.2 : 0.2));
        }, { passive: false });

        function getDistance(t1, t2) {
            const dx = t1.clientX - t2.clientX;
            const dy = t1.clientY - t2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        updateZoomUI();
    }

    // Start
    init();
});
