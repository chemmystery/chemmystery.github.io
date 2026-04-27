document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Navigation Logic
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const tabSections = document.querySelectorAll('.tab-section');

    function switchTab(targetId) {
        // Remove active class from all
        navItems.forEach(item => item.classList.remove('active'));
        tabSections.forEach(sec => sec.classList.remove('active'));

        // Add active class to target
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        const targetSection = document.getElementById(targetId);

        if (targetNav) targetNav.classList.add('active');
        if (targetSection) targetSection.classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                switchTab(targetId);
            }
        });
    });

    // Set initial active tab
    const initialNav = document.querySelector('.nav-item[data-target="home"]');
    if (initialNav) initialNav.classList.add('active');

    // Drag to scroll for bottom nav
    const navScroller = document.querySelector('.nav-scroller');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (navScroller) {
        navScroller.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - navScroller.offsetLeft;
            scrollLeft = navScroller.scrollLeft;
        });
        navScroller.addEventListener('mouseleave', () => { isDown = false; });
        navScroller.addEventListener('mouseup', () => { isDown = false; });
        navScroller.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - navScroller.offsetLeft;
            const walk = (x - startX) * 2;
            navScroller.scrollLeft = scrollLeft - walk;
        });
    }

    // 2. GitHub Issues API Fetching
    const repoUrl = 'https://api.github.com/repos/chemmystery/chemmystery.github.io/issues?state=all&per_page=100';
    let coursesData = [];

    async function fetchGitHubData() {
        try {
            const response = await fetch(repoUrl);
            if (!response.ok) throw new Error('Failed to fetch data');
            const issues = await response.json();

            // Process issues by labels
            processCourses(issues.filter(issue => issue.labels.some(l => l.name === 'course' || l.name === 'Course')));
            processTeachers(issues.filter(issue => issue.labels.some(l => l.name === 'teacher' || l.name === 'Teacher')));
            processBranch(issues.filter(issue => issue.labels.some(l => l.name === 'branch' || l.name === 'Branch')));
            processGallery(issues.filter(issue => issue.labels.some(l => l.name === 'gallery' || l.name === 'Gallery')));
            processAbout(issues.find(issue => issue.labels.some(l => l.name === 'about' || l.name === 'About')));
            
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            document.querySelectorAll('.loader').forEach(loader => {
                loader.textContent = 'Failed to load content. Please try again later.';
            });
        }
    }

    function extractImagesFromMarkdown(markdown) {
        const parsedHtml = marked.parse(markdown || '');
        const parser = new DOMParser();
        const doc = parser.parseFromString(parsedHtml, 'text/html');
        const imgs = Array.from(doc.querySelectorAll('img')).map(img => img.src);
        return imgs;
    }

    function extractTextFromMarkdown(markdown) {
        const parsedHtml = marked.parse(markdown || '');
        const parser = new DOMParser();
        const doc = parser.parseFromString(parsedHtml, 'text/html');
        // Remove images to get pure text content
        const images = doc.querySelectorAll('img');
        images.forEach(img => img.remove());
        return doc.body.innerHTML;
    }

    // Process Courses
    function processCourses(issues) {
        const coursesList = document.getElementById('coursesList');
        const sliderTrack = document.getElementById('sliderTrack');
        coursesList.innerHTML = '';
        sliderTrack.innerHTML = '';
        
        if (issues.length === 0) {
            coursesList.innerHTML = '<p>No courses found.</p>';
            sliderTrack.innerHTML = '<div class="slider-placeholder">No courses available</div>';
            return;
        }

        issues.forEach((issue, index) => {
            const images = extractImagesFromMarkdown(issue.body);
            const imageSrc = images.length > 0 ? images[0] : 'https://via.placeholder.com/800x450/e0e0e0/000000?text=Course';
            const encodedMessage = encodeURIComponent(`Hi, I'm interested in the course: ${issue.title}. Could you provide more details?`);
            
            // Add to Courses Page
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <img src="${imageSrc}" alt="${issue.title}" class="course-image">
                <div class="course-content-wrapper">
                    <div class="course-title">${issue.title}</div>
                    <a href="https://wa.me/918617630500?text=${encodedMessage}" target="_blank" class="enquire-btn">
                        <i class="fab fa-whatsapp"></i> Enquire Now
                    </a>
                </div>
            `;
            coursesList.appendChild(card);

            // Add to Slider
            const slide = document.createElement('div');
            slide.className = 'slider-item';
            slide.innerHTML = `<img src="${imageSrc}" alt="${issue.title}">`;
            slide.addEventListener('click', () => switchTab('courses'));
            sliderTrack.appendChild(slide);
            
            coursesData.push({ title: issue.title, image: imageSrc });
        });

        // Initialize Slider
        initSlider(issues.length);
    }

    // Process Teachers
    function processTeachers(issues) {
        const teachersList = document.getElementById('otherTeachersList');
        teachersList.innerHTML = '';
        
        issues.forEach(issue => {
            const images = extractImagesFromMarkdown(issue.body);
            const imageSrc = images.length > 0 ? images[0] : 'https://via.placeholder.com/150x150/e0e0e0/000000?text=Teacher';
            
            // Extract text but remove the image part for cleaner output
            let pureHtml = extractTextFromMarkdown(issue.body);
            
            const card = document.createElement('div');
            card.className = 'teacher-card glass-box';
            card.innerHTML = `
                <img src="${imageSrc}" alt="${issue.title}" class="teacher-img">
                <div class="teacher-info">
                    <h3>${issue.title}</h3>
                    <div class="teacher-qualifications">
                        ${pureHtml}
                    </div>
                </div>
            `;
            teachersList.appendChild(card);
        });
    }

    // Process Branch
    function processBranch(issues) {
        const branchList = document.getElementById('branchList');
        if (!branchList) return;
        branchList.innerHTML = '';
        
        if (issues.length === 0) {
            branchList.innerHTML = '<p>No branches found.</p>';
            return;
        }

        issues.forEach(issue => {
            const images = extractImagesFromMarkdown(issue.body);
            const imageSrc = images.length > 0 ? images[0] : 'https://via.placeholder.com/600x400/e0e0e0/000000?text=Branch';
            
            // Extract text but remove the image part for cleaner output
            let pureHtml = extractTextFromMarkdown(issue.body);
            
            const card = document.createElement('div');
            card.className = 'branch-card';
            card.innerHTML = `
                <img src="${imageSrc}" alt="${issue.title}" class="branch-image">
                <div class="branch-content">
                    <div class="branch-title">${issue.title}</div>
                    <div class="branch-address">${pureHtml}</div>
                </div>
            `;
            branchList.appendChild(card);
        });
    }

    // Process Gallery
    function processGallery(issues) {
        const galleryList = document.getElementById('galleryList');
        galleryList.innerHTML = '';
        
        let hasImages = false;
        issues.forEach(issue => {
            const images = extractImagesFromMarkdown(issue.body);
            images.forEach(imgSrc => {
                hasImages = true;
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `<img src="${imgSrc}" alt="Gallery Image">`;
                galleryList.appendChild(item);
            });
        });

        if (!hasImages) {
            galleryList.innerHTML = '<p>No gallery images found.</p>';
        }
    }

    // Process About
    function processAbout(issue) {
        const aboutContent = document.getElementById('aboutContent');
        if (!issue) {
            aboutContent.innerHTML = '<p>About us information coming soon.</p>';
            return;
        }

        const images = extractImagesFromMarkdown(issue.body);
        const imageSrc = images.length > 0 ? images[0] : '';
        
        const htmlContent = extractTextFromMarkdown(issue.body);

        let finalHtml = '';
        if (imageSrc) {
            finalHtml += `<img src="${imageSrc}" alt="About Us" class="about-img">`;
        }
        finalHtml += `<div class="about-text">${htmlContent}</div>`;
        
        aboutContent.innerHTML = finalHtml;
    }

    // 3. Slider Logic
    let currentSlide = 0;
    let sliderInterval;

    function initSlider(totalSlides) {
        if (totalSlides <= 1) return; // No need to slide
        
        const track = document.getElementById('sliderTrack');
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        // Slide every 3 seconds
        sliderInterval = setInterval(nextSlide, 3000);
    }

    // Start Fetching Data
    fetchGitHubData();
});
