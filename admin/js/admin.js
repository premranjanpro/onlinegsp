
// ====== Config ======
const ADMIN_API_KEY = 'gsptestkey'; // replace with your ApiKey (or inject server-side)
const PAGE_SIZE = 25;

const api = {
    members: '/api/members',
    results: '/api/results',
    enquiries: '/api/enquiries',
    courses: '/api/courses',
    news: '/api/news',
    uploadBase64: '/api/upload/baseupload'
};

// ====== Small DOM helpers ======
function $(q) { return document.querySelector(q); }
function $$(q) { return Array.from(document.querySelectorAll(q)); }

// ====== Common helpers ======
async function fetchJson(url, opts = {}) {
    const r = await fetch(url, opts);
    if (!r.ok) {
        const txt = await r.text().catch(function () { return null; });
        throw new Error('Request failed: ' + (txt || r.statusText));
    }
    if (r.status === 204) return null;
    return r.json();
}

// Escape for HTML text content
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    var s = String(value);
    return s.replace(/[&<>\"']/g, function (ch) {
        switch (ch) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return ch;
        }
    });
}

function escapeAttr(value) {
    if (value === null || value === undefined) return '';
    var s = String(value);
    return s.replace(/[&<>\"']/g, function (ch) {
        switch (ch) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return ch;
        }
    });
}

function formatDateInput(d) {
    if (!d) return '';
    try {
        var dt = new Date(d);
        return dt.toISOString().substring(0, 10);
    } catch (e) { return ''; }
}

function formatDateTimeLocal(d) {
    if (!d) return '';
    try {
        var dt = new Date(d);
        var off = dt.getTimezoneOffset();
        var local = new Date(dt.getTime() - (off * 60 * 1000));
        return local.toISOString().slice(0, 16);
    } catch (e) { return ''; }
}

function toIsoDate(v) { if (!v) return null; return new Date(v).toISOString(); }
function toIsoDateTime(v) { if (!v) return null; return new Date(v).toISOString(); }

// ====== Modal helpers ======
function showModal(title, html, onSave) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    var titleEl = document.getElementById('modalTitle');
    var bodyEl = document.getElementById('modalBody');
    var saveBtn = document.getElementById('modalSave');
    var closeBtn = document.getElementById('modalClose');

    titleEl.textContent = title;
    bodyEl.innerHTML = html;
    modal.classList.add('open');

    saveBtn.onclick = onSave;
    closeBtn.onclick = function () { closeModal(); };
}

function closeModal() {
    var modal = document.getElementById('modal');
    if (!modal) return;
    modal.classList.remove('open');
    var bodyEl = document.getElementById('modalBody');
    if (bodyEl) bodyEl.innerHTML = '';
}

// ====== Top nav / common init ======
function initTopNav() {
    var page = document.body.getAttribute('data-page');
    $$('.topnav a').forEach(function (a) {
        if (a.getAttribute('data-page') === page) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });
}

async function exportAllData() {
    try {
        var payload = {
            members: await fetchJson(api.members),
            results: await fetchJson(api.results),
            enquiries: await fetchJson(api.enquiries),
            courses: await fetchJson(api.courses),
            news: await fetchJson(api.news)
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'gsp-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('Export failed');
        console.error(e);
    }
}

function initCommon() {
    initTopNav();

    var exportBtn = document.getElementById('btnExport');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            exportAllData();
        });
    }

    var reloadBtn = document.getElementById('btnReload');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', function () {
            var page = document.body.getAttribute('data-page');
            if (page === 'members') loadMembers();
            else if (page === 'results') loadResults();
            else if (page === 'enquiries') loadEnquiries();
            else if (page === 'courses') loadCourses();
            else if (page === 'news') loadNews();
        });
    }
}

// ====== Members page ======
var membersData = [];
var membersPage = 1;

async function loadMembers() {
    var arr = [];
    try { arr = await fetchJson(api.members); }
    catch (e) { console.error(e); arr = []; }
    membersData = arr || [];
    renderMembers();
}

function renderMembers() {
    var tbody = document.querySelector('#membersTable tbody');
    if (!tbody) return;

    var qEl = document.getElementById('mfilter');
    var q = qEl ? (qEl.value || '').trim().toLowerCase() : '';

    var filtered = membersData.filter(function (m) {
        var name = (m.NAME || '').toLowerCase();
        var enrol = (m.ENROLNO || '').toLowerCase();
        var roll = (m.ROLLNO || '').toLowerCase();
        var city = (m.City || '').toLowerCase();
        if (!q) return true;
        return name.indexOf(q) >= 0 || enrol.indexOf(q) >= 0 || roll.indexOf(q) >= 0 || city.indexOf(q) >= 0;
    });

    var total = filtered.length;
    var pageCount = total ? Math.ceil(total / PAGE_SIZE) : 1;
    if (membersPage < 1) membersPage = 1;
    if (membersPage > pageCount) membersPage = pageCount;

    var start = (membersPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    var html = '';
    pageItems.forEach(function (m) {
        html += '<tr>';
        html += '<td>' + escapeHtml(m.NAME || '') + '</td>';
        html += '<td>' + escapeHtml(m.ENROLNO || '') + '</td>';
        html += '<td>' + escapeHtml(m.ROLLNO || '') + '</td>';
        html += '<td>' + escapeHtml(m.City || '') + '</td>';
        html += '<td>' + escapeHtml(m.State || '') + '</td>';
        html += '<td>' + escapeHtml(m.Phone || '') + '</td>';
        html += '<td><span class="status-pill ' + escapeAttr(m.STATUS || 'pending') + '">' + escapeHtml(m.STATUS || 'pending') + '</span></td>';
        html += '<td><button class="small-btn editMember" data-id="' + escapeAttr(m.Id || '') + '">Edit</button></td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;

    var countEl = document.getElementById('membersCount');
    if (countEl) countEl.textContent = total + ' members';

    var pageInfo = document.getElementById('mPageInfo');
    if (pageInfo) {
        pageInfo.textContent = total ? ('Page ' + membersPage + ' of ' + pageCount) : 'No records found';
    }

    var prevBtn = document.getElementById('mPrev');
    var nextBtn = document.getElementById('mNext');
    if (prevBtn) prevBtn.disabled = membersPage <= 1;
    if (nextBtn) nextBtn.disabled = membersPage >= pageCount;

    $$('#membersTable .editMember').forEach(function (b) {
        b.onclick = async function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            try {
                var m = await fetchJson(api.members + '/' + id);
                openMemberModal(m);
            } catch (err) {
                alert('Load member failed');
                console.error(err);
            }
        };
    });
}

async function openMemberModal(m) {
    m = m || {};

    let states = [];
    try {
        states = await fetchJson(api.members + '/states');
    } catch (e) {
        console.warn('Failed to load states', e);
    }

    const stateOptions = (states || []).map(s =>
        '<option value="' + escapeAttr(s) + '">' + escapeHtml(s) + '</option>'
    ).join('');

    const html =
        '<label>Center Name<input id="f_center" value="' + escapeAttr(m.Center || '') + '"></label>' +
        '<label>Full Name<input id="f_name" value="' + escapeAttr(m.NAME || '') + '"></label>' +        
        '<label>Branch Code<input id="f_enrol" value="' + escapeAttr(m.ENROLNO || '') + '"></label>' +
        '<label>Branch Id<input id="f_roll" value="' + escapeAttr(m.ROLLNO || '') + '"></label>' +
        '<label>Email ID<input id="f_email" value="' + escapeAttr(m.EMAIL || '') + '"></label>' +
        '<label>Phone No.<input id="f_phone" value="' + escapeAttr(m.Phone || '') + '"></label>' +
        '<label>Phone No. (Alternate)<input id="f_phone_alt" value="' + escapeAttr(m.PhoneAlternate || '') + '"></label>' +
        '<label>Address 1<input id="f_addr1" value="' + escapeAttr(m.Address1 || '') + '"></label>' +
        '<label>Address 2<input id="f_addr2" value="' + escapeAttr(m.Address2 || '') + '"></label>' +
        '<label>State<select id="f_state"><option value="">Select state</option>' + stateOptions + '</select></label>' +
        '<label>City<input id="f_city" value="' + escapeAttr(m.City || '') + '"></label>' +
        '<label>District<input id="f_district" value="' + escapeAttr(m.District || '') + '"></label>' +
        '<label>Aadhar Card No.<input id="f_aadhar" value="' + escapeAttr(m.AadharCardNo || '') + '"></label>' +
        '<label>Password<input id="f_password" type="password"></label>' +

        fileBlock('Photo of Owner', 'f_photo_file', 'f_photo_preview', m.PhotoOfOwner) +
        fileBlock('Aadhar Card Image', 'f_aadhar_file', 'f_aadhar_preview', m.AadharCardImage) +
        fileBlock('Center Logo', 'f_center_logo_file', 'f_center_logo_preview', m.CenterLogo) +
        fileBlock('Certificate', 'f_certificate_file', 'f_certificate_preview', m.CertificateImage) +
        fileBlock('Welcome Letter', 'f_letter_file', 'f_letter_preview', m.LetterImage) +

        '<label>Status<select id="f_status">' +
        '<option value="pending">pending</option>' +
        '<option value="approved">approved</option>' +
        '<option value="rejected">rejected</option>' +
        '</select></label>' +

        '<label class="full">Remarks<textarea id="f_remarks">' + escapeHtml(m.REMARKS || '') + '</textarea></label>' +
        '<input type="hidden" id="f_id" value="' + escapeAttr(m.Id || '') + '">';

    showModal(m.Id ? 'Edit Member' : 'Add Member', html, async function () {

        const saveBtn = document.getElementById('modalSave');
        saveBtn.disabled = true;

        const obj = {
            NAME: val('f_name'),
            Center: val('f_center'),
            EMAIL: val('f_email'),
            ENROLNO: val('f_enrol'),
            ROLLNO: val('f_roll'),
            Phone: val('f_phone'),
            PhoneAlternate: val('f_phone_alt'),
            Address1: val('f_addr1'),
            Address2: val('f_addr2'),
            State: val('f_state'),
            City: val('f_city'),
            District: val('f_district'),
            AadharCardNo: val('f_aadhar'),
            Password: val('f_password'),
            STATUS: val('f_status'),
            REMARKS: val('f_remarks')
        };

        try {
            await uploadIfExists('f_photo_file', 'members', p => obj.PhotoOfOwner = p);
            await uploadIfExists('f_aadhar_file', 'members', p => obj.AadharCardImage = p);
            await uploadIfExists('f_center_logo_file', 'members', p => obj.CenterLogo = p);
            await uploadIfExists('f_certificate_file', 'members', p => obj.CertificateImage = p);
            await uploadIfExists('f_letter_file', 'members', p => obj.LetterImage = p);
        } catch (err) {
            alert('Upload failed: ' + err.message);
            saveBtn.disabled = false;
            return;
        }

        try {
            const id = val('f_id');
            await fetchJson(id ? api.members + '/' + id : api.members, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                body: JSON.stringify(obj)
            });
            closeModal();
            loadMembers();
        } catch (e) {
            alert('Save failed');
        } finally {
            saveBtn.disabled = false;
        }
    });

    setTimeout(() => {
        const statusSel = document.getElementById('f_status');
        if (statusSel) {
            statusSel.value = m.STATUS || 'pending';
        }

        const stateSel = document.getElementById('f_state');
        if (stateSel && m.State) {
            stateSel.value = m.State;
        }

        initFilePreviews();
    }, 50);
}



function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function fileBlock(label, inputId, previewId, existing) {
    return '<label>' + label +
        '<input type="file" id="' + inputId + '" accept="image/*"></label>' +
        '<div id="' + previewId + '" >' +
        (existing ? '<img src="' + escapeAttr(existing) + '" style="max-width:140px;border-radius:6px;">' : '') +
        '</div>';
}

function initFilePreviews() {
    bindPreview('f_photo_file', 'f_photo_preview');
    bindPreview('f_aadhar_file', 'f_aadhar_preview');
    bindPreview('f_center_logo_file', 'f_center_logo_preview');
    bindPreview('f_certificate_file', 'f_certificate_preview');
    bindPreview('f_letter_file', 'f_letter_preview');
}

function bindPreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.onchange = () => {
        if (!input.files.length) return preview.innerHTML = '';
    const r = new FileReader();
    r.onload = e => preview.innerHTML =
        '<img src="' + e.target.result + '" style="max-width:140px;border-radius:6px">';
    r.readAsDataURL(input.files[0]);
};
}

async function uploadIfExists(inputId, folder, cb) {
    const fi = document.getElementById(inputId);
    if (!fi || !fi.files.length) return;

    const file = fi.files[0];
    const dataUrl = await new Promise(res => {
        const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
});

const resp = await fetch(api.uploadBase64, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
    body: JSON.stringify({ filename: file.name, data: dataUrl, folder })
});

if (!resp.ok) throw new Error('Upload failed');
const json = await resp.json();
cb(json.path);
}





function initMembersPage() {
    var filter = document.getElementById('mfilter');
    if (filter) {
        filter.addEventListener('input', function () {
            membersPage = 1;
            renderMembers();
        });
    }

    var addBtn = document.getElementById('btnAddMember');
    if (addBtn) addBtn.addEventListener('click', function () { openMemberModal(); });

    var prevBtn = document.getElementById('mPrev');
    var nextBtn = document.getElementById('mNext');

    if (prevBtn) prevBtn.addEventListener('click', function () {
        membersPage -= 1;
        renderMembers();
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
        membersPage += 1;
        renderMembers();
    });

    loadMembers();
}

// ====== Results page ======
var resultsData = [];
var resultsPage = 1;

async function loadResults() {
    var arr = [];
    try { arr = await fetchJson(api.results); }
    catch (e) { console.error(e); arr = []; }
    resultsData = arr || [];
    renderResults();
}

function truncate(text, len) {
    if (!text) return '';
    text = String(text);
    return text.length > len
        ? text.substring(0, len) +'...'
        : text;
}

function renderResults() {
    var tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) return;

    var qEl = document.getElementById('rfilter');
    var q = qEl ? (qEl.value || '').trim().toLowerCase() : '';

    var filtered = resultsData.filter(function (r) {
        if (!q) return true;
        var enrol = (r.ENROLNO || '').toLowerCase();
        var roll = (r.ROLLNO || '').toLowerCase();
        var nm = (r.NAMEANDFATHERSNAME || '').toLowerCase();
        return enrol.indexOf(q) >= 0 || roll.indexOf(q) >= 0 || nm.indexOf(q) >= 0;
    });

    var total = filtered.length;
    var pageCount = total ? Math.ceil(total / PAGE_SIZE) : 1;
    if (resultsPage < 1) resultsPage = 1;
    if (resultsPage > pageCount) resultsPage = pageCount;

    var start = (resultsPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    var html = '';
    pageItems.forEach(function (r) {
        html += '<tr>';
        html += '<td title="' + escapeAttr(r.NAMEANDFATHERSNAME || '') + '">' +
        escapeHtml(truncate(r.NAMEANDFATHERSNAME, 15)) +
        '</td>';

        html += '<td title="' + escapeAttr(r.COURSENAME || '') + '">' +
                escapeHtml(truncate(r.COURSENAME, 15)) +
                '</td>';
        html += '<td>' + escapeHtml(r.DURATION || '') + '</td>';
        html += '<td>' + escapeHtml(r.ENROLNO || '') + '</td>';
        html += '<td>' + escapeHtml(r.ROLLNO || '') + '</td>';
        html += '<td>' + (r.DOJ || '') + '</td>';
        html += '<td>' + (r.DOC || '') + '</td>';
        html += '<td>' + (r.ISSUEDATE || '') + '</td>';
        html += '<td><button class="small-btn editResult" data-id="' + escapeAttr(r.Id || '') + '">Edit</button></td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;

    var pageInfo = document.getElementById('rPageInfo');
    if (pageInfo) pageInfo.textContent = total ? ('Page ' + resultsPage + ' of ' + pageCount) : 'No records found';

    var prevBtn = document.getElementById('rPrev');
    var nextBtn = document.getElementById('rNext');
    if (prevBtn) prevBtn.disabled = resultsPage <= 1;
    if (nextBtn) nextBtn.disabled = resultsPage >= pageCount;

    $$('#resultsTable .editResult').forEach(function (b) {
        b.onclick = async function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            try {
                var arr = await fetchJson(api.results);
                var rec = (arr || []).find(function (x) { return x.Id === id; });
                openResultModal(rec);
            } catch (err) {
                alert('Load result failed');
                console.error(err);
            }
        };
    });
}

async function openResultModal(r) {
    r = r || {};
    var courses = [], durations = [];
    try { courses = await fetchJson(api.courses); } catch (e) { console.warn('courses load failed', e); }
    try { durations = await fetchJson(api.courses + '/durations'); } catch (e2) { console.warn('durations load failed', e2); }

    var courseOpts = (courses || []).map(function (c) {
        return '<option value="' + escapeAttr(c.Title) + '">' + escapeHtml(c.Title) + '</option>';
    }).join('');

    var durOpts = (durations || []).map(function (d) {
        return '<option value="' + escapeAttr(d) + '">' + escapeHtml(d) + '</option>';
    }).join('');

    var html = ''        
        + '<label>Enroll No.<input id="res_en" value="' + escapeAttr(r.ENROLNO || '') + '"></label>'
        + '<label>Roll No.<input id="res_roll" value="' + escapeAttr(r.ROLLNO || '') + '"></label>'
        + '<label>Center Name<input id="res_branch" value="' + escapeAttr(r.BRANCHNAME || '') + '"></label>'
        + '<label>Name<input id="res_name" value="' + escapeAttr(r.NAMEANDFATHERSNAME || '') + '"></label>'
        + '<label>Course<select id="res_course"><option value="">Select course</option>' + courseOpts + '</select></label>'
        + '<label>Duration<select id="res_duration"><option value="">Select duration</option>' + durOpts + '</select></label>'
        + '<label>Date of Joining<input id="res_doj" placeholder="dd/mm/yyyy" value="' + escapeAttr(r.DOJ) + '"></label>'
        + '<label>Date of Completed<input id="res_doc" placeholder="dd/mm/yyyy" value="' + escapeAttr(r.DOC) + '"></label>'
        + '<label>Issued Date<input id="res_issued" placeholder="dd/mm/yyyy" value="' + escapeAttr(r.ISSUEDATE) + '"></label>'
        + '<input type="hidden" id="res_id" value="' + escapeAttr(r.Id || '') + '">';

    showModal(r.Id ? 'Edit Result' : 'Add Result', html, async function () {
        var saveBtn = document.getElementById('modalSave');
        saveBtn.disabled = true;

        var idVal = document.getElementById('res_id').value;
        var obj = {
            BRANCHNAME: document.getElementById('res_branch').value,
            ENROLNO: document.getElementById('res_en').value,
            ROLLNO: document.getElementById('res_roll').value,
            NAMEANDFATHERSNAME: document.getElementById('res_name').value,
            COURSENAME: document.getElementById('res_course').value,
            DURATION: document.getElementById('res_duration').value,
            DOJ: document.getElementById('res_doj').value,
            DOC: document.getElementById('res_doc').value,
            ISSUEDATE: document.getElementById('res_issued').value
        };

        try {
            if (idVal) {
                await fetchJson(api.results + '/' + idVal, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            } else {
                await fetchJson(api.results, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            }
            closeModal();
            loadResults();
        } catch (err) {
            alert('Save failed: ' + (err.message || err));
        } finally {
            saveBtn.disabled = false;
        }
    });

    setTimeout(function () {
        if (r.COURSENAME) {
            var cSel = document.getElementById('res_course');
            if (cSel) cSel.value = r.COURSENAME;
        }
        if (r.DURATION) {
            var dSel = document.getElementById('res_duration');
            if (dSel) dSel.value = r.DURATION;
        }
    }, 50);
}

function initResultsPage() {
    var filter = document.getElementById('rfilter');
    if (filter) {
        filter.addEventListener('input', function () {
            resultsPage = 1;
            renderResults();
        });
    }

    var addBtn = document.getElementById('btnAddResult');
    if (addBtn) addBtn.addEventListener('click', function () { openResultModal(); });

    var prevBtn = document.getElementById('rPrev');
    var nextBtn = document.getElementById('rNext');

    if (prevBtn) prevBtn.addEventListener('click', function () {
        resultsPage -= 1;
        renderResults();
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
        resultsPage += 1;
        renderResults();
    });

    loadResults();
}

// ====== Courses page ======
var coursesData = [];
var coursesPage = 1;

async function loadCourses() {
    var arr = [];
    try { arr = await fetchJson(api.courses); }
    catch (e) { console.error(e); arr = []; }
    coursesData = arr || [];
    renderCourses();
}

function renderCourses() {
    var tbody = document.querySelector('#coursesTable tbody');
    if (!tbody) return;

    var qEl = document.getElementById('cfilter');
    var q = qEl ? (qEl.value || '').trim().toLowerCase() : '';

    var filtered = coursesData.filter(function (c) {
        if (!q) return true;
        var title = (c.Title || '').toLowerCase();
        var dur = (c.Duration || '').toLowerCase();
        return title.indexOf(q) >= 0 || dur.indexOf(q) >= 0;
    });

    var total = filtered.length;
    var pageCount = total ? Math.ceil(total / PAGE_SIZE) : 1;
    if (coursesPage < 1) coursesPage = 1;
    if (coursesPage > pageCount) coursesPage = pageCount;

    var start = (coursesPage - 1) * PAGE_SIZE;
    var pageItems = filtered.slice(start, start + PAGE_SIZE);

    var html = '';
    pageItems.forEach(function (c) {
        html += '<tr>';
        html += '<td>' + escapeHtml(c.Title || '') + '</td>';
        html += '<td>' + escapeHtml(c.Duration || '') + '</td>';
        html += '<td>' + escapeHtml(c.CourseCategory || '') + '</td>';
        html += '<td>' + escapeHtml(c.Rating || 0) + '</td>';
        html += '<td>' + escapeHtml(c.Price || 0) + '</td>';
        html += '<td>' + escapeHtml(c.OfferPrice || 0) + '</td>';
        html += '<td>' + escapeHtml(c.Status || '') + '</td>';
        html += '<td><button class="small-btn editCourse" data-id="' + escapeAttr(c.Id || '') + '">Edit</button></td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;

    var pageInfo = document.getElementById('cPageInfo');
    if (pageInfo) pageInfo.textContent = total ? ('Page ' + coursesPage + ' of ' + pageCount) : 'No records found';

    var prevBtn = document.getElementById('cPrev');
    var nextBtn = document.getElementById('cNext');
    if (prevBtn) prevBtn.disabled = coursesPage <= 1;
    if (nextBtn) nextBtn.disabled = coursesPage >= pageCount;

    $$('#coursesTable .editCourse').forEach(function (b) {
        b.onclick = async function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            try {
                var c = await fetchJson(api.courses + '/' + id);
                openCourseModal(c);
            } catch (err) {
                alert('Load course failed');
                console.error(err);
            }
        };
    });
}

async function openCourseModal(c) {
    c = c || {};
    var durations = [];
    try { durations = await fetchJson(api.courses + '/durations'); } catch (e) { console.warn('durations load failed', e); }

    var durOpts = (durations || []).map(function (d) {
        return '<option value="' + escapeAttr(d) + '">' + escapeHtml(d) + '</option>';
    }).join('');

    var html = ''
        + '<label class="full">Title<input id="c_title" value="' + escapeAttr(c.Title || '') + '"></label>'
        + '<label>Duration<select id="c_duration"><option value="">Select duration</option>' + durOpts + '</select></label>'
        + '<label>Rating<input id="c_rating" type="number" min="0" max="5" step="0.1" value="' + escapeAttr(c.Rating || 0) + '"></label>'
        + '<label>Price<input id="c_price" type="number" step="0.01" value="' + escapeAttr(c.Price || 0) + '"></label>'
        + '<label>Offer Price<input id="c_offer" type="number" step="0.01" value="' + escapeAttr(c.OfferPrice || 0) + '"></label>'
        + '<label>Image<input id="c_image_file" type="file" accept="image/*"></label>'
        + '<div id="c_image_preview" class="full">' + (c.Image ? '<img src="' + escapeAttr(c.Image) + '" style="max-width:140px;border-radius:6px;">' : '') + '</div>'
        + '<label>Status<select id="c_status">'
        + '<option value="Active">Active</option>'
        + '<option value="Inactive">Inactive</option>'
        + '<option value="Archived">Archived</option>'
        + '</select></label>'
        + '<label>Course Type<select id="c_CourseCategory">'
        + '<option value="Vocational_Courses">Vocational Courses</option>'
        + '<option value="Non_Engineering_Trades">Non Engineering Trades</option>'
        + '<option value="Management_Courses">Management Courses</option>'
        + '<option value="Financial_Services">Financial Services</option>'
        + '<option value="Engineering_Trades">Engineering Trades</option>'
        + '<option value="Computer_Literacy_Programme">Computer Literacy Programme</option>'
        + '</select></label>'
        + '<label class="full">Short Description<textarea id="c_short">' + escapeAttr(c.ShortDesc || '') + '</textarea></label>'
        + '<label class="full">HTML Description<textarea id="c_html">' + escapeAttr(c.HtmlDesc || '') + '</textarea></label>'
        + '<input type="hidden" id="c_id" value="' + escapeAttr(c.Id || '') + '">';

    showModal(c.Id ? 'Edit Course' : 'Add Course', html, async function () {
        var saveBtn = document.getElementById('modalSave');
        saveBtn.disabled = true;

        var idVal = document.getElementById('c_id').value;
        var obj = {
            Title: document.getElementById('c_title').value,
            Duration: document.getElementById('c_duration').value,
            Rating: parseFloat(document.getElementById('c_rating').value || 0),
            Price: parseFloat(document.getElementById('c_price').value || 0),
            OfferPrice: parseFloat(document.getElementById('c_offer').value || 0),
            Status: document.getElementById('c_status').value,
            ShortDesc: document.getElementById('c_short').value,
            HtmlDesc: document.getElementById('c_html').value,
            CourseCategory: document.getElementById('c_CourseCategory').value
        };

        try {
            var fi = document.getElementById('c_image_file');
            if (fi && fi.files && fi.files.length > 0) {
                var file = fi.files[0];
                var dataUrl = await new Promise(function (res) {
                    var r = new FileReader();
                    r.onload = function () { res(r.result); };
                    r.readAsDataURL(file);
                });
                var uploadResp = await fetch(api.uploadBase64, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify({ filename: file.name, data: dataUrl, folder: 'courses' })
                });
                if (uploadResp.ok) {
                    var up = await uploadResp.json();
                    obj.Image = up.path;
                } else {
                    alert('Image upload failed');
                    saveBtn.disabled = false;
                    return;
                }
            } else if (c && c.Image) {
                obj.Image = c.Image;
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
            saveBtn.disabled = false;
            return;
        }

        try {
            if (idVal) {
                await fetchJson(api.courses + '/' + idVal, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            } else {
                await fetchJson(api.courses, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            }
            closeModal();
            loadCourses();
        } catch (e) {
            console.error(e);
            alert('Save failed');
        } finally {
            saveBtn.disabled = false;
        }
    });

    setTimeout(function () {
        if (c.Duration) {
            var dSel = document.getElementById('c_duration');
            if (dSel) dSel.value = c.Duration;
        }
        if (c.Status) {
            var sSel = document.getElementById('c_status');
            if (sSel) sSel.value = c.Status;
        }
        if (c.CourseCategory) {
            var catSel = document.getElementById('c_CourseCategory');
            if (catSel) catSel.value = c.CourseCategory;
        }
        var fi = document.getElementById('c_image_file');
        var prev = document.getElementById('c_image_preview');
        if (fi) {
            fi.onchange = function () {
                prev.innerHTML = '';
                if (fi.files && fi.files.length > 0) {
                    var f = fi.files[0];
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        prev.innerHTML = '<img src="' + e.target.result + '" style="max-width:140px;border-radius:6px">';
                    };
                    reader.readAsDataURL(f);
                }
            };
        }
    }, 50);
}

function initCoursesPage() {
    var filter = document.getElementById('cfilter');
    if (filter) {
        filter.addEventListener('input', function () {
            coursesPage = 1;
            renderCourses();
        });
    }

    var addBtn = document.getElementById('btnAddCourse');
    if (addBtn) addBtn.addEventListener('click', function () { openCourseModal(); });

    var prevBtn = document.getElementById('cPrev');
    var nextBtn = document.getElementById('cNext');

    if (prevBtn) prevBtn.addEventListener('click', function () {
        coursesPage -= 1;
        renderCourses();
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
        coursesPage += 1;
        renderCourses();
    });

    loadCourses();
}

// ====== Enquiries page ======
var enquiriesData = [];
var enquiriesPage = 1;

async function loadEnquiries() {
    var arr = [];
    try { arr = await fetchJson(api.enquiries); }
    catch (e) { console.error(e); arr = []; }
    enquiriesData = arr || [];
    renderEnquiries();
}

function renderEnquiries() {
    var tbody = document.querySelector('#enquiriesTable tbody');
    if (!tbody) return;

    var total = enquiriesData.length;
    var pageCount = total ? Math.ceil(total / PAGE_SIZE) : 1;
    if (enquiriesPage < 1) enquiriesPage = 1;
    if (enquiriesPage > pageCount) enquiriesPage = pageCount;

    var start = (enquiriesPage - 1) * PAGE_SIZE;
    var pageItems = enquiriesData.slice(start, start + PAGE_SIZE);

    var html = '';
    pageItems.forEach(function (e) {
        html += '<tr>';
        html += '<td>' + escapeHtml(e.Name || '') + '</td>';
        html += '<td>' + escapeHtml(e.Email || '') + '</td>';
        html += '<td>' + escapeHtml(e.Mobile || '') + '</td>';
        html += '<td>' + escapeHtml(e.Course || '') + '</td>';
        html += '<td>' + escapeHtml(e.City || '') + '</td>';
        html += '<td>' + escapeHtml(e.State || '') + '</td>';
        html += '<td>' + escapeHtml(e.District || '') + '</td>';
        html += '<td>' + (e.CreatedAt ? new Date(e.CreatedAt).toLocaleString() : '') + '</td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;

    var pageInfo = document.getElementById('ePageInfo');
    if (pageInfo) pageInfo.textContent = total ? ('Page ' + enquiriesPage + ' of ' + pageCount) : 'No records found';

    var prevBtn = document.getElementById('ePrev');
    var nextBtn = document.getElementById('eNext');
    if (prevBtn) prevBtn.disabled = enquiriesPage <= 1;
    if (nextBtn) nextBtn.disabled = enquiriesPage >= pageCount;
}

async function openEnquiryModal(e) {
    e = e || {};
    var states = [], courses = [];
    try { states = await fetchJson(api.members + '/states'); } catch (err) { console.warn(err); }
    try { courses = await fetchJson(api.courses); } catch (err2) { console.warn(err2); }

    var stateOptions = (states || []).map(function (s) {
        return '<option value="' + escapeAttr(s) + '">' + escapeHtml(s) + '</option>';
    }).join('');

    var courseOptions = (courses || []).map(function (c) {
        return '<option value="' + escapeAttr(c.Title) + '">' + escapeHtml(c.Title) + '</option>';
    }).join('');

    var html = ''
        + '<label>Name<input id="en_name" value="' + escapeAttr(e.Name || '') + '"></label>'
        + '<label>Email<input id="en_email" value="' + escapeAttr(e.Email || '') + '"></label>'
        + '<label>Mobile<input id="en_mobile" value="' + escapeAttr(e.Mobile || '') + '"></label>'
        + '<label>State<select id="en_state"><option value="">Select state</option>' + stateOptions + '</select></label>'
        + '<label>City<input id="en_city" value="' + escapeAttr(e.City || '') + '"></label>'
        + '<label>District<input id="en_district" value="' + escapeAttr(e.District || '') + '"></label>'
        + '<label>Course<select id="en_course"><option value="">Select course</option>' + courseOptions + '</select></label>'
        + '<label class="full">Remarks<textarea id="en_remarks">' + escapeAttr(e.Remarks || '') + '</textarea></label>';

    showModal('Add Enquiry', html, async function () {
        var saveBtn = document.getElementById('modalSave');
        saveBtn.disabled = true;

        var obj = {
            Name: document.getElementById('en_name').value,
            Email: document.getElementById('en_email').value,
            Mobile: document.getElementById('en_mobile').value,
            State: document.getElementById('en_state').value,
            City: document.getElementById('en_city').value,
            District: document.getElementById('en_district').value,
            Course: document.getElementById('en_course').value,
            Remarks: document.getElementById('en_remarks').value
        };

        try {
            await fetchJson(api.enquiries, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            });
            closeModal();
            loadEnquiries();
        } catch (err) {
            alert('Save failed: ' + (err.message || err));
        } finally {
            saveBtn.disabled = false;
        }
    });

    setTimeout(function () {
        if (e.State) {
            var sSel = document.getElementById('en_state');
            if (sSel) sSel.value = e.State;
        }
        if (e.Course) {
            var cSel = document.getElementById('en_course');
            if (cSel) cSel.value = e.Course;
        }
    }, 50);
}

function initEnquiriesPage() {
    var addBtn = document.getElementById('btnAddEnquiry');
    if (addBtn) addBtn.addEventListener('click', function () { openEnquiryModal(); });

    var prevBtn = document.getElementById('ePrev');
    var nextBtn = document.getElementById('eNext');

    if (prevBtn) prevBtn.addEventListener('click', function () {
        enquiriesPage -= 1;
        renderEnquiries();
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
        enquiriesPage += 1;
        renderEnquiries();
    });

    loadEnquiries();
}

// ====== News page ======
var newsData = [];
var newsPage = 1;

async function loadNews() {
    var arr = [];
    try { arr = await fetchJson(api.news); }
    catch (e) { console.error(e); arr = []; }
    newsData = arr || [];
    renderNews();
}

function renderNews() {
    var tbody = document.querySelector('#newsTable tbody');
    if (!tbody) return;

    var total = newsData.length;
    var pageCount = total ? Math.ceil(total / PAGE_SIZE) : 1;
    if (newsPage < 1) newsPage = 1;
    if (newsPage > pageCount) newsPage = pageCount;

    var start = (newsPage - 1) * PAGE_SIZE;
    var pageItems = newsData.slice(start, start + PAGE_SIZE);

    var html = '';
    pageItems.forEach(function (n) {
        var dt = n.CrcDate || n.crcDate || n.CreatedAt;
        var by = n.CrcBy || n.CrdBy || '';
        html += '<tr>';
        html += '<td>' + escapeHtml(n.Title || '') + '</td>';
        html += '<td>' + (dt ? new Date(dt).toLocaleString() : '') + '</td>';
        html += '<td>' + escapeHtml(by || '') + '</td>';
        html += '<td>' + escapeHtml(n.Status || '') + '</td>';
        html += '<td><button class="small-btn editNews" data-id="' + escapeAttr(n.Id || '') + '">Edit</button></td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;

    var pageInfo = document.getElementById('nPageInfo');
    if (pageInfo) pageInfo.textContent = total ? ('Page ' + newsPage + ' of ' + pageCount) : 'No records found';

    var prevBtn = document.getElementById('nPrev');
    var nextBtn = document.getElementById('nNext');
    if (prevBtn) prevBtn.disabled = newsPage <= 1;
    if (nextBtn) nextBtn.disabled = newsPage >= pageCount;

    $$('#newsTable .editNews').forEach(function (b) {
        b.onclick = async function (e) {
            var id = e.currentTarget.getAttribute('data-id');
            try {
                var n = await fetchJson(api.news + '/' + id);
                openNewsModal(n);
            } catch (err) {
                alert('Load news failed');
                console.error(err);
            }
        };
    });
}

async function openNewsModal(n) {
    n = n || {};
    if (!Array.isArray(n.Images)) n.Images = n.Images ? n.Images : [];

    var html = ''
        + '<label class="full">Title<input id="news_title" value="' + escapeAttr(n.Title || '') + '"></label>'
        + '<label class="full">Html Body<textarea id="news_html">' + escapeAttr(n.HtmlBody || '') + '</textarea></label>'
        + '<label>Images<input id="news_images_files" type="file" accept="image/*" multiple></label>'
        + '<div id="news_images_preview" class="full">'
        + n.Images.map(function (i) { return '<img src="' + escapeAttr(i) + '" style="max-width:120px;margin-right:8px;border-radius:6px;">'; }).join('')
        + '</div>'
        + '<label>Created By<input id="news_crdby" value="' + escapeAttr(n.CrcBy || '') + '"></label>'
        + '<label>Created Date<input id="news_crddate" type="datetime-local" value="' + escapeAttr(formatDateTimeLocal(n.CrcDate || n.crcDate)) + '"></label>'
        + '<label>Status<select id="news_status">'
        + '<option value="pending">pending</option>'
        + '<option value="approved">approved</option>'
        + '<option value="rejected">rejected</option>'
        + '</select></label>'
        + '<input type="hidden" id="news_id" value="' + escapeAttr(n.Id || '') + '">';

    showModal(n.Id ? 'Edit News' : 'Add News', html, async function () {
        var saveBtn = document.getElementById('modalSave');
        saveBtn.disabled = true;

        var idVal = document.getElementById('news_id').value;
        var obj = {
            Title: document.getElementById('news_title').value,
            HtmlBody: document.getElementById('news_html').value,
            CrcBy: document.getElementById('news_crdby').value,
            CrcDate: toIsoDateTime(document.getElementById('news_crddate').value),
            Status: document.getElementById('news_status').value,
            Images: Array.isArray(n.Images) ? n.Images.slice() : []
        };

        try {
            var fi = document.getElementById('news_images_files');
            if (fi && fi.files && fi.files.length > 0) {
                for (var i = 0; i < fi.files.length; i++) {
                    var file = fi.files[i];
                    var dataUrl = await new Promise(function (res) {
                        var r = new FileReader();
                        r.onload = function () { res(r.result); };
                        r.readAsDataURL(file);
                    });
                    var uploadResp = await fetch(api.uploadBase64, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                        body: JSON.stringify({ filename: file.name, data: dataUrl, folder: 'news' })
                    });
                    if (uploadResp.ok) {
                        var up = await uploadResp.json();
                        obj.Images.push(up.path);
                    } else {
                        var txt = await uploadResp.text().catch(function () { return null; });
                        throw new Error('Upload failed: ' + (txt || uploadResp.statusText));
                    }
                }
            }
        } catch (err) {
            alert('Image upload failed: ' + err.message);
            saveBtn.disabled = false;
            return;
        }

        try {
            if (idVal) {
                await fetchJson(api.news + '/' + idVal, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            } else {
                await fetchJson(api.news, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Api-Key': ADMIN_API_KEY },
                    body: JSON.stringify(obj)
                });
            }
            closeModal();
            loadNews();
        } catch (err2) {
            alert('Save failed: ' + (err2.message || err2));
        } finally {
            saveBtn.disabled = false;
        }
    });

    setTimeout(function () {
        if (n.Status) {
            var sSel = document.getElementById('news_status');
            if (sSel) sSel.value = n.Status;
        }
        var fi = document.getElementById('news_images_files');
        var prev = document.getElementById('news_images_preview');
        if (fi) {
            fi.onchange = function () {
                prev.innerHTML = '';
                if (fi.files && fi.files.length > 0) {
                    for (var i = 0; i < fi.files.length; i++) {
                        (function (file) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                prev.innerHTML += '<img src="' + e.target.result + '" style="max-width:120px;margin-right:8px;border-radius:6px;">';
                            };
                            reader.readAsDataURL(file);
                        })(fi.files[i]);
                    }
                }
            };
        }
    }, 50);
}

function initNewsPage() {
    var addBtn = document.getElementById('btnAddNews');
    if (addBtn) addBtn.addEventListener('click', function () { openNewsModal(); });

    var prevBtn = document.getElementById('nPrev');
    var nextBtn = document.getElementById('nNext');

    if (prevBtn) prevBtn.addEventListener('click', function () {
        newsPage -= 1;
        renderNews();
    });

    if (nextBtn) nextBtn.addEventListener('click', function () {
        newsPage += 1;
        renderNews();
    });

    loadNews();
}

// ====== Dashboard page ======
function initDashboardPage() {
    // No special JS right now; buttons are just links.
}

// ====== Page bootstrap ======
document.addEventListener('DOMContentLoaded', function () {
    initCommon();
    var page = document.body.getAttribute('data-page');
    if (page === 'dashboard') initDashboardPage();
    else if (page === 'members') initMembersPage();
    else if (page === 'results') initResultsPage();
    else if (page === 'enquiries') initEnquiriesPage();
    else if (page === 'courses') initCoursesPage();
    else if (page === 'news') initNewsPage();
});
