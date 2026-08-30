/* === SHARED APP LOGIC === */

const APP = {
    // Configuration
    apiBase: '/api',

    // Auth
    auth: {
        getToken: () => localStorage.getItem('token'),
        getRole: () => localStorage.getItem('role'),
        getEmail: () => localStorage.getItem('email'),
        isAuthenticated: () => !!localStorage.getItem('token'),

        login: (token, role, email) => {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            if (email) localStorage.setItem('email', email);
        },

        getName: () => localStorage.getItem('name') || APP.auth.getEmail()?.split('@')[0] || 'User',
        getInitials: () => {
            const name = APP.auth.getName();
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        },

        logout: () => {
            localStorage.clear();
            window.location.href = '/login.html';
        },

        requireRole: (allowedRoles) => {
            const role = APP.auth.getRole();
            if (!APP.auth.isAuthenticated()) {
                window.location.href = '/login.html';
                return false;
            }
            if (!allowedRoles.includes(role)) {
                // Redirect to appropriate dashboard based on actual role
                if (role === 'ADMIN') window.location.href = '/admin-dashboard.html';
                else if (role === 'CLIENT') window.location.href = '/client-dashboard.html';
                else window.location.href = '/user-dashboard.html';
                return false;
            }
            return true;
        }
    },

    // API
    api: {
        getHeaders: () => {
            const headers = { 'Content-Type': 'application/json' };
            const token = APP.auth.getToken();
            if (token && token !== 'null' && token !== 'undefined') {
                headers['Authorization'] = 'Bearer ' + token;
            }
            return headers;
        },

        request: async (endpoint, options = {}) => {
            const url = `${APP.apiBase}${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
            const config = {
                headers: APP.api.getHeaders(),
                cache: 'no-store',
                ...options
            };

            try {
                const res = await fetch(url, config);
                if (res.status === 401 || res.status === 403) {
                    // Token expired or invalid
                    if (APP.auth.isAuthenticated()) { // Avoid loop if already logged out
                        APP.toast.error("Session expired. Please login again.");
                        setTimeout(APP.auth.logout, 1500);
                    }
                    throw new Error("Unauthorized");
                }
                if (!res.ok) {
                    const text = await res.text();
                    let msg = text;
                    try {
                        const json = JSON.parse(text);
                        msg = json.message || json.error || text;
                    } catch (e) { }
                    throw new Error(msg || `Error ${res.status}`);
                }
                // Return json if content-type is json, else text
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return await res.json();
                }
                return await res.text();
            } catch (error) {
                console.error("API Error:", error);
                throw error;
            }
        },

        get: (endpoint) => APP.api.request(endpoint, { method: 'GET' }),
        post: (endpoint, body) => APP.api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
        put: (endpoint, body) => APP.api.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
        delete: (endpoint) => APP.api.request(endpoint, { method: 'DELETE' })
    },

    // UI Utilities
    toast: {
        show: (msg, type = 'info', duration = 3000) => {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
            }

            const el = document.createElement('div');
            el.className = `toast ${type}`;
            el.innerHTML = `
                <div class="flex-1">${APP.util.escapeHtml(msg)}</div>
                <button onclick="this.parentElement.remove()" class="ml-3 opacity-50 hover:opacity-100">✕</button>
            `;

            container.appendChild(el);
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(10px)';
                setTimeout(() => el.remove(), 300);
            }, duration);
        },
        success: (msg) => APP.toast.show(msg, 'success'),
        error: (msg) => APP.toast.show(msg, 'error'),
        info: (msg) => APP.toast.show(msg, 'info')
    },

    // Geo
    geo: {
        pick: (elementId) => {
            if (!navigator.geolocation) return APP.toast.error("Geolocation not supported");
            APP.toast.info("Accessing GPS...");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude.toFixed(6);
                    const lng = pos.coords.longitude.toFixed(6);
                    const el = document.getElementById(elementId);
                    if (el) el.value = `GPS: ${lat}, ${lng}`;
                    APP.toast.success("Location captured");
                },
                (err) => {
                    console.error("Geo Error:", err);
                    let msg = "Unable to retrieve location.";
                    if (err.code === 1) msg = "Location permission denied.";
                    else if (err.code === 2) msg = "GPS signal lost / position unavailable.";
                    else if (err.code === 3) msg = "GPS timeout.";
                    APP.toast.error(msg);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    },

    util: {
        escapeHtml: (unsafe) => {
            if (!unsafe) return '';
            return String(unsafe)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        formatDate: (dateStr) => {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleDateString();
        },

        progressBar: (pct) => {
            const p = Math.max(0, Math.min(100, Number(pct) || 0));
            return `
               <div class="w-full max-w-[140px]">
                 <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div class="h-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style="width:${p}%"></div>
                 </div>
                  <div class="text-xs text-gray-500 mt-1 font-medium">${p}%</div>
                </div>`;
        },

        openInMaps: (loc) => {
            if (!loc) return;
            // Detect GPS coordinates (e.g. "GPS: 12.345, 67.890")
            const gpsMatch = loc.match(/GPS:\s*(-?[\d.]+),\s*(-?[\d.]+)/);
            let query = loc;
            if (gpsMatch) {
                query = `${gpsMatch[1]},${gpsMatch[2]}`;
            }
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
        }
    }
};
