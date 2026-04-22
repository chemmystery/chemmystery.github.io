/**
 * Unlocking Chem-mystery SPA Logic
 * Handles Tab Navigation, GitHub API Data Fetching, and Dynamic Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    const WHATSAPP_NUMBER = "910000000000"; // Replace with your actual WhatsApp number (include country code, no '+')
    const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/issues?state=open&labels=`;

    // --- Tab Navigation Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetSection = document.getElementById(targetId);
            
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');

            // Re-trigger animation
            const animatedElements = targetSection.querySelectorAll('.enter-anim-up, .stagger-anim');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // Trigger reflow
                el.style.animation = null; 
            });

            // Fetch data if navigating to dynamic tabs for the first time
            if (targetSection.querySelector('.loader')) {
                loadDynamicContent(targetId);
            }
        });
    });

    // --- GitHub Issues Data Fetching & Parsing ---
    
    // Helper to extract image and text from markdown body
    function parseMarkdown(body) {
        if (!body) return { image: 'https://via.placeholder.com/400x250/f8fafc/64748b?text=Image+Pending', text: 'No description provided.' };
        
        // Find markdown image ![alt](url)
        const imgRegex = /!\[.*?\]\((.*?)\)/;
        const imgMatch = body.match(imgRegex);
        const imageUrl = imgMatch ? imgMatch[1] : 'https://via.placeholder.com/400x250/f8fafc/64748b?text=Image+Pending';
        
        // Remove image syntax to get clean text
        let textContent = body.replace(imgRegex, '').trim();
        textContent = textContent.replace(/\n/g, '<br>'); // Convert newlines to HTML breaks

        return { image: imageUrl, text: textContent };
    }

    async function fetchFromGitHub(label) {
        try {
            const response = await fetch(`${GITHUB_API_URL}${label}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${label}:`, error);
            return null;
        }
    }

    // --- Dynamic Rendering Functions ---

    async function loadDynamicContent(tabName) {
        const gridId = `${tabName}-grid`;
        const gridElement = document.getElementById(gridId);
        
        // Map tab names to your GitHub issue labels
        // IMPORTANT: Create labels exactly as 'teacher', 'course', 'gallery', 'branch' in your repo
        const labelMap = {
            'teachers': 'teacher',
            'courses': 'course',
            'gallery': 'gallery',
            'branch': 'branch'
        };

        const label = labelMap[tabName];
        if (!label) return;

        const issues = await fetchFromGitHub(label);
        gridElement.innerHTML = ''; // Clear loader

        if (!issues || issues.length === 0) {
            gridElement.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Coming soon...</p>`;
            return;
        }

        issues.forEach((issue, index) => {
            const { image, text } = parseMarkdown(issue.body);
            const delayClass = `delay-${(index % 3) + 1}`; // Staggered animation delay

            let cardHTML = '';

            if (tabName === 'gallery') {
                // Gallery only renders images
                cardHTML = `
                    <div class="glass-box gallery-img-wrapper stagger-anim ${delayClass}" style="padding: 0.5rem;">
                        <img src="${image}" alt="${issue.title}" class="gallery-img">
                    </div>
                `;
            } else {
                // Teachers, Courses, Branches render full glass cards
                let actionButton = '';
                
                // Add WhatsApp button only for courses
                if (tabName === 'courses') {
                    const message = encodeURIComponent(`Hello, I am interested in the "${issue.title}" program. Could you provide more details?`);
                    actionButton = `
                        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" class="glass-btn wa-enquire-btn">
                            <i class="fa-brands fa-whatsapp"></i> Enquire Now
                        </a>
                    `;
                }

                cardHTML = `
                    <div class="glass-box feature-card stagger-anim ${delayClass}">
                        <img src="${image}" alt="${issue.title}" class="card-img">
                        <h3 class="card-title">${issue.title}</h3>
                        <p class="card-desc">${text}</p>
                        ${actionButton}
                    </div>
                `;
            }

            gridElement.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Initial load for any tabs that might be active by default (if changed in HTML)
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    if (document.getElementById(activeTab).querySelector('.loader')) {
        loadDynamicContent(activeTab);
    }
});
                        
