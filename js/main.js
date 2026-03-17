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
    const NL = '\n';
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
   LU-MI: CONTROLADOR DEL ASISTENTE
   ======================================== */
const LumiController = {
  container: null,
  bubble: null,
  text: null,
  clickArea: null,
  isAtLeft: false,
  
  messages: [
    "¡Hola! Soy Lumi, tu guía para una visión perfecta.",
    "¿Sabías que debemos revisar nuestra vista una vez al año?",
    "La regla 20-20-20: cada 20 minutos, descansa la vista 20 segundos.",
    "Recuerda parpadear con frecuencia al usar pantallas para evitar la sequedad.",
    "Usa lentes con protección UV para cuidar tu retina de la luz solar.",
    "Tus ojos se cansan menos si mantienes una buena iluminación al leer.",
    "Contamos con más de 50 marcas de monturas para resaltar tu estilo.",
    "¿Viendo borroso? Toca cualquier búho para agendar tu revisión.",
    "Mantén tu pantalla a la distancia de un brazo para evitar fatiga visual.",
    "El consumo de vitamina A favorece la salud de tus ojos a largo plazo.",
    "Atendemos todos los días en el consultorio SUSALUD EMO.",
    "Una visión clara mejora significativamente tu calidad de vida."
  ],
  
  lastActivity: Date.now(),
  isResting: false,
  isHidden: false,
  cycleTimer: null,
  pupils: [],
  shines: [],
  lastScrollTop: 0,
  scrollSpeedTimer: null,
  isDizzy: false,
  
  init() {
    this.container = document.getElementById('lumi-container');
    this.bubble = document.getElementById('lumi-bubble');
    this.text = document.getElementById('lumi-text');
    this.clickArea = document.getElementById('lumi-click-area');
    
    // Selectores para ojos
    this.pupils = document.querySelectorAll('.lumi-pupil-l, .lumi-pupil-r');
    this.shines = document.querySelectorAll('.lumi-eye-shine');
    
    if (!this.container || !this.clickArea) return;
    
    this.bindEvents();
    this.startLifecycle();
  },
  
  bindEvents() {
    // Escuchar a TODOS los disparadores de Lumi (búhos en la página)
    document.querySelectorAll('.lumi-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        // Prevenir navegación si es un enlace (como el logo)
        if (trigger.tagName === 'A') {
          e.preventDefault();
        }
        
        // Si está escondida, aparecer de inmediato
        if (this.isHidden) this.show();

        if (trigger.id === 'lumi-click-area') return;
        this.say("Claro, te ayudo a agendar tu cita médica.", true);
        setTimeout(() => Modal.open(), 800);
      });
    });

    // Clic directo en Lumi (el flotante)
    this.clickArea.addEventListener('click', () => {
      this.backflip();
      this.say("Vamos a coordinar tu examen visual.", true);
      setTimeout(() => Modal.open(), 1000);
    });
    
    window.addEventListener('scroll', () => {
      this.handleScroll();
      this.handleScrollSpeed(); // Nueva: detectar mareo
      this.wakeUp();
      // Si se mueve mucho el scroll, Lumi aparece curiosa
      if (this.isHidden && Math.random() > 0.98) this.show();
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
      this.wakeUp();
      this.updateEyeTracking(e); // Nueva: seguir cursor
    });
  },

  updateEyeTracking(e) {
    if (this.isResting || this.isDizzy) return;

    // Actualizar CADA búho en la página de forma independiente
    document.querySelectorAll('.owl-svg, .lumi-owl-svg, .modal-owl').forEach(owl => {
      const r = owl.getBoundingClientRect();
      const owlX = r.left + r.width / 2;
      const owlY = r.top + r.height / 2;

      const angle = Math.atan2(e.clientY - owlY, e.clientX - owlX);
      const distance = Math.min(3, Math.hypot(e.clientX - owlX, e.clientY - owlY) / 100);

      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      owl.querySelectorAll('.lumi-pupil-l, .lumi-pupil-r').forEach(p => {
        p.style.transform = `translate(${tx}px, ${ty}px)`;
      });
      owl.querySelectorAll('.lumi-eye-shine').forEach(s => {
        s.style.transform = `translate(${tx * 0.5}px, ${ty * 0.5}px)`;
      });
    });
  },

  handleScrollSpeed() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const diff = Math.abs(st - this.lastScrollTop);
    this.lastScrollTop = st <= 0 ? 0 : st;

    // Si el scroll es muy agresivo (ej: > 100px por evento)
    if (diff > 120 && !this.isDizzy && !this.isHidden) {
      this.getDizzy();
    }
  },

  getDizzy() {
    this.isDizzy = true;
    this.container.classList.add('dizzy');
    this.say("¡Ufff, qué velocidad! Me mareé un poco... 😵‍💫", true);
    
    setTimeout(() => {
      this.container.classList.remove('dizzy');
      this.backflip(); // Sacudirse para recuperarse
      this.isDizzy = false;
      setTimeout(() => this.say("¡Listo! Ya recuperé el enfoque."), 1000);
    }, 2000);
  },
  
  startLifecycle() {
    // Primera aparición
    setTimeout(() => this.show(), 2000);
    
    // Mensajes aleatorios
    setInterval(() => {
      if (this.isResting || this.isHidden) return;
      const randomMsg = this.messages[Math.floor(Math.random() * this.messages.length)];
      this.say(randomMsg);
    }, 40000);

    // Ciclo de visibilidad (Escondite)
    this.planNextCycle();
    
    // Gestos aleatorios (Inclinación de cabeza)
    setInterval(() => {
      if (this.isHidden || this.isResting || this.isDizzy) return;
      if (Math.random() > 0.7) {
        this.container.classList.add('tilt');
        setTimeout(() => this.container.classList.remove('tilt'), 1500);
      }
    }, 12000);

    // Detección de inactividad cada 10 segundos
    setInterval(() => this.checkInactivity(), 10000);
    
    setInterval(() => this.wander(), 5000);
  },

  planNextCycle() {
    if (this.cycleTimer) clearTimeout(this.cycleTimer);

    const delay = this.isHidden 
      ? Math.random() * 20000 + 10000 // Reaparecer en 10-30 seg
      : Math.random() * 30000 + 40000; // Esconderse en 40-70 seg

    this.cycleTimer = setTimeout(() => {
      this.isHidden ? this.show() : this.hide();
      this.planNextCycle();
    }, delay);
  },

  hide() {
    if (this.isHidden) return;
    this.isHidden = true;
    this.container.classList.add('hidden');
    // Cerrar burbuja si está abierta
    this.bubble.classList.remove('visible');
  },

  show() {
    if (!this.isHidden && this.container.classList.contains('hidden') === false) {
      // Si ya está visible, solo patrullar para cambiar de lugar
      this.patrol();
      return;
    }
    
    this.isHidden = false;
    this.patrol(); // Elegir spot antes de mostrar
    this.container.classList.remove('hidden');
    this.backflip();
    
    setTimeout(() => {
      this.say("¡Aquí estoy de nuevo! ¿En qué puedo ayudarte?");
    }, 1000);
  },
  
  say(message, important = false) {
    if (!this.bubble || !this.text || this.isHidden) return;
    this.text.textContent = message;
    this.bubble.classList.add('visible');
    
    if (important) {
      this.container.classList.add('glow');
      setTimeout(() => this.container.classList.remove('glow'), 2000);
    }

    setTimeout(() => this.bubble.classList.remove('visible'), 7000);
  },

  patrol() {
    const roles = ['left', 'right', 'center', 'peeking'];
    const newPos = roles[Math.floor(Math.random() * roles.length)];
    
    // Limpiar estados previos
    this.container.classList.remove('left', 'center', 'peeking');
    this.container.classList.add('flying');

    if (newPos === 'peeking') {
      this.container.classList.add('peeking');
      if (Math.random() > 0.5) this.container.classList.add('left');
      if (!this.isHidden) this.say("Solo me asomo para ver si necesitas ayuda...");
    } else if (newPos === 'center') {
      this.container.classList.add('center');
      if (!this.isHidden) this.say("Desde aquí tengo una mejor vista de todo.");
    } else if (newPos === 'left') {
      this.container.classList.add('left');
      if (!this.isHidden) this.say("Cambiando de posición estratégica.");
    } else {
      if (!this.isHidden) this.say("Regresando a mi rincón favorito.");
    }

    setTimeout(() => {
      this.container.classList.remove('flying');
      if (Math.random() > 0.6 && !this.isHidden) this.backflip();
    }, 850);
  },

  backflip() {
    if (this.isHidden) return;
    this.container.classList.add('backflip');
    setTimeout(() => this.container.classList.remove('backflip'), 800);
  },

  checkInactivity() {
    if (Date.now() - this.lastActivity > 30000 && !this.isResting && !this.isHidden) {
      this.isResting = true;
      this.container.classList.add('resting');
      this.say("Entrando en modo descanso visual...");
    }
  },

  wakeUp() {
    this.lastActivity = Date.now();
    if (this.isResting) {
      this.isResting = false;
      this.container.classList.remove('resting');
      this.backflip();
      this.say("¡Ya desperté! Continuemos con tu examen.");
    }
  },
  
  wander() {
    if (this.isHidden) return;
    // Sutil movimiento orgánico
    const x = Math.floor(Math.random() * 10) - 5;
    const y = Math.floor(Math.random() * 10) - 5;
    this.container.style.transform = `translate(${x}px, ${y}px)`;
  },
  
  handleScroll() {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (scrollPercent > 0.95 && !this.isHidden) {
      this.say("Antes de irte, recuerda agendar tu revisión anual.", true);
    }
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
  LumiController.init();
});
