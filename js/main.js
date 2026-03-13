/**
 * A SIMPLE VISTA - Óptica Yarumal
 * Main JavaScript File
 * 
 * Funcionalidades:
 * - Navegación y menú móvil
 * - Modal de agendamiento de citas
 * - Formulario con validación y envío a WhatsApp
 * - Animaciones reveal on scroll
 */

'use strict';

/* ========================================
   CONSTANTES Y CONFIGURACIÓN
   ======================================== */
const CONFIG = {
  SCROLL_THRESHOLD: 60,
  ANIMATION_DELAY_BASE: 90,
  REVEAL_THRESHOLD: 0.1,
  WHATSAPP_NUMBER: '573023915428',
  SELECTORS: {
    NAVBAR: '#navbar',
    HAMBURGER: '#ham',
    MOBILE_MENU: '#mobileMenu',
    MODAL: '#modalCita',
    MODAL_CLOSE_BTN: '#modal-close-btn',
    FORM: {
      NOMBRE: '#f-nombre',
      APELLIDO: '#f-apellido',
      TEL: '#f-tel',
      SERVICIO: '#f-servicio',
      FECHA: '#f-fecha',
      NOTA: '#f-nota'
    },
    CTA_BUTTONS: {
      NAV: '#nav-cta-btn',
      HERO: '#hero-cta-btn',
      MOBILE: '#mobile-cta-btn',
      CITA: '#cita-cta-btn',
      SUBMIT: '#submit-appointment'
    }
  }
};

/* ========================================
   UTILIDADES
   ======================================== */
const Utils = {
  /**
   * Valida que un número de teléfono colombiano tenga formato válido
   * @param {string} phone - Número de teléfono a validar
   * @returns {boolean}
   */
  isValidColombianPhone(phone) {
    const phoneRegex = /^3\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned);
  },

  /**
   * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY
   * @param {string} dateString - Fecha en formato YYYY-MM-DD
   * @returns {string} Fecha formateada o string vacío
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  },

  /**
   * Codifica un string para URL (encodeURIComponent wrapper)
   * @param {string} str - String a codificar
   * @returns {string}
   */
  encode(str) {
    return encodeURIComponent(str);
  }
};

/* ========================================
   NAVEGACIÓN
   ======================================== */
const Navigation = {
  navbar: null,
  hamburger: null,
  mobileMenu: null,

  init() {
    this.navbar = document.querySelector(CONFIG.SELECTORS.NAVBAR);
    this.hamburger = document.querySelector(CONFIG.SELECTORS.HAMBURGER);
    this.mobileMenu = document.querySelector(CONFIG.SELECTORS.MOBILE_MENU);

    if (!this.navbar || !this.hamburger || !this.mobileMenu) return;

    this.bindEvents();
  },

  bindEvents() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    // Hamburger menu
    this.hamburger.addEventListener('click', () => this.toggleMobileMenu());

    // Close menu on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) this.closeMobileMenu();
    }, { passive: true });

    // Close mobile menu on link click
    this.mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
  },

  handleScroll() {
    this.navbar.classList.toggle('scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
  },

  toggleMobileMenu() {
    const isOpen = this.mobileMenu.classList.contains('open');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    this.mobileMenu.classList.add('open');
    this.hamburger.classList.add('active');
    document.body.classList.add('menu-open');
  },

  closeMobileMenu() {
    this.mobileMenu.classList.remove('open');
    this.hamburger.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
};

/* ========================================
   MODAL DE CITAS
   ======================================== */
const Modal = {
  overlay: null,
  modalBox: null,
  closeButton: null,
  previousActiveElement: null,
  ctaButtons: [],

  init() {
    this.overlay = document.querySelector(CONFIG.SELECTORS.MODAL);
    if (!this.overlay) {
      console.error('Modal overlay not found');
      return;
    }

    this.modalBox = this.overlay.querySelector('.modal-box');
    this.closeButton = this.overlay.querySelector(CONFIG.SELECTORS.MODAL_CLOSE_BTN);

    // Cache CTA buttons
    const { CTA_BUTTONS } = CONFIG.SELECTORS;
    this.ctaButtons = [
      document.querySelector(CTA_BUTTONS.NAV),
      document.querySelector(CTA_BUTTONS.HERO),
      document.querySelector(CTA_BUTTONS.MOBILE),
      document.querySelector(CTA_BUTTONS.CITA)
    ].filter(btn => btn !== null);

    console.log('Modal initialized, CTA buttons found:', this.ctaButtons.length);

    this.bindEvents();
  },

  bindEvents() {
    // Open modal buttons
    this.ctaButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.open();
      });
    });

    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // Overlay click (close on background click)
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.close();
      }
    });

    // ESC key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  },

  open() {
    if (!this.overlay) return;

    this.previousActiveElement = document.activeElement;
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Focus trap - focus first focusable element
    setTimeout(() => {
      const firstFocusable = this.modalBox.querySelector('button, input, select, textarea');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  },

  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
    
    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  },

  isOpen() {
    return this.overlay && this.overlay.classList.contains('open');
  }
};

/* ========================================
   FORMULARIO DE CITAS
   ======================================== */
const AppointmentForm = {
  fields: {
    nombre: null,
    apellido: null,
    tel: null,
    servicio: null,
    fecha: null,
    nota: null
  },
  errors: {
    nombre: null,
    tel: null,
    servicio: null
  },

  init() {
    this.cacheElements();
    this.bindEvents();
  },

  cacheElements() {
    const { FORM } = CONFIG.SELECTORS;
    this.fields = {
      nombre: document.querySelector(FORM.NOMBRE),
      apellido: document.querySelector(FORM.APELLIDO),
      tel: document.querySelector(FORM.TEL),
      servicio: document.querySelector(FORM.SERVICIO),
      fecha: document.querySelector(FORM.FECHA),
      nota: document.querySelector(FORM.NOTA)
    };

    this.errors = {
      nombre: document.getElementById('err-nombre'),
      tel: document.getElementById('err-tel'),
      servicio: document.getElementById('err-servicio')
    };
  },

  bindEvents() {
    // Form submit
    const form = document.getElementById('appointment-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleSubmit();
      });
    }

    // Clear errors on input
    ['nombre', 'tel', 'servicio'].forEach(fieldName => {
      const field = this.fields[fieldName];
      const errorEl = this.errors[fieldName];

      if (field && errorEl) {
        ['input', 'change'].forEach(eventType => {
          field.addEventListener(eventType, () => this.clearFieldError(fieldName));
        });
      }
    });
  },

  handleSubmit() {
    if (!this.validate()) return;

    const message = this.buildWhatsAppMessage();
    Modal.close();
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${Utils.encode(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  },

  validate() {
    let isValid = true;
    this.clearAllErrors();

    // Validar nombre
    if (!this.fields.nombre.value.trim()) {
      this.showFieldError('nombre', 'Por favor ingresa tu nombre');
      isValid = false;
    }

    // Validar teléfono
    const phoneValue = this.fields.tel.value.trim();
    if (!phoneValue) {
      this.showFieldError('tel', 'Por favor ingresa tu número de WhatsApp');
      isValid = false;
    } else if (!Utils.isValidColombianPhone(phoneValue)) {
      this.showFieldError('tel', 'Ingresa un número válido (ej: 3023915428)');
      isValid = false;
    }

    // Validar servicio
    if (!this.fields.servicio.value) {
      this.showFieldError('servicio', 'Por favor selecciona un servicio');
      isValid = false;
    }

    return isValid;
  },

  showFieldError(fieldName, message) {
    const field = this.fields[fieldName];
    const errorEl = this.errors[fieldName];

    if (field) field.classList.add('input-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  },

  clearFieldError(fieldName) {
    const field = this.fields[fieldName];
    const errorEl = this.errors[fieldName];

    if (field) field.classList.remove('input-error');
    if (errorEl) errorEl.classList.remove('visible');
  },

  clearAllErrors() {
    Object.keys(this.fields).forEach(key => this.clearFieldError(key));
  },

  buildWhatsAppMessage() {
    const NL = '%0A';
    const { nombre, apellido, tel, servicio, fecha, nota } = this.fields;

    let message = `🦉 *Solicitud de Cita – A Simple Vista*${NL}${NL}`;
    message += `👤 *Nombre:* ${nombre.value.trim()} ${apellido.value.trim()}${NL}`;
    message += `📞 *Teléfono:* ${tel.value.trim()}${NL}`;
    message += `👁️ *Servicio:* ${servicio.value}${NL}`;
    
    if (fecha.value) {
      message += `📅 *Fecha preferida:* ${Utils.formatDate(fecha.value)}${NL}`;
    }
    
    if (nota.value.trim()) {
      message += `📝 *Observaciones:* ${nota.value.trim()}${NL}`;
    }
    
    message += `${NL}_Enviado desde la página web de A Simple Vista_`;
    
    return message;
  }
};

/* ========================================
   ANIMACIONES REVEAL ON SCROLL
   ======================================== */
const RevealAnimations = {
  observer: null,

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin IntersectionObserver
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { threshold: CONFIG.REVEAL_THRESHOLD }
    );

    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  },

  handleIntersection(entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for multiple elements
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * CONFIG.ANIMATION_DELAY_BASE);
        
        this.observer.unobserve(entry.target);
      }
    });
  }
};

/* ========================================
   INICIALIZACIÓN
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  Modal.init();
  AppointmentForm.init();
  RevealAnimations.init();
});
