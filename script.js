/**
 * script.js - SPA Logic for Urooj Khadim's Dashboard Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initSidebarToggle();
    initTheme();
    initProjectsGallery();
    initContactForm();
    initSkillsAnimationObserver();
});

// ========== 1. SPA State & Routing ==========
function initRouter() {
    // Determine initial route -> default to #dashboard
    let currentHash = window.location.hash || '#dashboard';
    
    // If somehow the hash isn't one of our sections, force #dashboard
    const validRoutes = ['#dashboard', '#about', '#skills', '#projects', '#contact'];
    if (!validRoutes.includes(currentHash)) {
        currentHash = '#dashboard';
        window.location.hash = currentHash;
    }

    // Handle initial load
    handleRoute(currentHash);

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
        let hash = window.location.hash;
        if (!validRoutes.includes(hash)) hash = '#dashboard';
        handleRoute(hash);
    });
}

function handleRoute(hash) {
    const sectionId = hash.substring(1); // Remove the '#'
    
    // 1. Hide all sections, show target section
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
        // Reset animations by forcing reflow
        sec.style.animation = 'none';
        sec.offsetHeight; /* trigger reflow */
        sec.style.animation = null; 
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 2. Update Active Links (Desktop & Mobile)
    const allLinks = document.querySelectorAll('.nav-link, .mobile-nav-item');
    allLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 3. Trigger section-specific logic
    if (sectionId === 'skills') {
        triggerSkillsAnimation();
    }

    // 4. Close mobile/tablet sidebar if open after navigation
    closeSidebar();
    
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 2. Sidebar / Mobile Menu Toggle ==========
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!sidebarToggle || !sidebar || !backdrop) return;

    // Toggle Sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });

    // Close on backdrop click
    backdrop.addEventListener('click', closeSidebar);
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar && backdrop) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========== 3. Theme Management ==========
function initTheme() {
    const toggleDesktop = document.getElementById('themeToggleDesktop');
    const toggleMobile = document.getElementById('themeToggleMobile');
    
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    const switchTheme = () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        updateThemeIcons(newTheme);
    };

    if (toggleDesktop) toggleDesktop.addEventListener('click', switchTheme);
    if (toggleMobile) toggleMobile.addEventListener('click', switchTheme);
}

function updateThemeIcons(theme) {
    const toggles = [
        document.getElementById('themeToggleDesktop'),
        document.getElementById('themeToggleMobile')
    ];
    
    toggles.forEach(btn => {
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

// ========== 4. Projects Gallery & Dashboard Featured ==========
function initProjectsGallery() {
    if (typeof projectsData === 'undefined') return;

    // A. Render Dashboard Featured Projects (First 2-3 apps)
    const featuredGrid = document.getElementById('featuredProjectsGrid');
    if (featuredGrid) {
        const featured = projectsData.slice(0, 2); // Show top 2 on dashboard
        featuredGrid.innerHTML = renderProjectCards(featured);
    }

    // B. Render Main Projects Gallery
    const grid = document.getElementById('projectsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!grid) return;

    let currentFilter = 'all';

    function renderGallery() {
        const filtered = projectsData.filter(p => {
            return currentFilter === 'all' || p.category === currentFilter;
        });
        grid.innerHTML = renderProjectCards(filtered);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            
            // Add fade animation reset
            grid.style.opacity = '0';
            setTimeout(() => {
                renderGallery();
                grid.style.opacity = '1';
                grid.style.transition = 'opacity 0.3s ease';
            }, 100);
        });
    });

    renderGallery();
}

// Helper to generate HTML for a list of projects
function renderProjectCards(projects) {
    return projects.map(p => `
        <div class="project-card">
            <div class="project-image">
                <img src="${encodeURI(p.images[0])}" alt="${p.title}" onerror="this.src='https://placehold.co/600x400/2563eb/white?text=${p.title.replace(/ /g, '+')}';">
            </div>
            <div class="project-content">
                <span class="project-category">${p.category}</span>
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <div class="tech-tags">
                    ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
                <!-- Call Modal Function -->
                <button onclick="openProjectModal('${p.id}')" class="btn btn-outline" style="width: 100%;">View Details</button>
            </div>
        </div>
    `).join('');
}

// ========== 5. Project Modal Logic ==========
window.openProjectModal = function(id) {
    if (typeof projectsData === 'undefined') return;
    
    const project = projectsData.find(p => p.id === id);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const contentBox = document.getElementById('modalContent');
    
    // Build Modal View (Simplified detail view)
    let modalHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
                <span class="project-category" style="margin-bottom: 5px; display: block;">${project.category}</span>
                <h2>${project.title}</h2>
            </div>
        </div>
        
        <img src="${encodeURI(project.images[0])}" alt="${project.title}" class="modal-project-img" onerror="this.src='https://placehold.co/800x400/2563eb/white?text=${project.title.replace(/ /g, '+')}';">
        
        <p><strong>Overview:</strong> ${project.description}</p>
        <p>${project.longDescription}</p>
        
        <h3 style="margin: 20px 0 10px;">Tech Stack</h3>
        <div class="tech-tags" style="margin-bottom: 20px;">
            ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        
        <h3 style="margin: 20px 0 10px;">Key Features</h3>
        <ul class="feature-list">
            ${project.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
        </ul>
        
        <div style="display: flex; gap: 15px; margin-top: 30px;">
            <a href="${project.liveLink}" target="_blank" class="btn btn-primary" style="flex:1;">Live Demo <i class="fas fa-external-link-alt"></i></a>
            <a href="${project.githubLink}" target="_blank" class="btn btn-outline" style="flex:1;">GitHub <i class="fab fa-github"></i></a>
        </div>
    `;

    contentBox.innerHTML = modalHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

// Close Modal logic
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeModal');
    
    if(closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// ========== 6. Skills Animation ==========
function initSkillsAnimationObserver() {
    // We trigger animations both on section load (handleRoute) and scroll (Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.getAttribute('data-width');
                fill.style.width = width;
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.progress-fill').forEach(bar => observer.observe(bar));
}

// Called explicitly when #skills route is hit
function triggerSkillsAnimation() {
    setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            // Reset to 0 then animate to target
            bar.style.transition = 'none';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.1, 0, 0.2, 1)';
                bar.style.width = width;
            }, 50);
        });
    }, 100);
}

// ========== 7. Contact Form Logic ==========
function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusDiv = document.getElementById('formStatus');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-submit');
            const originalHTML = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate API Call
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                form.reset();
                
                if (statusDiv) {
                    statusDiv.innerHTML = '<div style="color:var(--success); padding: 10px; border-radius: 8px; background: rgba(16,185,129,0.1); margin-top: 15px;"><i class="fas fa-check-circle"></i> Thanks! Your message has been sent successfully.</div>';
                    setTimeout(() => statusDiv.innerHTML = '', 5000);
                }
            }, 1500);
        });
    }

    // Copy Email Feature
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('uroojkhadim505@gmail.com');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.color = 'var(--success)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.color = '';
            }, 2000);
        });
    }
}
