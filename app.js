/* ==============================================
   CampusVibe — Application Logic
   Light Theme + Floating Cards + My Registrations & Cancellation
   ============================================== */

(function () {
    'use strict';

    // ── Config ──
    const ADMIN = { username: 'admin', password: 'admin123' };
    const STORAGE_KEYS = { events: 'cv_events', registrations: 'cv_registrations', admin: 'cv_admin', userEmail: 'cv_user_email' };

    // ── State ──
    let state = {
        events: [],
        registrations: [],
        isAdmin: false,
        adminTab: 'events',
        searchQuery: '',
        filterCategory: 'All',
        adminSearch: '',
        currentUserEmail: ''
    };

    // ── Seed Data ──
    const SEED_EVENTS = [
        {
            id: 'evt-1', name: 'TechFest 2026', date: '2026-10-15', time: '09:00',
            venue: 'Main Auditorium, Block A',
            description: 'The flagship technology festival featuring hackathons, coding competitions, tech talks by industry leaders, and innovation showcases. Join us for 24 hours of non-stop tech excitement with prizes worth ₹1,00,000!',
            category: 'Technology', emoji: '💻', featured: true
        },
        {
            id: 'evt-2', name: 'Cultural Night — Rang Tarang', date: '2026-10-20', time: '18:00',
            venue: 'Open Air Theatre',
            description: 'An enchanting evening celebrating diverse cultures through classical and contemporary dance, music, drama, and fusion art performances by talented students from across the campus.',
            category: 'Cultural', emoji: '🎭', featured: false
        },
        {
            id: 'evt-3', name: 'Marathon for a Cause', date: '2026-10-25', time: '06:00',
            venue: 'College Ground & Campus Route',
            description: 'Run for health, run for a cause! 5K and 10K categories available. All proceeds go to local NGOs supporting education for underprivileged children. Medals for all finishers.',
            category: 'Sports', emoji: '🏃', featured: false
        },
        {
            id: 'evt-4', name: 'Photography Masterclass', date: '2026-11-02', time: '10:00',
            venue: 'Media Lab, Block C',
            description: 'Learn from award-winning photographer Ravi Sharma. Hands-on sessions covering composition, lighting, portrait photography, landscape techniques, and post-processing with Lightroom.',
            category: 'Workshop', emoji: '📸', featured: false
        },
        {
            id: 'evt-5', name: 'Sangeet Night — Battle of Bands', date: '2026-11-05', time: '19:00',
            venue: 'College Amphitheatre',
            description: 'A musical extravaganza featuring live bands, solo vocal & instrumental performances, and the ultimate Battle of Bands. Come experience the electrifying rhythm of campus life!',
            category: 'Cultural', emoji: '🎵', featured: false
        },
        {
            id: 'evt-6', name: 'Code Sprint 3.0', date: '2026-11-10', time: '10:00',
            venue: 'Computer Lab 1 & 2, Block D',
            description: '48-hour competitive programming challenge. Solve real-world algorithmic problems, compete in teams of 3, and win exciting prizes worth ₹50,000! Open to all years.',
            category: 'Technology', emoji: '⚡', featured: true
        },
        {
            id: 'evt-7', name: 'Canvas & Colors — Art Exhibition', date: '2026-11-15', time: '11:00',
            venue: 'Gallery Hall, Main Building',
            description: 'Showcasing 100+ paintings, sculptures, digital art, and mixed-media installations by student artists. A celebration of creativity and artistic expression. Entry free for all.',
            category: 'Arts', emoji: '🎨', featured: false
        },
        {
            id: 'evt-8', name: 'Inter-College Debate Championship', date: '2026-11-18', time: '14:00',
            venue: 'Seminar Hall, Block B',
            description: 'Prestigious inter-college debate championship on contemporary topics covering AI ethics, climate policy, and education reform. Cash prizes and trophies for top 3 teams.',
            category: 'Academic', emoji: '🎤', featured: false
        }
    ];

    const SEED_REGISTRATIONS = [
        { id: 'reg-1', eventId: 'evt-1', name: 'Aarav Sharma', email: 'aarav@college.edu', college: 'NIT Delhi', year: '3rd Year', phone: '9876543210', registeredAt: '2026-09-20T10:30:00' },
        { id: 'reg-2', eventId: 'evt-1', name: 'Priya Patel', email: 'priya.p@college.edu', college: 'NIT Delhi', year: '2nd Year', phone: '9876543211', registeredAt: '2026-09-21T14:00:00' },
        { id: 'reg-3', eventId: 'evt-2', name: 'Rohan Verma', email: 'rohan.v@gmail.com', college: 'IIT Mumbai', year: '4th Year', phone: '9876543212', registeredAt: '2026-09-22T09:15:00' },
        { id: 'reg-4', eventId: 'evt-6', name: 'Sneha Gupta', email: 'sneha.g@college.edu', college: 'NIT Delhi', year: '1st Year', phone: '9876543213', registeredAt: '2026-09-23T16:45:00' },
        { id: 'reg-5', eventId: 'evt-3', name: 'Karan Singh', email: 'karan.s@outlook.com', college: 'DTU', year: '2nd Year', phone: '9876543214', registeredAt: '2026-09-24T11:00:00' },
    ];

    const CATEGORIES = ['All', 'Technology', 'Cultural', 'Sports', 'Workshop', 'Arts', 'Academic'];

    // ── DOM Refs ──
    const $app = document.getElementById('app');
    const $navbar = document.getElementById('navbar');
    const $navLinks = document.getElementById('navLinks');
    const $hamburger = document.getElementById('hamburger');
    const $modalOverlay = document.getElementById('modalOverlay');
    const $modal = document.getElementById('modal');
    const $toastContainer = document.getElementById('toastContainer');

    // ════════════════════════════════════════════
    //  DATA LAYER
    // ════════════════════════════════════════════

    function loadData() {
        const e = localStorage.getItem(STORAGE_KEYS.events);
        const r = localStorage.getItem(STORAGE_KEYS.registrations);
        if (!e) {
            state.events = JSON.parse(JSON.stringify(SEED_EVENTS));
            state.registrations = JSON.parse(JSON.stringify(SEED_REGISTRATIONS));
            saveData();
        } else {
            state.events = JSON.parse(e);
            state.registrations = JSON.parse(r || '[]');
        }
        state.isAdmin = sessionStorage.getItem(STORAGE_KEYS.admin) === 'true';
        state.currentUserEmail = localStorage.getItem(STORAGE_KEYS.userEmail) || '';
        updateNavBadge();
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(state.events));
        localStorage.setItem(STORAGE_KEYS.registrations, JSON.stringify(state.registrations));
        if (state.currentUserEmail) {
            localStorage.setItem(STORAGE_KEYS.userEmail, state.currentUserEmail);
        }
        updateNavBadge();
    }

    function updateNavBadge() {
        const badge = document.getElementById('userRegBadge');
        if (!badge) return;
        if (state.currentUserEmail) {
            const userRegs = state.registrations.filter(r => r.email.toLowerCase() === state.currentUserEmail.toLowerCase());
            badge.textContent = userRegs.length;
            badge.style.display = userRegs.length > 0 ? 'inline-block' : 'none';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }

    function genId(prefix) { return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5); }

    function isRegistered(eventId, email = state.currentUserEmail) {
        if (!email) return false;
        return state.registrations.some(r => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());
    }

    function getRegistration(eventId, email = state.currentUserEmail) {
        if (!email) return null;
        return state.registrations.find(r => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // ════════════════════════════════════════════
    //  ROUTER
    // ════════════════════════════════════════════

    function router() {
        const hash = location.hash || '#/';
        const parts = hash.replace('#/', '').split('/');
        const page = parts[0] || 'home';
        const param = parts[1] || null;

        // Close mobile menu
        $navLinks.classList.remove('active');
        $hamburger.classList.remove('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Active nav link
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.dataset.page === (page === '' ? 'home' : page));
        });

        // Add background blobs if not present
        if (!document.querySelector('.bg-blob')) {
            const blobs = document.createElement('div');
            blobs.innerHTML = `
                <div class="bg-blob blob-1"></div>
                <div class="bg-blob blob-2"></div>
                <div class="bg-blob blob-3"></div>
            `;
            document.body.appendChild(blobs);
        }

        // Route
        switch (page) {
            case '':
            case 'home': renderHome(); break;
            case 'events': renderEvents(); break;
            case 'register': renderRegister(param); break;
            case 'my-registrations': renderMyRegistrations(); break;
            case 'admin':
                if (param === 'dashboard' && state.isAdmin) renderAdminDashboard();
                else renderAdminLogin();
                break;
            default: renderHome();
        }
    }

    // ════════════════════════════════════════════
    //  PAGE: HOME
    // ════════════════════════════════════════════

    function renderHome() {
        const featured = state.events.filter(e => e.featured);
        const upcoming = state.events.slice(0, 6);

        $app.innerHTML = `
            <!-- Hero -->
            <section class="hero">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="pulse"></span> Explore & Register for Campus Events 2026
                    </div>
                    <h1>Unleash Your Campus Life with<br><span class="gradient-text">CampusVibe</span></h1>
                    <p>Discover tech hackathons, cultural night fests, sports championships, and skill workshops. Register in seconds and track your active registrations easily.</p>
                    <div class="hero-buttons">
                        <a href="#/events" class="btn btn-primary">🚀 Explore All Events</a>
                        <a href="#/my-registrations" class="btn btn-secondary">🎟️ My Registrations</a>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <div class="num">${state.events.length}+</div>
                            <div class="label">Live Events</div>
                        </div>
                        <div class="hero-stat">
                            <div class="num">${state.registrations.length}+</div>
                            <div class="label">Registrations</div>
                        </div>
                        <div class="hero-stat">
                            <div class="num">${CATEGORIES.length - 1}</div>
                            <div class="label">Categories</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- About Section -->
            <section class="section">
                <div class="section-header">
                    <div class="section-label">✦ Why Choose CampusVibe</div>
                    <h2 class="section-title">Designed for Modern Campus Events</h2>
                    <p class="section-subtitle">Your central hub for finding events, instant single-click registration, and complete control over your event schedule.</p>
                </div>
                <div class="about-grid">
                    <div class="about-card fade-in-up">
                        <div class="icon">✨</div>
                        <h3>Floating Interactive Cards</h3>
                        <p>Visually stunning responsive event cards with real-time event details, live categories, and status indicators.</p>
                    </div>
                    <div class="about-card fade-in-up" style="animation-delay:0.1s">
                        <div class="icon">⚡</div>
                        <h3>Instant Registration</h3>
                        <p>Quick student registration process with zero hassle. Receive instant status confirmation and badge updates.</p>
                    </div>
                    <div class="about-card fade-in-up" style="animation-delay:0.2s">
                        <div class="icon">❌</div>
                        <h3>Manage & Cancel Anytime</h3>
                        <p>Want to change your mind? View your registered events list anytime and cancel registrations with 1-click confirmation.</p>
                    </div>
                    <div class="about-card fade-in-up" style="animation-delay:0.3s">
                        <div class="icon">🔐</div>
                        <h3>Admin Control Panel</h3>
                        <p>Complete management portal to add new events, update existing info, track registered students, or delete events.</p>
                    </div>
                </div>
            </section>

            <!-- Featured Event -->
            ${featured.length > 0 ? `
            <section class="section" style="padding-top:0">
                <div class="section-header">
                    <div class="section-label">⭐ Spotlight Event</div>
                    <h2 class="section-title">Featured Event of the Month</h2>
                </div>
                ${renderFeaturedEvent(featured[0])}
            </section>
            ` : ''}

            <!-- Upcoming Events Grid -->
            <section class="section" style="padding-top:0">
                <div class="section-header">
                    <div class="section-label">📅 Floating Events</div>
                    <h2 class="section-title">Explore Upcoming Events</h2>
                    <p class="section-subtitle">Browse through our curated list of upcoming college events and reserve your spot.</p>
                </div>
                <div class="events-grid">
                    ${upcoming.map((e, i) => renderEventCard(e, i)).join('')}
                </div>
                <div style="text-align:center;margin-top:48px;">
                    <a href="#/events" class="btn btn-secondary">Explore All Events →</a>
                </div>
            </section>
        `;
    }

    // ════════════════════════════════════════════
    //  PAGE: EVENTS
    // ════════════════════════════════════════════

    function renderEvents() {
        const filtered = getFilteredEvents();

        $app.innerHTML = `
            <div class="page-header">
                <h1>Explore Campus Events</h1>
                <p>Filter by category or search by event name to find what excites you</p>
            </div>
            <section class="section" style="padding-top:40px">
                <div class="search-filter-bar">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="searchInput" placeholder="Search events by name or venue..." value="${escHtml(state.searchQuery)}">
                    </div>
                    <div class="filter-group" id="filterGroup">
                        ${CATEGORIES.map(c => `
                            <button class="filter-btn ${state.filterCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>
                        `).join('')}
                    </div>
                </div>
                ${filtered.length > 0 ? `
                    <div class="events-grid">
                        ${filtered.map((e, i) => renderEventCard(e, i)).join('')}
                    </div>
                ` : `
                    <div class="no-results">
                        <div class="big-emoji">🔍</div>
                        <h3>No events found</h3>
                        <p>Try searching with a different term or clear the active category filter.</p>
                    </div>
                `}
            </section>
        `;

        // Listeners
        const sInput = document.getElementById('searchInput');
        sInput.addEventListener('input', e => {
            state.searchQuery = e.target.value;
            renderEvents();
            document.getElementById('searchInput').focus();
        });
        document.getElementById('filterGroup').addEventListener('click', e => {
            if (e.target.classList.contains('filter-btn')) {
                state.filterCategory = e.target.dataset.cat;
                renderEvents();
            }
        });
    }

    function getFilteredEvents() {
        return state.events.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                 e.venue.toLowerCase().includes(state.searchQuery.toLowerCase());
            const matchesCat = state.filterCategory === 'All' || e.category === state.filterCategory;
            return matchesSearch && matchesCat;
        });
    }

    // ════════════════════════════════════════════
    //  PAGE: REGISTER FOR EVENT
    // ════════════════════════════════════════════

    function renderRegister(eventId) {
        const event = state.events.find(e => e.id === eventId);
        if (!event) {
            $app.innerHTML = `<div class="no-results" style="margin-top:120px"><div class="big-emoji">❓</div><h3>Event not found</h3><p><a href="#/events" class="btn btn-secondary" style="margin-top:16px">← Back to Events</a></p></div>`;
            return;
        }

        const registered = isRegistered(eventId);
        const userReg = getRegistration(eventId);
        const catClass = 'img-' + event.category.toLowerCase();

        $app.innerHTML = `
            <div class="register-page">
                <a href="#/events" class="back-link">← Back to Events</a>
                <div class="register-layout">
                    <div class="register-event-info fade-in-up">
                        <div class="event-card-image ${catClass}" style="height:170px;border-radius:16px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;font-size:3.5rem">${event.emoji}</div>
                        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
                            <span class="event-card-category cat-${event.category.toLowerCase()}">${event.category}</span>
                            ${registered ? '<span class="registered-badge">✓ Registered</span>' : ''}
                        </div>
                        <h2>${escHtml(event.name)}</h2>
                        <div class="event-card-meta" style="margin-top:14px">
                            <span><span class="meta-icon">📅</span> Date: ${formatDate(event.date)}</span>
                            <span><span class="meta-icon">🕐</span> Time: ${formatTime(event.time)}</span>
                            <span><span class="meta-icon">📍</span> Venue: ${escHtml(event.venue)}</span>
                        </div>
                        <p class="desc" style="margin-top:16px">${escHtml(event.description)}</p>
                    </div>

                    <div class="register-form-card fade-in-up" style="animation-delay:0.1s">
                        ${registered ? `
                            <div style="text-align:center;padding:20px 0;">
                                <div style="font-size:3.5rem;margin-bottom:12px;">🎉</div>
                                <h2 style="color:#059669;margin-bottom:8px;">You are Registered!</h2>
                                <p style="color:var(--text-secondary);font-size:0.95rem;margin-bottom:20px;">
                                    Registered under <strong>${escHtml(userReg.email)}</strong>
                                </p>
                                <div style="background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;text-align:left;font-size:0.88rem;">
                                    <div><strong>Name:</strong> ${escHtml(userReg.name)}</div>
                                    <div><strong>College:</strong> ${escHtml(userReg.college)} (${userReg.year})</div>
                                    <div><strong>Phone:</strong> ${escHtml(userReg.phone)}</div>
                                </div>
                                <div style="display:flex;gap:12px;justify-content:center;">
                                    <button class="btn btn-danger btn-sm" id="cancelRegBtn">❌ Cancel Registration</button>
                                    <a href="#/my-registrations" class="btn btn-secondary btn-sm">🎟️ View My Registrations</a>
                                </div>
                            </div>
                        ` : `
                            <h2>📝 Event Registration Form</h2>
                            <form id="registerForm">
                                <div class="form-group">
                                    <label for="regName">Full Name *</label>
                                    <input type="text" id="regName" placeholder="Enter your full name" required>
                                    <div class="form-error">Please enter your full name</div>
                                </div>
                                <div class="form-group">
                                    <label for="regEmail">Email Address *</label>
                                    <input type="email" id="regEmail" placeholder="you@college.edu" value="${escHtml(state.currentUserEmail)}" required>
                                    <div class="form-error">Please enter a valid email address</div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="regCollege">College Name *</label>
                                        <input type="text" id="regCollege" placeholder="e.g. NIT Delhi" required>
                                        <div class="form-error">Please enter college name</div>
                                    </div>
                                    <div class="form-group">
                                        <label for="regYear">Academic Year *</label>
                                        <select id="regYear" required>
                                            <option value="">Select Year</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                            <option value="5th Year">5th Year</option>
                                            <option value="Alumni">Alumni</option>
                                        </select>
                                        <div class="form-error">Please select your year</div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="regPhone">Phone Number *</label>
                                    <input type="tel" id="regPhone" placeholder="10-digit mobile number" required>
                                    <div class="form-error">Please enter a valid 10-digit phone number</div>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px">🚀 Complete Registration</button>
                            </form>
                        `}
                    </div>
                </div>
            </div>
        `;

        if (registered) {
            document.getElementById('cancelRegBtn').addEventListener('click', () => {
                showCancelModal(userReg.id, event.name);
            });
        } else {
            document.getElementById('registerForm').addEventListener('submit', e => {
                e.preventDefault();
                handleRegistration(eventId);
            });
        }
    }

    function handleRegistration(eventId) {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const college = document.getElementById('regCollege').value.trim();
        const year = document.getElementById('regYear').value;
        const phone = document.getElementById('regPhone').value.trim();

        let valid = true;
        if (!name) { setError('regName'); valid = false; } else clearError('regName');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('regEmail'); valid = false; } else clearError('regEmail');
        if (!college) { setError('regCollege'); valid = false; } else clearError('regCollege');
        if (!year) { setError('regYear'); valid = false; } else clearError('regYear');
        if (!phone || !/^\d{10}$/.test(phone)) { setError('regPhone'); valid = false; } else clearError('regPhone');

        if (!valid) return;

        // Duplicate check
        const dup = state.registrations.find(r => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());
        if (dup) {
            showToast('You have already registered for this event with this email!', 'error');
            return;
        }

        const reg = {
            id: genId('reg'),
            eventId,
            name,
            email,
            college,
            year,
            phone,
            registeredAt: new Date().toISOString()
        };

        state.registrations.push(reg);
        state.currentUserEmail = email;
        saveData();

        showToast('🎉 Registration successful! Saved to My Registrations.', 'success');
        renderRegister(eventId);
    }

    function setError(id) { document.getElementById(id).closest('.form-group').classList.add('error'); }
    function clearError(id) { document.getElementById(id).closest('.form-group').classList.remove('error'); }

    // ════════════════════════════════════════════
    //  PAGE: MY REGISTRATIONS & CANCEL OPTION
    // ════════════════════════════════════════════

    function renderMyRegistrations() {
        const userRegs = state.currentUserEmail
            ? state.registrations.filter(r => r.email.toLowerCase() === state.currentUserEmail.toLowerCase())
            : [];

        $app.innerHTML = `
            <div class="my-regs-page">
                <div class="page-header" style="padding:40px 0;background:none;border:none">
                    <h1>🎟️ My Registered Events</h1>
                    <p>Track all events you have registered for and manage your participation</p>
                </div>

                <div class="my-regs-card">
                    <div style="font-weight:700;font-size:1rem;margin-bottom:12px;color:var(--text-primary);">
                        Enter or change your email to look up registered events:
                    </div>
                    <div class="user-lookup-bar">
                        <input type="email" id="userEmailInput" class="form-group" style="padding:12px 18px;border-radius:var(--radius-full);border:1.5px solid var(--border-subtle);flex:1;" placeholder="Enter your registered email..." value="${escHtml(state.currentUserEmail)}">
                        <button class="btn btn-primary btn-sm" id="lookupBtn">Look Up</button>
                    </div>

                    ${userRegs.length > 0 ? `
                        <div style="margin-top:30px;">
                            <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:20px;">You are registered for ${userRegs.length} event(s):</h3>
                            ${userRegs.map(reg => {
                                const event = state.events.find(e => e.id === reg.eventId);
                                if (!event) return '';
                                return `
                                    <div class="user-reg-item fade-in-up">
                                        <div class="user-reg-info">
                                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                                                <span style="font-size:1.6rem">${event.emoji}</span>
                                                <h4>${escHtml(event.name)}</h4>
                                                <span class="event-card-category cat-${event.category.toLowerCase()}">${event.category}</span>
                                            </div>
                                            <div class="user-reg-details">
                                                <span>📅 ${formatDate(event.date)} at ${formatTime(event.time)}</span>
                                                <span>📍 ${escHtml(event.venue)}</span>
                                                <span>👤 ${escHtml(reg.name)} (${reg.year})</span>
                                            </div>
                                        </div>
                                        <div>
                                            <button class="btn btn-danger btn-sm" data-cancel-reg="${reg.id}" data-event-name="${escHtml(event.name)}">
                                                ❌ Cancel Registration
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="no-results" style="box-shadow:none;border:none;padding:40px 0;">
                            <div class="big-emoji">🎟️</div>
                            <h3>${state.currentUserEmail ? 'No registered events found for this email' : 'Please enter your email to view registrations'}</h3>
                            <p>Browse events and register to see them listed here!</p>
                            <a href="#/events" class="btn btn-primary" style="margin-top:20px;">Explore Events →</a>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Email lookup handler
        document.getElementById('lookupBtn').addEventListener('click', () => {
            const email = document.getElementById('userEmailInput').value.trim();
            if (email) {
                state.currentUserEmail = email;
                saveData();
                renderMyRegistrations();
                showToast(`Loaded registrations for ${email}`, 'info');
            }
        });

        // Cancel buttons
        document.querySelectorAll('[data-cancel-reg]').forEach(btn => {
            btn.addEventListener('click', e => {
                const regId = e.currentTarget.dataset.cancelReg;
                const eventName = e.currentTarget.dataset.eventName;
                showCancelModal(regId, eventName);
            });
        });
    }

    function showCancelModal(regId, eventName) {
        $modal.innerHTML = `
            <div class="modal-header">
                <h2>❌ Cancel Registration</h2>
                <button class="modal-close" onclick="document.getElementById('modalOverlay').classList.remove('active')">✕</button>
            </div>
            <p class="confirm-text">Are you sure you want to cancel your registration for <strong>"${escHtml(eventName)}"</strong>?</p>
            <p style="color:var(--text-muted);font-size:0.88rem;margin-top:8px;">This will remove your spot from the event roster.</p>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modalOverlay').classList.remove('active')">Keep Registration</button>
                <button class="btn btn-danger btn-sm" id="confirmCancelRegBtn">Yes, Cancel Registration</button>
            </div>
        `;

        $modalOverlay.classList.add('active');

        document.getElementById('confirmCancelRegBtn').addEventListener('click', () => {
            state.registrations = state.registrations.filter(r => r.id !== regId);
            saveData();
            closeModal();
            showToast('Registration cancelled successfully', 'info');
            router();
        });
    }

    // ════════════════════════════════════════════
    //  PAGE: ADMIN LOGIN
    // ════════════════════════════════════════════

    function renderAdminLogin() {
        if (state.isAdmin) { location.hash = '#/admin/dashboard'; return; }

        $app.innerHTML = `
            <div class="admin-login-page">
                <div class="admin-login-card fade-in-up">
                    <div class="login-icon">🔐</div>
                    <h2>Admin Portal</h2>
                    <p class="subtitle">Sign in to add, edit, or delete events & registrations</p>
                    <form id="adminLoginForm">
                        <div class="form-group">
                            <label for="adminUser">Username</label>
                            <input type="text" id="adminUser" placeholder="Enter username" required>
                        </div>
                        <div class="form-group">
                            <label for="adminPass">Password</label>
                            <input type="password" id="adminPass" placeholder="Enter password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px">Sign In to Dashboard →</button>
                    </form>
                    <p style="margin-top:22px;font-size:0.85rem;color:var(--text-muted)">Default Admin Credentials: <strong>admin / admin123</strong></p>
                </div>
            </div>
        `;

        document.getElementById('adminLoginForm').addEventListener('submit', e => {
            e.preventDefault();
            const u = document.getElementById('adminUser').value.trim();
            const p = document.getElementById('adminPass').value;
            if (u === ADMIN.username && p === ADMIN.password) {
                state.isAdmin = true;
                sessionStorage.setItem(STORAGE_KEYS.admin, 'true');
                showToast('✅ Logged in as Admin', 'success');
                location.hash = '#/admin/dashboard';
            } else {
                showToast('❌ Invalid Username or Password', 'error');
            }
        });
    }

    // ════════════════════════════════════════════
    //  PAGE: ADMIN DASHBOARD
    // ════════════════════════════════════════════

    function renderAdminDashboard() {
        if (!state.isAdmin) { location.hash = '#/admin'; return; }

        const totalEvents = state.events.length;
        const totalRegs = state.registrations.length;
        const totalCats = [...new Set(state.events.map(e => e.category))].length;
        const featuredCount = state.events.filter(e => e.featured).length;

        $app.innerHTML = `
            <div class="admin-dashboard">
                <div class="admin-top-bar">
                    <h1>📊 Event Management Console</h1>
                    <div style="display:flex;gap:12px">
                        <a href="#/" class="btn btn-secondary btn-sm">🏠 View Site</a>
                        <button class="btn btn-danger btn-sm" id="logoutBtn">🚪 Logout Admin</button>
                    </div>
                </div>

                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-icon" style="background:#eef2ff;color:#4f46e5">📅</div>
                        <div>
                            <div class="stat-value">${totalEvents}</div>
                            <div class="stat-label">Total Events</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background:#ecfdf5;color:#059669">👥</div>
                        <div>
                            <div class="stat-value">${totalRegs}</div>
                            <div class="stat-label">Registrations</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background:#fef3c7;color:#d97706">📂</div>
                        <div>
                            <div class="stat-value">${totalCats}</div>
                            <div class="stat-label">Categories</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background:#fff1f2;color:#e11d48">⭐</div>
                        <div>
                            <div class="stat-value">${featuredCount}</div>
                            <div class="stat-label">Featured</div>
                        </div>
                    </div>
                </div>

                <div class="admin-tabs" id="adminTabs">
                    <button class="admin-tab ${state.adminTab === 'events' ? 'active' : ''}" data-tab="events">📅 Events</button>
                    <button class="admin-tab ${state.adminTab === 'registrations' ? 'active' : ''}" data-tab="registrations">👥 Student Registrations</button>
                </div>

                <div id="adminContent"></div>
            </div>
        `;

        document.getElementById('adminTabs').addEventListener('click', e => {
            if (e.target.classList.contains('admin-tab')) {
                state.adminTab = e.target.dataset.tab;
                renderAdminDashboard();
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            state.isAdmin = false;
            sessionStorage.removeItem(STORAGE_KEYS.admin);
            showToast('Logged out of Admin Portal', 'info');
            location.hash = '#/admin';
        });

        if (state.adminTab === 'events') renderAdminEvents();
        else renderAdminRegistrations();
    }

    // ── Admin: Events Tab ──
    function renderAdminEvents() {
        const $content = document.getElementById('adminContent');
        $content.innerHTML = `
            <div class="admin-table-wrapper fade-in">
                <div class="admin-table-toolbar">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="adminEventSearch" placeholder="Search events..." value="${escHtml(state.adminSearch)}">
                    </div>
                    <button class="btn btn-primary btn-sm" id="addEventBtn">➕ Add New Event</button>
                </div>
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Category</th>
                                <th>Date & Time</th>
                                <th>Venue</th>
                                <th>Registrations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getAdminFilteredEvents().map(e => {
                                const regCount = state.registrations.filter(r => r.eventId === e.id).length;
                                return `
                                <tr>
                                    <td style="color:var(--text-primary);font-weight:700">
                                        ${e.emoji} ${escHtml(e.name)}
                                        ${e.featured ? '<span class="featured-badge" style="margin-left:6px">⭐ Featured</span>' : ''}
                                    </td>
                                    <td><span class="event-card-category cat-${e.category.toLowerCase()}">${e.category}</span></td>
                                    <td>${formatDate(e.date)} at ${formatTime(e.time)}</td>
                                    <td>${escHtml(e.venue)}</td>
                                    <td style="color:#2563eb;font-weight:800">${regCount} student(s)</td>
                                    <td>
                                        <div class="actions">
                                            <button class="btn-icon" title="Edit Event" data-edit="${e.id}">✏️</button>
                                            <button class="btn-icon" title="Delete Event" data-delete="${e.id}" style="color:var(--accent-rose)">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                ${getAdminFilteredEvents().length === 0 ? '<div class="no-results" style="padding:40px;box-shadow:none;border:none;"><h3>No matching events found</h3></div>' : ''}
            </div>
        `;

        document.getElementById('adminEventSearch').addEventListener('input', e => {
            state.adminSearch = e.target.value;
            renderAdminEvents();
            document.getElementById('adminEventSearch').focus();
        });

        document.getElementById('addEventBtn').addEventListener('click', () => showEventModal());

        $content.addEventListener('click', e => {
            const editId = e.target.closest('[data-edit]')?.dataset.edit;
            const deleteId = e.target.closest('[data-delete]')?.dataset.delete;
            if (editId) showEventModal(editId);
            if (deleteId) showDeleteConfirm(deleteId);
        });
    }

    function getAdminFilteredEvents() {
        return state.events.filter(e => e.name.toLowerCase().includes(state.adminSearch.toLowerCase()));
    }

    // ── Admin: Registrations Tab ──
    function renderAdminRegistrations() {
        const $content = document.getElementById('adminContent');
        const regs = getAdminFilteredRegistrations();

        $content.innerHTML = `
            <div class="admin-table-wrapper fade-in">
                <div class="admin-table-toolbar">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="adminRegSearch" placeholder="Search student name, email or event..." value="${escHtml(state.adminSearch)}">
                    </div>
                    <span style="color:var(--text-muted);font-weight:600;font-size:0.9rem">${regs.length} student registration(s)</span>
                </div>
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Event</th>
                                <th>Email</th>
                                <th>College & Year</th>
                                <th>Phone</th>
                                <th>Registered Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${regs.map(r => {
                                const event = state.events.find(e => e.id === r.eventId);
                                return `
                                <tr>
                                    <td style="font-weight:700;color:var(--text-primary);">${escHtml(r.name)}</td>
                                    <td style="font-weight:600;color:#4f46e5;">${event ? escHtml(event.name) : 'Unknown Event'}</td>
                                    <td>${escHtml(r.email)}</td>
                                    <td>${escHtml(r.college)} (${r.year})</td>
                                    <td>${r.phone}</td>
                                    <td>${new Date(r.registeredAt).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" style="padding:4px 10px;font-size:0.75rem;" data-admin-cancel-reg="${r.id}" data-student="${escHtml(r.name)}">
                                            Cancel Reg
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ${regs.length === 0 ? `
                    <div class="no-results" style="padding:40px;box-shadow:none;border:none;">
                        <div class="big-emoji">📋</div>
                        <h3>No registrations found</h3>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('adminRegSearch').addEventListener('input', e => {
            state.adminSearch = e.target.value;
            renderAdminRegistrations();
            document.getElementById('adminRegSearch').focus();
        });

        $content.querySelectorAll('[data-admin-cancel-reg]').forEach(btn => {
            btn.addEventListener('click', e => {
                const regId = e.currentTarget.dataset.adminCancelReg;
                const student = e.currentTarget.dataset.student;
                if (confirm(`Remove registration for ${student}?`)) {
                    state.registrations = state.registrations.filter(r => r.id !== regId);
                    saveData();
                    showToast(`Registration for ${student} removed`, 'info');
                    renderAdminDashboard();
                }
            });
        });
    }

    function getAdminFilteredRegistrations() {
        const q = state.adminSearch.toLowerCase();
        return state.registrations.filter(r => {
            const event = state.events.find(e => e.id === r.eventId);
            return r.name.toLowerCase().includes(q) ||
                   r.email.toLowerCase().includes(q) ||
                   (event && event.name.toLowerCase().includes(q));
        });
    }

    // ════════════════════════════════════════════
    //  EVENT MODAL (CREATE / EDIT)
    // ════════════════════════════════════════════

    function showEventModal(editId) {
        const event = editId ? state.events.find(e => e.id === editId) : null;
        const isEdit = !!event;

        $modal.innerHTML = `
            <div class="modal-header">
                <h2>${isEdit ? '✏️ Edit Event' : '➕ Create New Event'}</h2>
                <button class="modal-close" onclick="document.getElementById('modalOverlay').classList.remove('active')">✕</button>
            </div>
            <form id="eventForm">
                <div class="form-group">
                    <label>Event Name *</label>
                    <input type="text" id="evtName" placeholder="e.g. Hackathon 2026" value="${isEdit ? escHtml(event.name) : ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date *</label>
                        <input type="date" id="evtDate" value="${isEdit ? event.date : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Time *</label>
                        <input type="time" id="evtTime" value="${isEdit ? event.time : ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Venue *</label>
                    <input type="text" id="evtVenue" placeholder="e.g. Main Auditorium" value="${isEdit ? escHtml(event.venue) : ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category *</label>
                        <select id="evtCategory" required>
                            ${CATEGORIES.filter(c => c !== 'All').map(c => `
                                <option value="${c}" ${isEdit && event.category === c ? 'selected' : ''}>${c}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Emoji Icon</label>
                        <input type="text" id="evtEmoji" placeholder="e.g. 💻" value="${isEdit ? event.emoji : '🎉'}" maxlength="4">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description *</label>
                    <textarea id="evtDesc" placeholder="Write full details about the event..." required>${isEdit ? escHtml(event.description) : ''}</textarea>
                </div>
                <div class="form-group" style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                    <input type="checkbox" id="evtFeatured" ${isEdit && event.featured ? 'checked' : ''} style="width:18px;height:18px;accent-color:#4f46e5;">
                    <label for="evtFeatured" style="margin:0;cursor:pointer;font-weight:600;">Highlight as Featured Event</label>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('modalOverlay').classList.remove('active')">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Save Changes' : 'Publish Event'}</button>
                </div>
            </form>
        `;

        $modalOverlay.classList.add('active');

        document.getElementById('eventForm').addEventListener('submit', e => {
            e.preventDefault();
            const data = {
                name: document.getElementById('evtName').value.trim(),
                date: document.getElementById('evtDate').value,
                time: document.getElementById('evtTime').value,
                venue: document.getElementById('evtVenue').value.trim(),
                category: document.getElementById('evtCategory').value,
                emoji: document.getElementById('evtEmoji').value || '🎉',
                description: document.getElementById('evtDesc').value.trim(),
                featured: document.getElementById('evtFeatured').checked
            };

            if (!data.name || !data.date || !data.time || !data.venue || !data.description) {
                showToast('Please complete all required fields', 'error');
                return;
            }

            if (isEdit) {
                Object.assign(event, data);
                showToast('✅ Event updated successfully', 'success');
            } else {
                data.id = genId('evt');
                state.events.unshift(data);
                showToast('🎉 New Event Published!', 'success');
            }

            saveData();
            closeModal();
            renderAdminDashboard();
        });
    }

    function showDeleteConfirm(eventId) {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;
        const regCount = state.registrations.filter(r => r.eventId === eventId).length;

        $modal.innerHTML = `
            <div class="modal-header">
                <h2>⚠️ Delete Event</h2>
                <button class="modal-close" onclick="document.getElementById('modalOverlay').classList.remove('active')">✕</button>
            </div>
            <p class="confirm-text">Are you sure you want to permanently delete <strong>"${escHtml(event.name)}"</strong>?</p>
            ${regCount > 0 ? `<p style="color:var(--accent-rose);font-weight:700;margin-top:10px;">⚠️ This will also remove ${regCount} registered student(s).</p>` : ''}
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('modalOverlay').classList.remove('active')">Cancel</button>
                <button class="btn btn-danger btn-sm" id="confirmDeleteBtn">Delete Event</button>
            </div>
        `;

        $modalOverlay.classList.add('active');

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            state.events = state.events.filter(e => e.id !== eventId);
            state.registrations = state.registrations.filter(r => r.eventId !== eventId);
            saveData();
            closeModal();
            showToast('🗑️ Event deleted', 'info');
            renderAdminDashboard();
        });
    }

    function closeModal() { $modalOverlay.classList.remove('active'); }

    // ════════════════════════════════════════════
    //  EVENT CARD RENDERERS
    // ════════════════════════════════════════════

    function renderEventCard(event, index) {
        const registered = isRegistered(event.id);
        const catClass = 'cat-' + event.category.toLowerCase();
        const imgClass = 'img-' + event.category.toLowerCase();

        return `
            <div class="event-card" style="animation-delay:${(index % 6) * 0.15}s">
                <div class="event-card-image ${imgClass}">${event.emoji}</div>
                <div class="event-card-body">
                    <div class="event-card-header">
                        <span class="event-card-category ${catClass}">${event.category}</span>
                        ${registered ? '<span class="registered-badge">✓ Registered</span>' : (event.featured ? '<span class="featured-badge">⭐ Featured</span>' : '')}
                    </div>
                    <h3>${escHtml(event.name)}</h3>
                    <div class="event-card-meta">
                        <span><span class="meta-icon">📅</span> ${formatDate(event.date)} at ${formatTime(event.time)}</span>
                        <span><span class="meta-icon">📍</span> ${escHtml(event.venue)}</span>
                    </div>
                    <p class="event-card-desc">${escHtml(event.description)}</p>
                    <div class="event-card-footer">
                        <a href="#/register/${event.id}" class="btn ${registered ? 'btn-secondary' : 'btn-primary'} btn-sm" style="width:100%">
                            ${registered ? '✓ Registered (Manage)' : 'Register Now →'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderFeaturedEvent(event) {
        const registered = isRegistered(event.id);
        const catClass = 'cat-' + event.category.toLowerCase();
        const imgClass = 'img-' + event.category.toLowerCase();

        return `
            <div class="featured-event fade-in-up">
                <div class="featured-event-image ${imgClass}">${event.emoji}</div>
                <div class="featured-event-body">
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
                        <span class="event-card-category ${catClass}">${event.category}</span>
                        <span class="featured-badge">⭐ Featured Event</span>
                        ${registered ? '<span class="registered-badge">✓ Registered</span>' : ''}
                    </div>
                    <h3>${escHtml(event.name)}</h3>
                    <div class="event-card-meta">
                        <span><span class="meta-icon">📅</span> ${formatDate(event.date)} at ${formatTime(event.time)}</span>
                        <span><span class="meta-icon">📍</span> ${escHtml(event.venue)}</span>
                    </div>
                    <p class="event-card-desc">${escHtml(event.description)}</p>
                    <div>
                        <a href="#/register/${event.id}" class="btn ${registered ? 'btn-secondary' : 'btn-primary'}">
                            ${registered ? '✓ Manage Registration' : 'Register Now →'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // ════════════════════════════════════════════
    //  UTILITIES
    // ════════════════════════════════════════════

    function escHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    function showToast(message, type = 'info') {
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${icons[type] || ''}</span> <div>${message}</div>`;
        $toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3600);
    }

    // ════════════════════════════════════════════
    //  EVENT LISTENERS
    // ════════════════════════════════════════════

    $hamburger.addEventListener('click', () => {
        $hamburger.classList.toggle('active');
        $navLinks.classList.toggle('active');
    });

    $navLinks.addEventListener('click', e => {
        if (e.target.classList.contains('nav-link')) {
            $hamburger.classList.remove('active');
            $navLinks.classList.remove('active');
        }
    });

    window.addEventListener('scroll', () => {
        $navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    $modalOverlay.addEventListener('click', e => {
        if (e.target === $modalOverlay) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    window.addEventListener('hashchange', router);

    // ════════════════════════════════════════════
    //  INIT
    // ════════════════════════════════════════════

    function init() {
        loadData();
        if (!location.hash || location.hash === '#') location.hash = '#/';
        router();
    }

    init();
})();
