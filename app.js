/**
 * Web Application Logic for Online Uzbek Wedding Invitation (Taklifnoma)
 * Handles:
 * - 3D Envelope Opening & Sound Activation
 * - Ambient Gold Particle canvas animation
 * - CountDown Timer calculations
 * - Dynamic scroll animations using Intersection Observer
 * - RSVP validation, submit, and localStorage guestbook updates
 * - Interactive wishes slideshow/carousel
 * - Real-time custom Editor panel for Host details modification
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CONFIGURATION MANAGEMENT ---
  const DEFAULT_CONFIG = {
    groomName: 'Kamron',
    brideName: 'Madina',
    weddingDate: '2026-07-12',
    weddingWeekday: 'YAKSHANBA',
    event1Time: '07:00',
    event1Title: 'Nahorgi Osh',
    event1Desc: 'Yaqinlarimiz davrasida to\'yona milliy taomimiz - Nahorgi Osh dasturxoni.',
    event2Time: '18:00',
    event2Title: 'FHOD (ZAGS) marosimi',
    event2Desc: 'Nikohni rasmiy ro\'yxatdan o\'tkazish va yoshlarning tantanali qasamyod qilishlari.',
    event3Time: '19:00',
    event3Title: 'Visol Oqshomi (Tantanali Bazm)',
    event3Desc: 'Kuyov va kelinning to\'y oqshomi, musiqali va ko\'ngilochar bayram dasturi.',
    venueName: '"Versal" To\'yxonasi',
    venueAddress: 'Toshkent shahri, Yunusobod tumani, Bog\'ishamol ko\'chasi, 23-uy',
    mapUrl: 'https://maps.google.com/?q=Versal+Toyxonasi+Tashkent',
    yandexMapUrl: 'https://yandex.uz/maps/?text=Versal+Toyxonasi+Tashkent',
    embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.096739665561!2d69.28828941566872!3d41.32849880757303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b472e3ab6ad%3A0xd68cb020d58850ff!2sVersal!5e0!3m2!1suz!2s!4v1622384758963!5m2!1suz!2s',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    theme: 'theme-royal-blue'
  };

  let config = JSON.parse(localStorage.getItem('wedding_invitation_config')) || DEFAULT_CONFIG;

  // Seeding initial guestbook comments if empty
  const DEFAULT_WISHES = [
    { name: 'Oila a\'zolari', message: 'Ikki dunyo saodatini nasib etsin, baxtingizga ko\'z tegmasin. Qo\'sha qaringlar!', attendance: 'yes' },
    { name: 'Do\'stlar', message: 'Muxabbat yulduzi har doim charaqlab tursin. Yoshlarga baxt va salomatlik tilaymiz!', attendance: 'yes' },
    { name: 'Amaki & Kelinoyi', message: 'Tabrik qilamiz! Baxtingiz shirin va abadiy bo\'lsin. Oila qo\'rg\'onining poydevori mustahkam bo\'lsin!', attendance: 'yes' }
  ];

  let guestWishes = JSON.parse(localStorage.getItem('wedding_invitation_wishes')) || DEFAULT_WISHES;

  // DOM Elements
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const openSeal = document.getElementById('open-seal');
  const mainEnvelope = document.getElementById('main-envelope');
  const envelopeScreen = document.getElementById('envelope-screen');
  const mainInvitation = document.getElementById('main-invitation');
  
  // Custom text slots
  const groomNameTxtElements = document.querySelectorAll('.groom-name-txt');
  const brideNameTxtElements = document.querySelectorAll('.bride-name-txt');
  
  // Date element slots
  const weddingMonthSlot = document.getElementById('wedding-month');
  const weddingDaySlot = document.getElementById('wedding-day');
  const weddingYearSlot = document.getElementById('wedding-year');
  const weddingWeekdaySlot = document.getElementById('wedding-weekday');

  // Timeline slots
  const t1Time = document.getElementById('event1-time');
  const t1Title = document.getElementById('event1-title');
  const t1Desc = document.getElementById('event1-desc');
  const t2Time = document.getElementById('event2-time');
  const t2Title = document.getElementById('event2-title');
  const t2Desc = document.getElementById('event2-desc');
  const t3Time = document.getElementById('event3-time');
  const t3Title = document.getElementById('event3-title');
  const t3Desc = document.getElementById('event3-desc');

  // Venue slots
  const venueNameSlot = document.getElementById('venue-name');
  const venueAddressSlot = document.getElementById('venue-address');
  const mapIframe = document.getElementById('map-iframe');
  const mapUrlBtn = document.getElementById('map-url');
  const yandexMapUrlBtn = document.getElementById('yandex-map-url');

  // RSVP Form Elements
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success');
  const btnInc = document.getElementById('btn-inc');
  const btnDec = document.getElementById('btn-dec');
  const guestCountInput = document.getElementById('guest-count');
  const rsvpResetBtn = document.getElementById('btn-rsvp-reset');
  const wishesContainer = document.getElementById('wishes-container');

  // Editor Form Elements
  const editorTrigger = document.getElementById('editor-trigger');
  const editorPanel = document.getElementById('editor-panel');
  const editorClose = document.getElementById('editor-close');
  const editorForm = document.getElementById('editor-form');

  // --- INITIALIZE PAGE WITH CONFIG ---
  function applyConfig() {
    // Set theme
    document.body.className = '';
    document.body.classList.add(config.theme);

    // Apply Names
    groomNameTxtElements.forEach(el => el.textContent = config.groomName);
    brideNameTxtElements.forEach(el => el.textContent = config.brideName);

    // Parse Wedding Date
    const wDate = new Date(config.weddingDate);
    const monthsUz = ['YANVAR', 'FEVRAL', 'MART', 'APREL', 'MAY', 'IYUN', 'IYUL', 'AVGUST', 'SENTYABR', 'OKTYABR', 'NOYABR', 'DEKABR'];
    if (!isNaN(wDate)) {
      weddingMonthSlot.textContent = monthsUz[wDate.getMonth()];
      weddingDaySlot.textContent = wDate.getDate();
      weddingYearSlot.textContent = wDate.getFullYear();
    }
    weddingWeekdaySlot.textContent = config.weddingWeekday.toUpperCase();

    // Timeline program
    t1Time.textContent = config.event1Time;
    t1Title.textContent = config.event1Title;
    t1Desc.textContent = config.event1Desc;
    t2Time.textContent = config.event2Time;
    t2Title.textContent = config.event2Title;
    t2Desc.textContent = config.event2Desc;
    t3Time.textContent = config.event3Time;
    t3Title.textContent = config.event3Title;
    t3Desc.textContent = config.event3Desc;

    // Venue details
    venueNameSlot.textContent = config.venueName;
    venueAddressSlot.textContent = config.venueAddress;
    mapIframe.src = config.embedMapUrl;
    mapUrlBtn.href = config.mapUrl;
    yandexMapUrlBtn.href = config.yandexMapUrl;

    // Music
    const musicSource = bgMusic.querySelector('source');
    if (musicSource.src !== config.musicUrl) {
      musicSource.src = config.musicUrl;
      bgMusic.load();
      // If it was already playing, attempt to resume
      if (musicToggle.classList.contains('playing') && !bgMusic.paused) {
        bgMusic.play().catch(e => console.log('Audio playback request failed: ', e));
      }
    }

    // Populate Editor fields
    document.getElementById('edit-groom').value = config.groomName;
    document.getElementById('edit-bride').value = config.brideName;
    document.getElementById('edit-date').value = config.weddingDate;
    document.getElementById('edit-weekday').value = config.weddingWeekday;
    document.getElementById('edit-osh-time').value = config.event1Time;
    document.getElementById('edit-zags-time').value = config.event2Time;
    document.getElementById('edit-bazm-time').value = config.event3Time;
    document.getElementById('edit-venue').value = config.venueName;
    document.getElementById('edit-address').value = config.venueAddress;
    document.getElementById('edit-map-url').value = config.mapUrl;
    document.getElementById('edit-yandex-url').value = config.yandexMapUrl;
    document.getElementById('edit-embed-url').value = config.embedMapUrl;
    document.getElementById('edit-music').value = config.musicUrl;
    document.getElementById('edit-theme').value = config.theme;
  }

  // --- ENVELOPE TRANSTIONS (OPEN INVITATION) ---
  openSeal.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent duplicate clicks
    
    // Play sound (with fallback)
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
    }).catch(err => {
      console.log('Audio autoplay blocked, will wait for user to toggle music manually.');
      musicToggle.classList.remove('playing');
    });

    // 1. Open Envelope top flap
    mainEnvelope.classList.add('opened');

    // 2. Slide out the card preview
    setTimeout(() => {
      mainEnvelope.classList.add('card-out');
    }, 700);

    // 3. Fade out envelope screen, show main content with animations
    setTimeout(() => {
      envelopeScreen.classList.add('fade-out');
      mainInvitation.classList.remove('hidden');
      
      // Start scroll animation watcher
      initScrollAnimations();
      
      // Initialize dynamic golden particles
      initParticles();
    }, 1700);
  });

  // --- AUDIO CONTROLLER ---
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
      }).catch(err => console.log('Audio play failed: ', err));
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });


  // --- GOLD DUST PARTICLE CANVAS SYSTEM ---
  let canvas, ctx, particles = [];
  
  function initParticles() {
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create initial particle pool
    const particleCount = window.innerWidth < 480 ? 40 : 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }
    
    animateParticles();
  }
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function createParticle(randomY = false) {
    return {
      x: Math.random() * canvas.width,
      y: randomY ? Math.random() * canvas.height : canvas.height + 10,
      size: Math.random() * 2.5 + 0.5,
      speedY: Math.random() * 0.8 + 0.2,
      speedX: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      swayWidth: Math.random() * 30 + 10,
      swaySpeed: Math.random() * 0.02 + 0.005,
      angle: Math.random() * Math.PI * 2
    };
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create golden gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#AA771C');
    grad.addColorStop(0.5, '#FBF5B7');
    grad.addColorStop(1, '#BF953F');
    
    particles.forEach((p, index) => {
      p.y -= p.speedY;
      p.angle += p.swaySpeed;
      p.x += Math.sin(p.angle) * 0.3 + p.speedX;
      
      // Draw glow particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
      ctx.shadowColor = '#FCF6BA';
      ctx.shadowBlur = p.size * 2;
      ctx.fill();
      
      // Reset offscreen particles
      if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        particles[index] = createParticle(false);
      }
    });
    
    // Reset shadow blur for other drawings
    ctx.shadowBlur = 0;
    
    requestAnimationFrame(animateParticles);
  }

  // --- COUNTDOWN TIMER ---
  function updateCountdown() {
    const targetDate = new Date(config.weddingDate + 'T18:00:00'); // Standard evening time
    const now = new Date();
    const difference = targetDate - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (difference <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      document.querySelector('.countdown-title').textContent = 'To\'y tantanalari boshlandi!';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown(); // Run immediately

  // --- SCROLL ANIMATION WATCHER ---
  function initScrollAnimations() {
    const animElements = document.querySelectorAll('.scroll-animate');
    
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target); // Trigger only once
        }
      });
    }, observerOptions);

    animElements.forEach(el => {
      observer.observe(el);
    });
  }

  // --- RSVP FORM LOGIC ---
  // Plus/Minus Guest Count buttons
  btnInc.addEventListener('click', () => {
    let val = parseInt(guestCountInput.value);
    if (val < 10) guestCountInput.value = val + 1;
  });

  btnDec.addEventListener('click', () => {
    let val = parseInt(guestCountInput.value);
    if (val > 1) guestCountInput.value = val - 1;
  });

  // Toggle guest count field depending on attendance radio
  const rsvpRadios = document.querySelectorAll('.rsvp-radio');
  const guestCountGroup = document.querySelector('.guest-count-group');

  rsvpRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'no') {
        guestCountGroup.style.display = 'none';
      } else {
        guestCountGroup.style.display = 'block';
      }
    });
  });

  // Form Submit
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const count = attendance === 'yes' ? parseInt(guestCountInput.value) : 0;
    const message = document.getElementById('guest-message').value.trim();

    if (!name) return;

    // Create wish entry
    const newWish = { name, message, attendance, count, date: new Date().toISOString() };
    
    // Store RSVP in localStorage
    const savedRSVPs = JSON.parse(localStorage.getItem('wedding_rsvp_list')) || [];
    savedRSVPs.push(newWish);
    localStorage.setItem('wedding_rsvp_list', JSON.stringify(savedRSVPs));

    // If there's a comment, add to guest wishes
    if (message) {
      guestWishes.unshift({ name, message, attendance });
      localStorage.setItem('wedding_invitation_wishes', JSON.stringify(guestWishes));
      renderWishes();
      activeWishIndex = 0;
      updateWishCarousel();
    }

    // Success transition
    rsvpForm.classList.add('hidden');
    rsvpSuccess.classList.remove('hidden');
  });

  rsvpResetBtn.addEventListener('click', () => {
    rsvpForm.reset();
    guestCountInput.value = 1;
    guestCountGroup.style.display = 'block';
    rsvpSuccess.classList.add('hidden');
    rsvpForm.classList.remove('hidden');
  });

  // --- WISHES CAROUSEL ---
  let activeWishIndex = 0;

  function renderWishes() {
    wishesContainer.innerHTML = '';
    
    if (guestWishes.length === 0) {
      wishesContainer.innerHTML = `
        <div class="wish-card">
          <p class="wish-text">"Hali tilaklar yo'q. Birinchilardan bo'lib o'z tabrigingizni qoldiring!"</p>
          <h5 class="wish-author">- Mehmonlarimiz</h5>
        </div>
      `;
      return;
    }

    guestWishes.forEach(wish => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <p class="wish-text">"${wish.message}"</p>
        <h5 class="wish-author">- ${wish.name}</h5>
      `;
      wishesContainer.appendChild(card);
    });
  }

  function updateWishCarousel() {
    const trackWidth = wishesContainer.clientWidth;
    wishesContainer.style.transform = `translateX(-${activeWishIndex * 100}%)`;
  }

  document.getElementById('btn-next-wish').addEventListener('click', () => {
    activeWishIndex = (activeWishIndex + 1) % Math.max(1, guestWishes.length);
    updateWishCarousel();
  });

  document.getElementById('btn-prev-wish').addEventListener('click', () => {
    activeWishIndex = (activeWishIndex - 1 + guestWishes.length) % Math.max(1, guestWishes.length);
    updateWishCarousel();
  });

  // Handle window resizing for carousel offset correctness
  window.addEventListener('resize', updateWishCarousel);


  // --- HOST SETTINGS EDITOR LOGIC ---
  editorTrigger.addEventListener('click', () => {
    editorPanel.classList.toggle('open');
  });

  editorClose.addEventListener('click', () => {
    editorPanel.classList.remove('open');
  });

  // Click outside to close editor sidebar
  document.addEventListener('click', (e) => {
    if (!editorPanel.contains(e.target) && !editorTrigger.contains(e.target) && editorPanel.classList.contains('open')) {
      editorPanel.classList.remove('open');
    }
  });

  // Submit Host Configurations Form
  editorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    config = {
      groomName: document.getElementById('edit-groom').value.trim(),
      brideName: document.getElementById('edit-bride').value.trim(),
      weddingDate: document.getElementById('edit-date').value,
      weddingWeekday: document.getElementById('edit-weekday').value.trim(),
      event1Time: document.getElementById('edit-osh-time').value.trim(),
      event1Title: 'Nahorgi Osh', // Let them keep standard title or customize in future
      event1Desc: config.event1Desc, // Keep description or customize
      event2Time: document.getElementById('edit-zags-time').value.trim(),
      event2Title: 'FHOD (ZAGS) marosimi',
      event2Desc: config.event2Desc,
      event3Time: document.getElementById('edit-bazm-time').value.trim(),
      event3Title: 'Visol Oqshomi (Tantanali Bazm)',
      event3Desc: config.event3Desc,
      venueName: document.getElementById('edit-venue').value.trim(),
      venueAddress: document.getElementById('edit-address').value.trim(),
      mapUrl: document.getElementById('edit-map-url').value.trim(),
      yandexMapUrl: document.getElementById('edit-yandex-url').value.trim(),
      embedMapUrl: document.getElementById('edit-embed-url').value.trim(),
      musicUrl: document.getElementById('edit-music').value.trim(),
      theme: document.getElementById('edit-theme').value
    };

    localStorage.setItem('wedding_invitation_config', JSON.stringify(config));
    
    // Apply changes instantly
    applyConfig();
    updateCountdown();

    // Close editor panel with visual feedback
    editorPanel.classList.remove('open');
    
    // Visual notifications of success
    const alertDiv = document.createElement('div');
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '80px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.background = 'rgba(212, 175, 55, 0.95)';
    alertDiv.style.color = '#2b251a';
    alertDiv.style.padding = '12px 24px';
    alertDiv.style.borderRadius = '30px';
    alertDiv.style.fontFamily = 'Montserrat, sans-serif';
    alertDiv.style.fontSize = '13px';
    alertDiv.style.fontWeight = '600';
    alertDiv.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    alertDiv.style.zIndex = '99999';
    alertDiv.style.transition = 'all 0.5s ease';
    alertDiv.textContent = 'Taklifnoma muvaffaqiyatli yangilandi!';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transform = 'translate(-50%, 20px)';
      setTimeout(() => alertDiv.remove(), 500);
    }, 2500);
  });

  // --- INITIALIZE PAGE BOOTSTRAP ---
  applyConfig();
  renderWishes();
  updateWishCarousel();
});
