(function () {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const routes = {
                '/': 'pages/home.html',
                '/home': 'pages/home.html',
                '/about': 'pages/about.html',
                '/branch': 'pages/branch.html',
                '/courses': 'pages/courses.html',
                '/courses-list': 'pages/courses-list.html',
                '/result': 'pages/result.html',
                '/news': 'pages/news.html',
                '/faq': 'pages/faq.html',
                '/chairman-message': 'pages/chairman-message.html',
                '/contact': 'pages/contact.html',
                '/affiliation-location': 'pages/affiliation-location.html',
                '/affiliation-register': 'pages/affiliation-register.html',
                '/affiliation-status': 'pages/affiliation-status.html',
            };

    const app = document.getElementById('app');
    const navLinks = Array.from(document.querySelectorAll('a[data-link]'));
    const metaDesc = document.getElementById('meta-desc');

    if (!app) {
        console.error('SPA: #app element not found. Aborting router.');
        return;
    }
    if (!navLinks.length) console.warn('SPA: no nav links found (a[data-link]) — navigation highlighting will be skipped.');
    if (!metaDesc) console.info('SPA: meta-desc not found — meta description updates will be skipped.');

    function setActiveLink(path) {
        navLinks.forEach(a => {
            try {
                const href = new URL(a.href, location.origin);
        const routePath = href.pathname || '/';
        if (routePath === path || (path === '/' && routePath === '/home')) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
        } else {
            a.classList.remove('active');
            a.removeAttribute('aria-current');
        }
    } catch (err) {
        console.debug('SPA: skipping nav link for setActiveLink', a, err);
    }
});
}

// Execute scripts found in the fragment. Supports inline and external scripts.
// container: an element containing the fragment HTML (not yet appended) OR app after injection.
function executeFragmentScripts(container) {
    const scripts = Array.from(container.querySelectorAll('script'));
    if (!scripts.length) return Promise.resolve();

    // sequential loading to preserve order (external scripts load/executed in order)
    return scripts.reduce((p, oldScript) => {
        return p.then(() => new Promise((resolve, reject) => {
            const newScript = document.createElement('script');

    // copy attrs
    for (let i = 0; i < oldScript.attributes.length; i++) {
        const a = oldScript.attributes[i];
        newScript.setAttribute(a.name, a.value);
    }

    if (oldScript.src) {
        // external script: load and wait
        newScript.src = oldScript.src;
        newScript.onload = () => resolve();
        newScript.onerror = (e) => {
            console.error('Failed to load fragment script', oldScript.src, e);
        resolve(); // resolve to continue loading other scripts
    };
    document.head.appendChild(newScript);
} else {
// inline script: execute immediately
              newScript.text = oldScript.textContent;
document.head.appendChild(newScript);
// remove immediately to avoid duplicates (not strictly necessary)
newScript.parentNode.removeChild(newScript);
resolve();
}
}));
}, Promise.resolve());
}

// Try to extract meta info from fragment.
// Prefer a safe container: <div data-title="..." data-desc="..."></div>
function applyFragmentMeta(temp) {
    const metaBox = temp.querySelector('[data-title]'); // recommended pattern
    if (metaBox) {
        const t = metaBox.getAttribute('data-title');
        const d = metaBox.getAttribute('data-desc') || '';
        if (t) document.title = t;
        if (metaDesc && d) metaDesc.setAttribute('content', d);
        return;
    }

    // fallback: look for meta tags (may be moved to head by parser, but try)
    const titleMeta = temp.querySelector('meta[data-title]');
    const descMeta = temp.querySelector('meta[data-desc]');
    if (titleMeta) document.title = titleMeta.getAttribute('data-title');
    if (descMeta && metaDesc) metaDesc.setAttribute('content', descMeta.getAttribute('data-desc') || '');
}

// init mapping: after fragment injection we call a named init function if present.
// This is the recommended pattern: fragments expose window.initX functions.
const initMap = {
    '/index.html': () => window.initHome && window.initHome(),
    '/': () => window.initHome && window.initHome(),
    '/home': () => window.initHome && window.initHome(),
    '/faq': () => window.initFaq && window.initFaq(),
    '/contact': () => window.initContact && window.initContact(),
    '/courses': () => window.initCourses && window.initCourses(),
    '/courses-list': () => window.initCoursesList && window.initCoursesList(),
    '/result': () => window.initResult && window.initResult(),
    '/affiliation-location': () => window.initAffilationLocation && window.initAffilationLocation(),
    // add more entries if you create init functions for fragments
};

async function loadRoute(path, replaceHistory) {
    const file = routes[path] || routes['/'];
    app.innerHTML = '<div class="loader">Loading...</div>';

    try {
        const res = await fetch(file, { cache: 'no-store' });
        if (!res.ok) throw new Error('Not found: ' + file);
        const html = await res.text();

        // temp container for parsing
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // update meta (reads data-title/data-desc in fragments)
        applyFragmentMeta(temp);

        // Inject visible content into app (prefer app.innerHTML = temp.innerHTML)
        app.innerHTML = temp.innerHTML;

        // Execute scripts found in the fragment (using the temp or app)
        // Use temp to read script elements as they were in fragment
        await executeFragmentScripts(temp);

        // Call optional init function if defined in initMap, else try a generic initX
        if (initMap[path]) {
            try { initMap[path](); } catch (ex) { console.warn('initMap handler error', ex); }
        } else {
            // fallback generic: e.g., for '/faq' call window.initFaq if exists
            const fallbackName = (path.replace(/^\//, '') || 'home'); // 'faq', 'contact'
            const fnName = 'init' + fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
            if (window[fnName] && typeof window[fnName] === 'function') {
                try { window[fnName](); } catch (ex) { console.warn('fragment init error', fnName, ex); }
            }
        }

        // update active link highlighting
        setActiveLink(path);
    } catch (err) {
        console.error('SPA loadRoute error:', err);
        app.innerHTML = '<div class="error">Failed to load page. Check console for details.</div>';
    }

    if (replaceHistory) history.replaceState({ path }, '', path);
    else history.pushState({ path }, '', path);
}

function onLinkClick(e) {
    const a = e.currentTarget;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    const url = new URL(a.href, location.origin);
    if (url.origin === location.origin) {
        loadRoute(url.pathname);
    } else {
        window.location.href = a.href;
    }
}

navLinks.forEach(a => a.addEventListener('click', onLinkClick));

window.addEventListener('popstate', (e) => {
    const path = (e.state && e.state.path) || location.pathname || '/';
loadRoute(path, true);
});

// Initial boot: if root, load /home
const initial = (location.pathname === '/' || location.pathname === '') ? '/home' : location.pathname;
loadRoute(initial, true);

console.info('SPA router initialized. Current path:', location.pathname);
} catch (ex) {
    console.error('SPA initialization failed:', ex);
}
});
})();


window.initHome = function () {
    try {       
        renderRandomCourses(8);
        initHomeCourseTabs();
    } catch (err) {
        console.warn("initHome error:", err);
    }
};

window.initCourses = function () {
    try {       
        initCoursesPage();
    } catch (err) {
        console.warn("initCourse error:", err);
    }
};

window.initCoursesList = function () {
    try {       
        renderCourseTableList('couselist');
    } catch (err) {
        console.warn("initCoursesList error:", err);
    }
};

window.initAffilationLocation = function () {
    try {
        initAffilationLocationFinal();
    } catch (err) {
        console.warn("initAffilationLocation error:", err);
    }
};



window.initResult = function () {
    try {       
        console.warn("initResult called");
    } catch (err) {
        console.warn("initResult error:", err);
    }
};

window.initFaq = function () {
    try {  
        initFaqFunctions();
        console.warn("initFaq called");
    } catch (err) {
        console.warn("initFaq error:", err);
    }
};

window.initContact = function () {
    try {       
        console.warn("initContact called");
    } catch (err) {
        console.warn("initContact error:", err);
    }
};




