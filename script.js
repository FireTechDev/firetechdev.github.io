// Animation de la navigation au scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = 'none';
    }
});

// Animation des éléments au scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Appliquer l'animation aux cartes de fonctionnalités
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Gestion du formulaire de contact
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Animation du bouton
    const submitButton = contactForm.querySelector('.submit-button');
    submitButton.innerHTML = 'Envoi en cours...';
    submitButton.style.opacity = '0.7';
    
    // Simuler l'envoi du formulaire
    setTimeout(() => {
        submitButton.innerHTML = 'Message envoyé !';
        submitButton.style.background = '#2ecc71';
        contactForm.reset();
        
        // Réinitialiser le bouton après 3 secondes
        setTimeout(() => {
            submitButton.innerHTML = 'Envoyer';
            submitButton.style.background = '';
            submitButton.style.opacity = '1';
        }, 3000);
    }, 1500);
});

// Smooth scroll pour les liens de navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}); 