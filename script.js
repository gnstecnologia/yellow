/* ==========================================================================
   YELLOW TRANSFER - JAVASCRIPT COMPLETO
   ========================================================================== */

// Configurações globais
const CONFIG = {
    // URLs de contato
    whatsapp: {
        principal: 'https://wa.me/34675394419',
        brasil: 'https://wa.me/5521969414246',
        email: 'suporte@yellowtransfer.com.br'
    },
    
    // Mensagens serão obtidas dinamicamente baseadas no idioma atual
    
    // Configurações de animação
    animation: {
        duration: 300,
        easing: 'ease-in-out'
    },
    
    // Breakpoints
    breakpoints: {
        mobile: 640,
        tablet: 1024,
        desktop: 1200
    }
};

// Estado global da aplicação
const AppState = {
    currentLanguage: 'pt',
    isMenuOpen: false,
    isScrolled: false,
    consentGiven: false,
    currentTestimonial: 0,
    testimonials: [],
    translations: {}
};

// Utilitários
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Smooth scroll to element
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Generate WhatsApp link
    generateWhatsAppLink(message, phone = CONFIG.whatsapp.principal) {
        const encodedMessage = encodeURIComponent(message);
        return `${phone}?text=${encodedMessage}`;
    },

    // Format phone number
    formatPhoneNumber(phone) {
        return phone.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    },

    // Detect browser language
    detectBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;
        const shortLang = lang.split('-')[0];
        
        const supportedLangs = ['pt', 'es', 'en'];
        return supportedLangs.includes(shortLang) ? shortLang : 'pt';
    },

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\D/g, ''));
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    // Device detection
    isMobile() {
        return window.innerWidth <= CONFIG.breakpoints.mobile;
    },

    isTablet() {
        return window.innerWidth > CONFIG.breakpoints.mobile && window.innerWidth <= CONFIG.breakpoints.tablet;
    },

    isDesktop() {
        return window.innerWidth > CONFIG.breakpoints.tablet;
    }
};

// Gerenciador de navegação
const Navigation = {
    init() {
        this.bindEvents();
        this.updateActiveLink();
    },

    bindEvents() {
        // Links de navegação
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Scroll para atualizar link ativo
        window.addEventListener('scroll', Utils.throttle(this.updateActiveLink.bind(this), 100));
    },

    handleNavClick(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        
        if (href === '#') return;

        const targetElement = document.querySelector(href);
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            Utils.smoothScrollTo(targetElement, headerHeight + 20);
            
            // Fechar menu mobile se estiver aberto
            if (AppState.isMenuOpen) {
                MobileMenu.close();
            }
        }
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
};

// Gerenciador do menu mobile
const MobileMenu = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');
        
        console.log('MobileMenu - Toggle element:', toggle);
        console.log('MobileMenu - Menu element:', menu);
        
        if (toggle) {
            toggle.addEventListener('click', this.toggle.bind(this));
            console.log('MobileMenu - Event listener added to toggle');
        }

        // Fechar menu ao clicar em link
        document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
            link.addEventListener('click', this.close.bind(this));
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                this.close();
            }
        });
    },

    toggle() {
        console.log('MobileMenu - Toggle clicked, isMenuOpen:', AppState.isMenuOpen);
        if (AppState.isMenuOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');
        
        console.log('MobileMenu - Opening menu, toggle:', toggle, 'menu:', menu);
        
        if (toggle && menu) {
            toggle.classList.add('active');
            menu.classList.add('active');
            AppState.isMenuOpen = true;
            document.body.style.overflow = 'hidden';
            console.log('MobileMenu - Menu opened successfully');
        } else {
            console.log('MobileMenu - Failed to open menu - elements not found');
        }
    },

    close() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');
        
        if (toggle && menu) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            AppState.isMenuOpen = false;
            document.body.style.overflow = '';
        }
    }
};

// Gerenciador do header
const Header = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('scroll', Utils.throttle(this.handleScroll.bind(this), 100));
    },

    handleScroll() {
        const header = document.querySelector('.header');
        const scrolled = window.pageYOffset > 50;
        
        if (scrolled !== AppState.isScrolled) {
            AppState.isScrolled = scrolled;
            header.classList.toggle('scrolled', scrolled);
        }
    }
};

// Gerenciador de animações
const Animations = {
    init() {
        this.setupIntersectionObserver();
        this.animateCounters();
    },

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        document.querySelectorAll('.card, .service-card, .testimonial-card, .benefit-card').forEach(el => {
            observer.observe(el);
        });
    },

    animateCounters() {
        const counters = document.querySelectorAll('.animated-counter');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.dataset.target);
            const duration = parseInt(counter.dataset.duration) || 2000;
            const start = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = Math.floor(progress * target);
                
                // Verificar se é o contador de idiomas (target = 3)
                if (target === 3) {
                    counter.textContent = current.toLocaleString();
                } else {
                    counter.textContent = '+' + current.toLocaleString();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            requestAnimationFrame(updateCounter);
        };

        // Observar contadores
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
};

// Gerenciador de testimonials/carousel
const Testimonials = {
    init() {
        this.testimonials = document.querySelectorAll('.testimonial-card');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        
        if (this.testimonials.length > 0) {
            this.bindEvents();
            this.startAutoPlay();
        }
    },

    bindEvents() {
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const dots = document.querySelectorAll('.carousel-dots .dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Pausar autoplay ao passar o mouse
        const carousel = document.querySelector('.testimonials-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
            carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.updateCarousel();
    },

    previous() {
        this.currentIndex = this.currentIndex === 0 ? this.testimonials.length - 1 : this.currentIndex - 1;
        this.updateCarousel();
    },

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    },

    updateCarousel() {
        const track = document.querySelector('.carousel-track');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        
        if (track) {
            const translateX = -this.currentIndex * 100;
            track.style.transform = `translateX(${translateX}%)`;
        }

        // Atualizar dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    },

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, 5000);
    },

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
};

// Gerenciador de FAQ/Accordion
const FAQ = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.faq-trigger').forEach(trigger => {
            trigger.addEventListener('click', this.handleToggle.bind(this));
        });
    },

    handleToggle(e) {
        const trigger = e.currentTarget;
        const content = trigger.nextElementSibling;
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Fechar todos os outros itens
        document.querySelectorAll('.faq-trigger').forEach(otherTrigger => {
            if (otherTrigger !== trigger) {
                otherTrigger.setAttribute('aria-expanded', 'false');
                otherTrigger.classList.remove('active');
                const otherContent = otherTrigger.nextElementSibling;
                otherContent.style.maxHeight = null;
            }
        });

        // Toggle do item atual
        if (isExpanded) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('active');
            content.style.maxHeight = null;
        } else {
            trigger.setAttribute('aria-expanded', 'true');
            trigger.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    }
};

// Gerenciador de WhatsApp
const WhatsApp = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('[data-whatsapp]').forEach(button => {
            button.addEventListener('click', this.handleClick.bind(this));
        });
    },

    handleClick(e) {
        e.preventDefault();
        
        const type = e.currentTarget.dataset.whatsapp;
        const service = e.currentTarget.dataset.service;
        const phone = e.currentTarget.dataset.phone;
        
        // Obter mensagens baseadas no idioma atual
        const currentLang = AppState.currentLanguage;
        const translations = I18n.translations[currentLang];
        
        let message;
        if (type === 'service' && service) {
            message = I18n.getNestedValue(translations, 'whatsapp.service_message').replace('{service}', service);
        } else {
            message = I18n.getNestedValue(translations, 'whatsapp.general_message');
        }
        
        // Usar o número específico se fornecido, senão usar o padrão
        const phoneNumber = phone || CONFIG.whatsapp.principal.replace('https://wa.me/', '');
        const whatsappLink = Utils.generateWhatsAppLink(message, `https://wa.me/${phoneNumber}`);
        window.open(whatsappLink, '_blank');
    },

    // Função para gerar links diretos do WhatsApp
    generateDirectLinks() {
        const currentLang = AppState.currentLanguage;
        const translations = I18n.translations[currentLang];
        
        // Atualizar todos os botões do WhatsApp
        const whatsappButtons = document.querySelectorAll('[data-whatsapp]');
        
        whatsappButtons.forEach(button => {
            const type = button.dataset.whatsapp;
            const service = button.dataset.service;
            const phone = button.dataset.phone;
            
            let message;
            if (type === 'service' && service) {
                message = I18n.getNestedValue(translations, 'whatsapp.service_message').replace('{service}', service);
            } else {
                message = I18n.getNestedValue(translations, 'whatsapp.general_message');
            }
            
            // Usar o número específico se fornecido, senão usar o padrão
            const phoneNumber = phone || CONFIG.whatsapp.principal.replace('https://wa.me/', '');
            const whatsappLink = Utils.generateWhatsAppLink(message, `https://wa.me/${phoneNumber}`);
            button.href = whatsappLink;
        });
    }
};

// Gerenciador de idiomas
const Language = {
    init() {
        this.currentLanguage = Utils.detectBrowserLanguage();
        this.bindEvents();
        this.updateLanguage();
    },

    bindEvents() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.setLanguage(lang);
            });
        });
    },

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('preferred-language', lang);
        this.updateLanguage();
    },

    updateLanguage() {
        // Atualizar botões de idioma
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });

        // Atualizar conteúdo (se houver traduções)
        this.updateContent();
    },

    updateContent() {
        // Aqui você pode implementar a lógica de tradução
        // Por enquanto, apenas atualizamos o HTML lang
        document.documentElement.lang = this.currentLanguage;
    }
};

// Gerenciador de cookies
const CookieConsent = {
    init() {
        this.checkConsent();
        this.bindEvents();
    },

    checkConsent() {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => this.showConsent(), 2000);
        } else {
            AppState.consentGiven = consent === 'accepted';
        }
    },

    bindEvents() {
        const acceptBtn = document.querySelector('.cookie-accept');
        const declineBtn = document.querySelector('.cookie-decline');
        const consent = document.querySelector('#cookie-consent');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.accept());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.decline());
        }

        // Fechar ao clicar fora
        if (consent) {
            consent.addEventListener('click', (e) => {
                if (e.target === consent) {
                    this.decline();
                }
            });
        }
    },

    showConsent() {
        const consent = document.querySelector('#cookie-consent');
        if (consent) {
            consent.classList.add('show');
        }
    },

    accept() {
        localStorage.setItem('cookie-consent', 'accepted');
        AppState.consentGiven = true;
        this.hideConsent();
        // Carregar scripts de analytics
        this.loadAnalytics();
    },

    decline() {
        localStorage.setItem('cookie-consent', 'declined');
        AppState.consentGiven = false;
        this.hideConsent();
    },

    hideConsent() {
        const consent = document.querySelector('#cookie-consent');
        if (consent) {
            consent.classList.remove('show');
        }
    },

    loadAnalytics() {
        // Carregar Google Analytics, Facebook Pixel, etc.
        // Implementação específica dos scripts de analytics
    }
};

// Gerenciador de botão "Voltar ao topo"
const BackToTop = {
    init() {
        this.button = document.querySelector('#back-to-top');
        if (this.button) {
            this.bindEvents();
            this.updateVisibility();
        }
    },

    bindEvents() {
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', Utils.throttle(this.updateVisibility.bind(this), 100));
    },

    updateVisibility() {
        const scrolled = window.pageYOffset > 300;
        this.button.classList.toggle('visible', scrolled);
    }
};

// Gerenciador de formulários
const Forms = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        });

        // Validação em tempo real
        document.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', this.validateField.bind(this));
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Validar formulário
        if (this.validateForm(form)) {
            this.submitForm(form, formData);
        }
    },

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], textarea[required]');
        
        fields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });
        
        return isValid;
    },

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let message = '';
        
        // Validação de campo obrigatório
        if (required && !value) {
            isValid = false;
            message = 'Este campo é obrigatório.';
        }
        
        // Validações específicas por tipo
        if (value && type === 'email' && !Utils.isValidEmail(value)) {
            isValid = false;
            message = 'Por favor, insira um email válido.';
        }
        
        if (value && type === 'tel' && !Utils.isValidPhone(value)) {
            isValid = false;
            message = 'Por favor, insira um telefone válido.';
        }
        
        // Mostrar/ocultar mensagem de erro
        this.showFieldError(field, isValid ? '' : message);
        
        return isValid;
    },

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        
        if (message) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        } else if (errorElement) {
            errorElement.remove();
        }
        
        field.classList.toggle('error', !!message);
    },

    submitForm(form, formData) {
        // Implementar envio do formulário
        // Por enquanto, apenas simular sucesso
        this.showSuccess(form);
    },

    showSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Mensagem enviada com sucesso!';
        
        form.parentNode.insertBefore(successMessage, form);
        form.style.display = 'none';
        
        setTimeout(() => {
            successMessage.remove();
            form.style.display = 'block';
            form.reset();
        }, 3000);
    }
};

// Gerenciador de lazy loading
const LazyLoad = {
    init() {
        this.observeImages();
    },

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
};

// Gerenciador de performance
const Performance = {
    init() {
        this.measurePerformance();
        this.optimizeImages();
    },

    measurePerformance() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Página carregada em ${loadTime}ms`);
        });
    },

    optimizeImages() {
        // Implementar otimizações de imagem
        document.querySelectorAll('img').forEach(img => {
            img.loading = 'lazy';
        });
    }
};

// Sistema de Internacionalização
const I18n = {
    translations: {},

    async init() {
        console.log('Inicializando sistema de internacionalização...');
        await this.loadTranslations();
        this.bindEvents();
        this.updateLanguage();
        console.log('Sistema de internacionalização inicializado!');
    },

    async loadTranslations() {
        try {
            const languages = ['pt', 'es', 'en'];
            for (const lang of languages) {
                const response = await fetch(`./locales/${lang}/common.json`);
                if (!response.ok) {
                    throw new Error(`Erro ao carregar traduções para ${lang}: ${response.status}`);
                }
                this.translations[lang] = await response.json();
                console.log(`Traduções carregadas para ${lang}`);
            }
        } catch (error) {
            console.error('Erro ao carregar traduções:', error);
        }
    },

    bindEvents() {
        // Event listeners para botões de idioma
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.target.dataset.lang;
                console.log('Botão de idioma clicado:', lang);
                this.changeLanguage(lang);
            });
        });
    },

    changeLanguage(lang) {
        console.log('Mudando idioma para:', lang);
        AppState.currentLanguage = lang;
        
        // Atualizar botões ativos
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });

        this.updateLanguage();
    },

    updateLanguage() {
        const translations = this.translations[AppState.currentLanguage];
        console.log('Traduções carregadas:', translations);
        console.log('Idioma atual:', AppState.currentLanguage);
        
        if (!translations) {
            console.error('Traduções não encontradas para:', AppState.currentLanguage);
            return;
        }

        // Gerar links diretos do WhatsApp com as mensagens traduzidas
        WhatsApp.generateDirectLinks();

        // Atualizar elementos com data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Elementos encontrados:', elements.length);
        
        elements.forEach(element => {
            const key = element.dataset.i18n;
            const value = this.getNestedValue(translations, key);
            console.log('Atualizando elemento:', key, '=', value);
            
            if (value) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = value;
                } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        // Atualizar FAQ dinamicamente
        this.updateFAQ(translations);
    },

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    updateFAQ(translations) {
        const faqItems = document.querySelectorAll('.faq-item');
        const faqData = translations.faq?.items;
        
        if (!faqData) return;

        faqItems.forEach((item, index) => {
            const questionKey = `question${index + 1}`;
            const questionData = faqData[questionKey];
            
            if (questionData) {
                const questionElement = item.querySelector('.faq-question');
                const answerElement = item.querySelector('.faq-answer');
                
                if (questionElement) {
                    questionElement.textContent = questionData.question;
                }
                if (answerElement) {
                    answerElement.textContent = questionData.answer;
                }
            }
        });
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos os módulos
    Navigation.init();
    MobileMenu.init();
    Header.init();
    Animations.init();
    Testimonials.init();
    FAQ.init();
    WhatsApp.init();
    I18n.init();
    CookieConsent.init();
    BackToTop.init();
    Forms.init();
    LazyLoad.init();
    Performance.init();
    I18n.init();
    
    // Adicionar classe de carregamento completo
    document.body.classList.add('loaded');
    
    console.log('Yellow Transfer - Aplicação inicializada com sucesso!');
});

// Exportar para uso global se necessário
window.YellowTransfer = {
    Utils,
    CONFIG,
    AppState
};



