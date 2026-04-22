/**
 * Unlocking Chem-mystery SPA Logic
 * Dynamic GitHub Issue Fetching, Robust Markdown Parsing, & Automated Home Slider
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

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (navScrollArea && window.innerWidth <= 768) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }

            tabContents.forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });

            const targetSection = document.getElementById(targetId);
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');

            const animatedElements = targetSection.querySelectorAll('.enter-anim-up, .stagger-anim, .text-reveal');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                void el.offsetWidth; 
                el.style.animation = null; 
            });

            if (targetSection.querySelector('.premium-loader')) {
                loadDynamicContent(targetId);
            }
        });
    });

    // --- GitHub API & Data Parsing ---
    function parseMarkdown(body) {
        // Premium reliable fallback image
        const fallbackImg = 'https://placehold.co/600x400/e0f2fe/0ea5e9?text=No+Image+Provided';
        
        if (!body) return { image: fallbackImg, text: 'Details coming soon.' };
        
        let imageUrl = fallbackImg;
        let textContent = body;

        // 1. Catch Standard Markdown images: ![alt text](https://...)
        const mdImgRegex = /!\[.*?\]\((.*?)\)/;
        
        // 2. Catch HTML images (GitHub often defaults to this now): <img src="https://..." >
        const htmlImgRegex = /<img[^>]+src=["'](.*?)["']/i;
        
        // 3. Catch raw pasted image URLs just in case
        const rawUrlRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp))/i;

        // Extract the image and remove it from the text body
        if (mdImgRegex.test(body)) {
            imageUrl = body.match(mdImgRegex)[1];
            textContent = body.replace(mdImgRegex, '');
        } else if (htmlImgRegex.test(body)) {
            imageUrl = body.match(htmlImgRegex)[1];
            textContent = body.replace(htmlImgRegex, '');
        } else if (rawUrlRegex.test(body)) {
            imageUrl = body.match(rawUrlRegex)[1];
            textContent = body.replace(rawUrlRegex, '');
        }
        
        // Clean up GitHub Issue Form auto-headings (e.g., "### Description")
        textContent = textContent.replace(/### .*\n/g, '');
        
        // Clean up excessive spacing and convert newlines to HTML breaks
        textContent = textContent.trim().replace(/\n{2,}/g, '\n').replace(/\n/g, '<br>');

        return { image: imageUrl, text: textContent };
    }

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

    // --- Home Course Slider Logic ---
    async function initHomeSlider() {
        const track = document.getElementById('course-slider-track');
        const dotsContainer = document.getElementById('course-slider-dots');
        
        if (!track || !dotsContainer) return;

        const issues = await fetchFromGitHub('course');
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (!issues || issues.length === 0) {
            track.innerHTML = `<div style="width:100%; text-align:center; padding: 4rem; color: var(--text-muted);">No featured courses available.</div>`;
            return;
        }

        issues.forEach((issue, index) => {
            const { image } = parseMarkdown(issue.body);
            
            // Build slide
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            slide.innerHTML = `
                <img src="${image}" alt="${issue.title}" class="slider-img" loading="lazy">
                <div class="slider-overlay"></div>
            `;
            track.appendChild(slide);

            // Build dot
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        let currentIndex = 0;
        const totalSlides = issues.length;
        let slideInterval;

        function updateSlider() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            document.querySelectorAll('.dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            resetInterval();
        }

        function startInterval() {
            slideInterval = setInterval(nextSlide, 3000); // 3 seconds auto-slide
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }

        document.querySelector('.next-btn')?.addEventListener('click', () => { nextSlide(); resetInterval(); });
        document.querySelector('.prev-btn')?.addEventListener('click', () => { prevSlide(); resetInterval(); });

        startInterval();
    }

    // --- Dynamic Rendering ---
    async function loadDynamicContent(tabName) {
        const gridId = `${tabName}-grid`;
        const gridElement = document.getElementById(gridId);
        
        const labelMap = {
            'teachers': 'teacher',
            'courses': 'course',
            'gallery': 'gallery',
            'branch': 'branch'
        };

        const label = labelMap[tabName];
        if (!label) return;

        const issues = await fetchFromGitHub(label);
        gridElement.innerHTML = ''; 

        if (!issues || issues.length === 0) {
            gridElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted); background: var(--glass-bg); border-radius: 24px; border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5; color: var(--accent);"></i>
                    <p style="font-weight: 500; font-size: 1.1rem;">Premium content arriving soon...</p>
                </div>`;
            return;
        }

        issues.forEach((issue, index) => {
            const { image, text } = parseMarkdown(issue.body);
            const delayClass = `delay-${(index % 3) + 1}`; 
            let cardHTML = '';

            if (tabName === 'gallery') {
                cardHTML = `
                    <div class="glass-box gallery-img-wrapper stagger-anim ${delayClass}">
                        <img src="${image}" alt="${issue.title}" class="gallery-img" loading="lazy">
                    </div>
                `;
            } else {
                let actionButton = '';
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

            gridElement.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // --- Initialization ---
    // Initialize Home slider immediately
    initHomeSlider();

    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const activeTabId = activeTab.getAttribute('data-tab');
        const activeSection = document.getElementById(activeTabId);
        if (activeSection && activeSection.querySelector('.premium-loader')) {
            loadDynamicContent(activeTabId);
        }
    }
});
            
