/**
 * Unlocking Chem-mystery SPA Logic
 * Premium Dynamic GitHub Issue Fetching, Parsing, & Smooth Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Variables GITHUB_USERNAME, GITHUB_REPO, and WHATSAPP_NUMBER are defined globally in index.html
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/issues?state=open&labels=`;

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const navScrollArea = document.querySelector('.nav-scroll-area');

    // --- Navigation Logic ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-tab');

            // 1. Update Active Button State
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Smoothly scroll the nav area on mobile to keep active tab in center
            if (navScrollArea && window.innerWidth <= 768) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }

            // 3. Switch Content Tabs
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });

            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');

            // 4. Re-trigger immersive enter animations for a premium feel
            const animatedElements = targetSection.querySelectorAll('.enter-anim-up, .stagger-anim, .text-reveal');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                void el.offsetWidth; // Force reflow
                el.style.animation = null; 
            });

            // 5. Fetch Data if it hasn't been loaded yet (indicated by the loader)
            if (targetSection.querySelector('.premium-loader')) {
                loadDynamicContent(targetId);
            }
        });
    });

    // --- GitHub API & Data Parsing ---

    // Parses markdown to separate image and cleanly remove GitHub YAML headings
    function parseMarkdown(body) {
        if (!body) return { 
            image: 'https://via.placeholder.com/600x400/e0f2fe/0f172a?text=Image+Pending', 
            text: 'Details coming soon.' 
        };
        
        // 1. Find the image URL
        const imgRegex = /!\[.*?\]\((.*?)\)/;
        const imgMatch = body.match(imgRegex);
        const imageUrl = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/600x400/e0f2fe/0ea5e9?text=No+Image+Provided';
        
        // 2. Remove the image string from the text
        let textContent = body.replace(imgRegex, '');
        
        // 3. Remove GitHub Issue Form auto-headings (e.g., "### Description")
        textContent = textContent.replace(/### .*\n/g, '');
        
        // 4. Clean up excessive spacing and convert newlines to HTML breaks
        textContent = textContent.trim().replace(/\n{2,}/g, '\n').replace(/\n/g, '<br>');

        return { image: imageUrl, text: textContent };
    }

    // Fetches issues based on label
    async function fetchFromGitHub(label) {
        try {
            const response = await fetch(`${GITHUB_API_URL}${label}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${label}:`, error);
            return null;
        }
    }

    // --- Dynamic Rendering ---

    async function loadDynamicContent(tabName) {
        const gridId = `${tabName}-grid`;
        const gridElement = document.getElementById(gridId);
        
        // Map HTML tab IDs to strictly singular GitHub Issue labels
        const labelMap = {
            'teachers': 'teacher',
            'courses': 'course',
            'gallery': 'gallery',
            'branch': 'branch'
        };

        const label = labelMap[tabName];
        if (!label) return;

        // Fetch the data
        const issues = await fetchFromGitHub(label);
        
        // Clear the loader
        gridElement.innerHTML = ''; 

        // Handle empty or error states elegantly
        if (!issues || issues.length === 0) {
            gridElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted); background: var(--glass-bg); border-radius: 24px; border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5; color: var(--accent);"></i>
                    <p style="font-weight: 500; font-size: 1.1rem;">Premium content arriving soon...</p>
                </div>`;
            return;
        }

        // Render Cards
        issues.forEach((issue, index) => {
            const { image, text } = parseMarkdown(issue.body);
            
            // Cycle through delay-1, delay-2, delay-3 for smooth staggering animations
            const delayClass = `delay-${(index % 3) + 1}`; 

            let cardHTML = '';

            if (tabName === 'gallery') {
                // Gallery: Image only, highly optimized for visuals
                cardHTML = `
                    <div class="glass-box gallery-img-wrapper stagger-anim ${delayClass}">
                        <img src="${image}" alt="${issue.title}" class="gallery-img" loading="lazy">
                    </div>
                `;
            } else {
                // Teachers, Branches, Courses: Full Proportional Cards
                let actionButton = '';
                
                // Add the WhatsApp Enquire Button ONLY for Courses
                if (tabName === 'courses') {
                    const waMessage = encodeURIComponent(`Hello, I am interested in the "${issue.title}" program at Unlocking Chem-mystery. Could you provide more details?`);
                    actionButton = `
                        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}" target="_blank" class="glass-btn wa-enquire-btn" style="margin-top: auto;">
                            <i class="fa-brands fa-whatsapp"></i> Enquire Now
                        </a>
                    `;
                }

                cardHTML = `
                    <div class="glass-box feature-card stagger-anim ${delayClass}" style="height: 100%;">
                        <img src="${image}" alt="${issue.title}" class="card-img" loading="lazy">
                        <h3 class="card-title">${issue.title}</h3>
                        <p class="card-desc">${text}</p>
                        ${actionButton}
                    </div>
                `;
            }

            // Append directly to the grid
            gridElement.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // --- Initialization ---
    // If a dynamic tab is active on initial page load, fetch its content immediately
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const activeTabId = activeTab.getAttribute('data-tab');
        const activeSection = document.getElementById(activeTabId);
        if (activeSection && activeSection.querySelector('.premium-loader')) {
            loadDynamicContent(activeTabId);
        }
    }
});
          
