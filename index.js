// ========================================
// Portfolio Website - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLanguageToggle();
    initLazyLoading();
    initNavigation();
    initProjectCards();
    initProjectFilter();
    applyPendingFilter();
    initSearchOverlay();
    initScrollReveal();
    initSmoothScroll();
    initEmailLink();
});

// ========================================
// Email link: copy to clipboard with feedback
// ========================================
function initEmailLink() {
    const link = document.getElementById('email-link');
    if (!link) return;
    const label = link.querySelector('.email-label');
    const email = link.dataset.email;
    let resetTimer = null;
    link.addEventListener('click', (e) => {
        if (navigator.clipboard) {
            e.preventDefault();
            navigator.clipboard.writeText(email).then(() => {
                const original = label.textContent;
                const msg = document.documentElement.lang === 'en' ? 'Copied!' : 'Copié !';
                label.textContent = msg;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                    label.textContent = email;
                }, 1500);
            });
            window.location.href = link.href;
        }
    });
}

// ========================================
// Language Toggle (FR / EN)
// ========================================
function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-fr][data-en]').forEach(el => {
        el.innerHTML = el.dataset[lang];
    });
    document.querySelectorAll('[data-placeholder-fr][data-placeholder-en]').forEach(el => {
        el.placeholder = lang === 'fr' ? el.dataset.placeholderFr : el.dataset.placeholderEn;
    });
    document.querySelectorAll('[data-title-fr][data-title-en]').forEach(el => {
        el.title = lang === 'fr' ? el.dataset.titleFr : el.dataset.titleEn;
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';
    if (window._refreshDynamicLabels) window._refreshDynamicLabels();
}

// ========================================
// Theme Toggle (Light / Dark)
// ========================================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateCvLink();
}

function updateCvLink() {
    const link = document.getElementById('cv-link');
    if (!link) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    link.href = isLight ? link.dataset.cvLight : link.dataset.cvNight;
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function initLanguageToggle() {
    const btn = document.getElementById('lang-toggle');
    const savedLang = localStorage.getItem('lang') || 'fr';
    applyLanguage(savedLang);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const newLang = document.documentElement.lang === 'fr' ? 'en' : 'fr';
        applyLanguage(newLang);
        localStorage.setItem('lang', newLang);
    });
}

// ========================================
// Lazy Loading for Images
// ========================================
function initLazyLoading() {
    // Add lazy loading to all images except first visible ones
    const allImages = document.querySelectorAll('.carousel-slide img, .project-img, .media-item img');
    allImages.forEach((img, index) => {
        // Only lazy load images that aren't immediately visible
        if (index > 2) {
            img.loading = 'lazy';
        }
        // Add decoding async for better performance
        img.decoding = 'async';
    });
}

// ========================================
// Navigation
// ========================================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Navbar background on scroll - debounced for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                if (currentScroll > 100) {
                    navbar.classList.add('navbar--scrolled');
                } else {
                    navbar.classList.remove('navbar--scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ========================================
// Project Cards
// ========================================
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link
            if (e.target.closest('.project-link')) {
                return;
            }

            // Toggle expanded state
            const isExpanded = card.classList.contains('expanded');

            // Close all other cards
            projectCards.forEach(c => {
                if (c !== card) {
                    c.classList.remove('expanded');
                }
            });

            // Toggle current card
            card.classList.toggle('expanded');

            // Scroll into view if expanding
            if (!isExpanded) {
                setTimeout(() => {
                    card.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 100);
            }
        });
    });
}

// ========================================
// Apply filter saved from a project page
// ========================================
function applyPendingFilter() {
    const pending = localStorage.getItem('portfolioFilter');
    if (!pending) return;
    localStorage.removeItem('portfolioFilter');
    try {
        const tags = JSON.parse(pending);
        tags.forEach(tag => window._toggleProjectTag && window._toggleProjectTag(tag));
        const section = document.getElementById('projects');
        if (section) {
            const navHeight = document.getElementById('navbar').offsetHeight;
            setTimeout(() => {
                window.scrollTo({ top: section.getBoundingClientRect().top + window.pageYOffset - navHeight - 16, behavior: 'smooth' });
            }, 150);
        }
    } catch (e) {}
}

// ========================================
// Project Filter (multi-select, AND logic)
// ========================================
function initProjectFilter() {
    const filterInput = document.getElementById('filter-input');
    const filterClear = document.getElementById('filter-clear');
    const filterTagBtns = document.querySelectorAll('.filter-tag');
    const projectCards = document.querySelectorAll('.project-card');
    const noResults = document.getElementById('projects-no-results');
    const filterReset = document.getElementById('filter-reset');

    if (!filterInput || !filterClear) return;

    const activeFilters = new Set();

    function updateNavDisplay() {
        if (activeFilters.size === 0) {
            filterInput.value = '';
            filterClear.classList.remove('visible');
        } else if (activeFilters.size === 1) {
            const [tag] = activeFilters;
            const chip = document.querySelector(`[data-tag="${tag}"]`);
            filterInput.value = chip ? chip.textContent.trim() : tag;
            filterClear.classList.add('visible');
        } else {
            const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
            const count = activeFilters.size;
            filterInput.value = lang === 'en'
                ? `${count} active filter${count > 1 ? 's' : ''}`
                : `${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`;
            filterClear.classList.add('visible');
        }
    }

    function applyFilter() {
        updateNavDisplay();

        // Sync active state on all tag chips (projects section + overlay)
        document.querySelectorAll('.filter-tag, .overlay-tag').forEach(btn => {
            btn.classList.toggle('active', activeFilters.has(btn.dataset.tag));
        });

        // Update "Voir les projets (N)" count in overlay footer
        let visibleCount = 0;
        projectCards.forEach(card => {
            let matches;
            if (activeFilters.size === 0) {
                matches = true;
            } else {
                const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim());
                matches = [...activeFilters].every(t => cardTags.includes(t));
            }
            card.classList.toggle('filter-hidden', !matches);
            if (matches) {
                card.classList.add('revealed');
                visibleCount++;
            }
        });

        const applyLabel = document.getElementById('overlay-apply-label');
        if (applyLabel) {
            const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
            const base = lang === 'en' ? 'View projects' : 'Voir les projets';
            applyLabel.textContent = activeFilters.size > 0
                ? `${base} (${visibleCount})`
                : base;
        }

        if (noResults) {
            noResults.classList.toggle('visible', visibleCount === 0);
        }
    }

    function toggleTag(tagValue) {
        if (activeFilters.has(tagValue)) {
            activeFilters.delete(tagValue);
        } else {
            activeFilters.add(tagValue);
        }
        applyFilter();
    }

    function clearAll() {
        activeFilters.clear();
        applyFilter();
    }

    // Expose for overlay
    window._toggleProjectTag = toggleTag;
    window._clearProjectFilters = clearAll;
    window._getActiveFilters = () => activeFilters;
    window._refreshDynamicLabels = applyFilter;

    filterClear.addEventListener('click', clearAll);

    filterTagBtns.forEach(btn => {
        btn.addEventListener('click', () => toggleTag(btn.dataset.tag));
    });

    if (filterReset) {
        filterReset.addEventListener('click', clearAll);
    }
}

// ========================================
// Search Overlay
// ========================================
function initSearchOverlay() {
    const navInput = document.getElementById('filter-input');
    const overlay = document.getElementById('search-overlay');
    const overlayInput = document.getElementById('overlay-input');
    const overlayClose = document.getElementById('search-overlay-close');
    const overlayBackdrop = document.getElementById('search-overlay-backdrop');
    const overlayTags = document.querySelectorAll('.overlay-tag');
    const overlayClearAll = document.getElementById('overlay-clear-all');
    const overlayApply = document.getElementById('overlay-apply');

    if (!navInput || !overlay) return;

    // Detect if we're on a project page (no main portfolio grid present)
    const isProjectPage = !document.getElementById('projects');

    // On project pages, manage selection locally then navigate
    const localFilters = new Set();

    function openOverlay() {
        overlay.classList.add('active');
        overlay.removeAttribute('aria-hidden');
        overlayInput.value = '';
        filterOverlayTags('');
        requestAnimationFrame(() => overlayInput.focus());
    }

    function closeOverlay() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }

    function filterOverlayTags(query) {
        const q = query.toLowerCase().trim();
        overlayTags.forEach(tag => {
            const visible = !q || tag.textContent.toLowerCase().includes(q) || tag.dataset.tag.includes(q);
            tag.classList.toggle('tag-hidden', !visible);
        });
    }

    function updateApplyLabel() {
        const applyLabel = document.getElementById('overlay-apply-label');
        if (!applyLabel) return;
        const count = isProjectPage ? localFilters.size : (window._getActiveFilters ? window._getActiveFilters().size : 0);
        const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
        const base = lang === 'en' ? 'View projects' : 'Voir les projets';
        if (count > 0) {
            applyLabel.textContent = lang === 'en'
                ? `${base} (${count} filter${count > 1 ? 's' : ''})`
                : `${base} (${count} filtre${count > 1 ? 's' : ''})`;
        } else {
            applyLabel.textContent = base;
        }
    }

    navInput.addEventListener('click', (e) => {
        e.stopPropagation();
        openOverlay();
    });

    overlayInput.addEventListener('input', () => filterOverlayTags(overlayInput.value));

    overlayTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const tagValue = tag.dataset.tag;
            if (isProjectPage) {
                if (localFilters.has(tagValue)) {
                    localFilters.delete(tagValue);
                    tag.classList.remove('active');
                } else {
                    localFilters.add(tagValue);
                    tag.classList.add('active');
                }
                updateApplyLabel();
            } else {
                window._toggleProjectTag(tagValue);
                updateApplyLabel();
            }
        });
    });

    overlayClearAll.addEventListener('click', () => {
        if (isProjectPage) {
            localFilters.clear();
            overlayTags.forEach(t => t.classList.remove('active'));
        } else {
            window._clearProjectFilters();
        }
        overlayInput.value = '';
        filterOverlayTags('');
        updateApplyLabel();
    });

    function applyAndClose() {
        if (isProjectPage) {
            if (localFilters.size > 0) {
                localStorage.setItem('portfolioFilter', JSON.stringify([...localFilters]));
            }
            window.location.href = '../index.html#projects';
        } else {
            closeOverlay();
            if (window._getActiveFilters && window._getActiveFilters().size > 0) {
                const section = document.getElementById('projects');
                if (section) {
                    const navHeight = document.getElementById('navbar').offsetHeight;
                    window.scrollTo({ top: section.getBoundingClientRect().top + window.pageYOffset - navHeight - 16, behavior: 'smooth' });
                }
            }
        }
    }

    overlayApply.addEventListener('click', applyAndClose);
    overlayClose.addEventListener('click', () => closeOverlay());
    overlayBackdrop.addEventListener('click', () => closeOverlay());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeOverlay();
    });
}

// ========================================
// Scroll Reveal Animation
// ========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Once revealed, stop observing to save resources
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Utility: Debounce
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
