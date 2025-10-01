// Scroll to top on page load/refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Initialize all functionality
    initAnimations();
    initCalendar();
    initContactForm();
    initMobileMenu();
    initNavbarScroll();
});


// Intersection Observer for Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));
}

// Interactive Calendar
function initCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Sample booked dates (in real application, this would come from backend)
    const bookedDates = [
        '2024-01-15',
        '2024-01-22',
        '2024-02-14',
        '2024-02-29',
        '2024-03-08',
        '2024-03-15'
    ];

    function createCalendar(month, year) {
        const monthNames = [
            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
        ];

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        let calendarHTML = `
            <div class="calendar-header mb-6">
                <div class="flex justify-between items-center">
                    <button id="prevMonth" class="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 class="text-2xl font-bold text-purple-400">${monthNames[month]} ${year}</h3>
                    <button id="nextMonth" class="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div class="calendar-grid grid grid-cols-7 gap-1 mb-4">
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Pon</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Wt</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Śr</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Czw</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Pt</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Sob</div>
                <div class="calendar-day-header p-2 text-center font-bold text-purple-400">Nie</div>
        `;

        // Empty cells for days before the first day of the month
        for (let i = 0; i < adjustedFirstDay; i++) {
            calendarHTML += '<div class="calendar-day p-2"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isBooked = bookedDates.includes(dateStr);
            const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
            
            let dayClass = 'calendar-day';
            let clickable = true;
            
            if (isPast) {
                dayClass += ' text-gray-600';
                clickable = false;
            } else if (isBooked) {
                dayClass += ' booked';
                clickable = false;
            } else {
                dayClass += ' available';
            }

            calendarHTML += `
                <div class="${dayClass}" 
                     data-date="${dateStr}" 
                     ${clickable ? 'onclick="selectDate(this)"' : ''}>
                    ${day}
                </div>
            `;
        }

        calendarHTML += '</div>';

        // Legend
        calendarHTML += `
            <div class="calendar-legend flex justify-center gap-6 text-sm">
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-green-500 bg-opacity-20 border border-green-500 rounded"></div>
                    <span>Dostępne</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-red-500 bg-opacity-20 border border-red-500 rounded"></div>
                    <span>Zajęte</span>
                </div>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;

        // Add event listeners for navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            const newDate = new Date(year, month - 1, 1);
            createCalendar(newDate.getMonth(), newDate.getFullYear());
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            const newDate = new Date(year, month + 1, 1);
            createCalendar(newDate.getMonth(), newDate.getFullYear());
        });
    }

    // Initialize calendar
    createCalendar(currentMonth, currentYear);
}

// Date Selection Function
window.selectDate = function(element) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });

    // Add selection to clicked date
    element.classList.add('selected');
    
    // Get selected date
    const selectedDate = element.getAttribute('data-date');
    
    // Show confirmation modal or update form
    showDateConfirmation(selectedDate);
};

function showDateConfirmation(date) {
    const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4 border border-purple-500">
            <h3 class="text-2xl font-bold mb-4 text-purple-400">Wybrano datę</h3>
            <p class="text-lg mb-6">${formattedDate}</p>
            <div class="flex gap-4">
                <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    Anuluj
                </button>
                <button onclick="goToContact('${date}')" class="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Wyślij zapytanie
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.closeModal = function() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
};

window.goToContact = function(date) {
    closeModal();
    
    // Scroll to contact section
    const contactSection = document.querySelector('#contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill date in form
    setTimeout(() => {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            dateInput.value = date;
            dateInput.focus();
        }
    }, 1000);
};

// Contact Form Handler
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        this.reset();
    });
}

function showSuccessMessage() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4 border border-green-500">
            <div class="text-center">
                <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                <h3 class="text-2xl font-bold mb-4 text-green-400">Zapytanie wysłane!</h3>
                <p class="text-lg mb-6">Dziękujemy za zapytanie. Skontaktujemy się z Tobą w ciągu 24 godzin.</p>
                <button onclick="closeModal()" class="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    OK
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.md\\:hidden button');
    const navLinks = document.querySelector('.hidden.md\\:flex');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');
            navLinks.classList.toggle('flex-col');
            navLinks.classList.toggle('absolute');
            navLinks.classList.toggle('top-full');
            navLinks.classList.toggle('left-0');
            navLinks.classList.toggle('w-full');
            navLinks.classList.toggle('bg-black');
            navLinks.classList.toggle('p-4');
        });
    }
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('bg-opacity-95');
        } else {
            navbar.classList.remove('bg-opacity-95');
        }
    });
}


// Enhanced Particle Animation System - Mobile Optimized
function initParticles() {
    const particlesContainer = document.getElementById('particles-background');
    if (!particlesContainer) return;
    
    // Reduce particles on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    const maxParticles = isMobile ? 3 : 8;
    const maxFloatingElements = isMobile ? 0 : 2;
    const particleInterval = isMobile ? 3000 : 1500;

    // Create different types of particles
    function createParticle() {
        // Skip if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const particle = document.createElement('div');
        const size = Math.random() * (isMobile ? 6 : 8) + 2;
        const type = Math.random();
        const speed = ['particle-slow', 'particle-medium', 'particle-fast'][Math.floor(Math.random() * 3)];
        
        // Different particle types
        let className = 'particle ' + speed;
        if (type < 0.4) {
            className += ' particle-gradient';
        } else if (type < 0.7) {
            className += ' particle-glow';
        } else {
            className += ' particle-small';
        }
        
        particle.className = className;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            --random-x: ${(Math.random() - 0.5) * (isMobile ? 100 : 200)}px;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        particle.addEventListener('animationend', () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
    }
    
    // Create initial particles
    for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => createParticle(), Math.random() * 3000);
    }
    
    // Continuously create new particles - optimized frequency
    let particleIntervalId = setInterval(() => {
        if (particlesContainer.children.length < maxParticles * 1.2) {
            createParticle();
        }
    }, isMobile ? 200 : 150); // Slower on mobile for better performance
    
    // Store interval ID for cleanup
    window.particleIntervalId = particleIntervalId;
    
    // Add some larger floating elements
    function createFloatingElement() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        const element = document.createElement('div');
        const size = Math.random() * (isMobile ? 60 : 100) + (isMobile ? 30 : 50);
        
        element.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.03) 50%, transparent 100%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatLarge ${15 + Math.random() * 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        
        particlesContainer.appendChild(element);
    }
    
    // Create floating background elements
    for (let i = 0; i < maxFloatingElements; i++) {
        createFloatingElement();
    }
    
    // Add floating animation for large elements
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatLarge {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.5; }
            25% { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 1; }
            50% { transform: translateY(-10px) translateX(-15px) rotate(180deg); opacity: 0.7; }
            75% { transform: translateY(-40px) translateX(10px) rotate(270deg); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(particleIntervalId);
    });
    
    // Throttle resize events for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Clear existing intervals before restart
            if (window.particleIntervalId) {
                clearInterval(window.particleIntervalId);
            }
            // Restart particles with new mobile detection
            if (particlesContainer) {
                particlesContainer.innerHTML = '';
                initParticles();
            }
        }, 250);
    }, { passive: true });
}


// Enhanced Animation Observer - optimized for performance
function initEnhancedAnimations() {
    const observerOptions = {
        threshold: 0.15, // Increased threshold for fewer triggers
        rootMargin: '0px 0px -100px 0px' // Larger margin for better performance
    };

    // Throttle animation observer for better performance
    let animationTimeout;
    const observer = new IntersectionObserver(function(entries) {
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Staggered animation delay - reduced for better performance
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        // Unobserve after animation to improve performance
                        observer.unobserve(entry.target);
                    }, index * 50); // Reduced from 100ms to 50ms
                }
            });
        }, 16); // ~60fps throttling
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .zoom-in, .rotate-in');
    animatedElements.forEach(el => observer.observe(el));
}


// Pricing card interactions
function initPricingInteractions() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('pulse-glow');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('pulse-glow');
        });
    });
    
    const pricingBtns = document.querySelectorAll('.modern-pricing-btn, .pricing-btn');
    pricingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const cardTitle = this.closest('.pricing-card').querySelector('h3').textContent;
            showPricingModal(cardTitle);
        });
    });
}

function showPricingModal(packageName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4 border border-purple-500">
            <h3 class="text-2xl font-bold mb-4 text-purple-400">Pakiet ${packageName}</h3>
            <p class="text-lg mb-6">Świetny wybór! Przejdź do formularza kontaktowego aby omówić szczegóły.</p>
            <div class="flex gap-4">
                <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    Anuluj
                </button>
                <button onclick="goToContactForm('${packageName}')" class="flex-1 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Kontakt
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.goToContactForm = function(packageName) {
    closeModal();
    
    // Scroll to contact section
    const contactSection = document.querySelector('#contact');
    contactSection.scrollIntoView({ behavior: 'smooth' });
    
    // Pre-fill package in message
    setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.value = `Jestem zainteresowany pakietem ${packageName}. Proszę o kontakt w sprawie szczegółów.`;
            textarea.focus();
        }
    }, 1000);
};

// FAQ Toggle Function
window.toggleFaq = function(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = button.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.closest('.faq-item').querySelector('.faq-answer').classList.remove('active');
    });
    
    // Toggle current FAQ item
    if (!isActive) {
        button.classList.add('active');
        answer.classList.add('active');
    }
};

// Privacy Policy Modal Functions
window.showPrivacyPolicy = function() {
    const modal = document.getElementById('privacy-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        
        // Scroll modal content to top
        const modalContent = modal.querySelector('.bg-gray-900');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }
};

window.closePrivacyPolicy = function() {
    const modal = document.getElementById('privacy-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
};

// Terms of Service Modal Functions
window.showTermsOfService = function() {
    const modal = document.getElementById('terms-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        
        // Scroll modal content to top
        const modalContent = modal.querySelector('.bg-gray-900');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }
};

window.closeTermsOfService = function() {
    const modal = document.getElementById('terms-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
};

// Scroll to contact function
window.scrollToContact = function() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        // Calculate offset based on navbar height
        const navbar = document.querySelector('nav');
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        
        const offsetTop = contactSection.offsetTop - offset;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};



// Note: initNavHighlighting removed - functionality merged into initActiveNavigation for better performance

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const privacyModal = document.getElementById('privacy-modal');
    const termsModal = document.getElementById('terms-modal');
    
    if (privacyModal) {
        privacyModal.addEventListener('click', function(e) {
            // Only close if clicking on the backdrop (not the modal content)
            if (e.target === privacyModal) {
                closePrivacyPolicy();
            }
        });
        
        // Prevent clicks inside modal content from closing
        const privacyContent = privacyModal.querySelector('.bg-gray-900');
        if (privacyContent) {
            privacyContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    if (termsModal) {
        termsModal.addEventListener('click', function(e) {
            // Only close if clicking on the backdrop (not the modal content)
            if (e.target === termsModal) {
                closeTermsOfService();
            }
        });
        
        // Prevent clicks inside modal content from closing
        const termsContent = termsModal.querySelector('.bg-gray-900');
        if (termsContent) {
            termsContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (privacyModal && !privacyModal.classList.contains('hidden')) {
                closePrivacyPolicy();
            }
            if (termsModal && !termsModal.classList.contains('hidden')) {
                closeTermsOfService();
            }
        }
    });
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = mobileMenuBtn.querySelector('i');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuIcon.classList.remove('fa-bars');
                mobileMenuIcon.classList.add('fa-times');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link-mobile');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars');
            }
        });
    }
    
    // Active navigation tracking
    initActiveNavigation();
});

// Active Navigation Tracking - Simple and Reliable
function initActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
    const sections = document.querySelectorAll('section[id]');
    
    // Calculate offset for scroll
    const getOffset = () => {
        const navbar = document.querySelector('nav');
        return navbar ? navbar.offsetHeight : 72;
    };
    
    // Update active link based on scroll position
    function updateActiveLink() {
        const scrollPos = window.scrollY + getOffset() + 100;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Remove active from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Add active to matching link
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Handle click on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (!href || href.startsWith('javascript:')) return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Remove active from all
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');
                
                // Scroll to section
                const offsetTop = targetSection.offsetTop - getOffset();
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveLink, 50);
    }, { passive: true });
    
    // Initial update
    updateActiveLink();
}

// Blocked dates for calendar (busy weekends) - Updated with more dates
const blockedDates = [
    // January 2025
    '2025-01-04', '2025-01-05', '2025-01-11', '2025-01-12', '2025-01-18', '2025-01-19', '2025-01-25', '2025-01-26',
    // February 2025  
    '2025-02-01', '2025-02-02', '2025-02-08', '2025-02-09', '2025-02-15', '2025-02-16', '2025-02-22', '2025-02-23',
    // March 2025
    '2025-03-01', '2025-03-02', '2025-03-08', '2025-03-09', '2025-03-15', '2025-03-16', '2025-03-22', '2025-03-23', '2025-03-29', '2025-03-30',
    // April 2025
    '2025-04-05', '2025-04-06', '2025-04-12', '2025-04-13', '2025-04-19', '2025-04-20', '2025-04-26', '2025-04-27',
    // May 2025 (wedding season)
    '2025-05-03', '2025-05-04', '2025-05-10', '2025-05-11', '2025-05-17', '2025-05-18', '2025-05-24', '2025-05-25', '2025-05-31',
    // June 2025 (peak wedding season)
    '2025-06-01', '2025-06-07', '2025-06-08', '2025-06-14', '2025-06-15', '2025-06-21', '2025-06-22', '2025-06-28', '2025-06-29',
    // July 2025 (peak wedding season)
    '2025-07-05', '2025-07-06', '2025-07-12', '2025-07-13', '2025-07-19', '2025-07-20', '2025-07-26', '2025-07-27',
    // August 2025 (peak wedding season)
    '2025-08-02', '2025-08-03', '2025-08-09', '2025-08-10', '2025-08-16', '2025-08-17', '2025-08-23', '2025-08-24', '2025-08-30', '2025-08-31',
    // September 2025 (wedding season)
    '2025-09-06', '2025-09-07', '2025-09-13', '2025-09-14', '2025-09-20', '2025-09-21', '2025-09-27', '2025-09-28',
    // October 2025
    '2025-10-04', '2025-10-05', '2025-10-11', '2025-10-12', '2025-10-18', '2025-10-19', '2025-10-25', '2025-10-26',
    // November 2025
    '2025-11-01', '2025-11-02', '2025-11-08', '2025-11-09', '2025-11-15', '2025-11-16', '2025-11-22', '2025-11-23', '2025-11-29', '2025-11-30',
    // December 2025
    '2025-12-06', '2025-12-07', '2025-12-13', '2025-12-14', '2025-12-20', '2025-12-21', '2025-12-27', '2025-12-28'
];

// Blocked dates loaded: ' + blockedDates.length + ' dates

// Initialize calendar restrictions - Optimized
function initCalendarRestrictions() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (!dateInputs.length) return;
    
    const today = new Date().toISOString().split('T')[0];
    const blockedDatesSet = new Set(blockedDates); // Use Set for O(1) lookup
    
    dateInputs.forEach(input => {
        // Set date constraints
        input.setAttribute('min', today);
        input.setAttribute('max', '2025-12-31');
        
        // Validate blocked dates
        const validateDate = (date) => {
            if (!date) return true;
            return !blockedDatesSet.has(date);
        };
        
        // Update input styling
        const updateInputStyle = (isValid) => {
            input.style.borderColor = isValid ? 'rgba(168, 85, 247, 0.3)' : '#ef4444';
            input.style.backgroundColor = isValid ? 'rgba(15, 23, 42, 0.8)' : 'rgba(239, 68, 68, 0.1)';
        };
        
        // Change event - validate and alert
        input.addEventListener('change', function() {
            const selectedDate = this.value;
            if (!validateDate(selectedDate)) {
                alert('Przepraszamy, ten termin jest już zajęty. Proszę wybrać inną datę.');
                this.value = '';
                updateInputStyle(true);
            }
        });
        
        // Input event - real-time visual feedback
        input.addEventListener('input', function() {
            const isValid = validateDate(this.value);
            updateInputStyle(isValid);
        });
    });
}


// Initialize critical features immediately
document.addEventListener('DOMContentLoaded', () => {
    // Critical features - load immediately
    initCalendarRestrictions();
    
    // Non-critical features - load after a delay for better initial performance
    setTimeout(() => {
        initCalendar();
        initEnhancedAnimations();
        initPricingInteractions();
    }, 500);
    
    // Heavy features - load when page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            initParticles();
        }, 100);
    });
});

// Add CSS for selected calendar day
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .calendar-day.selected {
        background: rgba(168, 85, 247, 0.5) !important;
        border-color: var(--primary-purple) !important;
        transform: scale(1.1);
        z-index: 1;
        position: relative;
    }
    
    .calendar-day {
        position: relative;
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(additionalStyles);
