// Design Portal API Service
class DesignPortalAPI {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
    }

    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Design Request APIs
    async createDesignRequest(designRequest) {
        return this.request('POST', '/design-requests', designRequest);
    }

    async getDesignRequest(id) {
        return this.request('GET', `/design-requests/${id}`);
    }

    async getAllDesignRequests(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request('GET', `/design-requests?${query}`);
    }

    async updateDesignRequest(id, data) {
        return this.request('PUT', `/design-requests/${id}`, data);
    }

    async updateDesignRequestStatus(id, status) {
        return this.request('PUT', `/design-requests/${id}/status?status=${status}`);
    }

    async assignDesignRequest(id, userId) {
        return this.request('PUT', `/design-requests/${id}/assign/${userId}`);
    }

    async uploadFloorPlan(designRequestId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        };

        try {
            const response = await fetch(`${this.baseURL}/design-requests/${designRequestId}/upload-floor-plan`, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }

    // Design Inquiry APIs
    async createInquiry(inquiry) {
        return this.request('POST', '/design-inquiries', inquiry);
    }

    async getInquiry(id) {
        return this.request('GET', `/design-inquiries/${id}`);
    }

    async getAllInquiries(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request('GET', `/design-inquiries?${query}`);
    }

    async updateInquiry(id, data) {
        return this.request('PUT', `/design-inquiries/${id}`, data);
    }

    async updateInquiryStatus(id, status) {
        return this.request('PUT', `/design-inquiries/${id}/status?status=${status}`);
    }

    async assignInquiry(id, userId) {
        return this.request('PUT', `/design-inquiries/${id}/assign/${userId}`);
    }

    // Design Image Suggestion APIs
    async getDesignSuggestions(designRequestId) {
        return this.request('GET', `/design-suggestions/design-request/${designRequestId}`);
    }

    async getTopDesignSuggestions(designRequestId) {
        return this.request('GET', `/design-suggestions/design-request/${designRequestId}/top`);
    }

    async findSimilarDesigns(style, roomType, colorScheme) {
        return this.request('GET', `/design-suggestions/similar?style=${style}&roomType=${roomType}&colorScheme=${colorScheme}`);
    }

    async likeSuggestion(id) {
        return this.request('POST', `/design-suggestions/${id}/like`);
    }

    async updateSuggestion(id, data) {
        return this.request('PUT', `/design-suggestions/${id}`, data);
    }

    // Market Article APIs
    async getMarketArticles(designRequestId) {
        return this.request('GET', `/market-articles/design-request/${designRequestId}`);
    }

    async getTopMarketArticles(designRequestId) {
        return this.request('GET', `/market-articles/design-request/${designRequestId}/top`);
    }

    async searchGoogleImages(style, roomType, productType) {
        return this.request('GET', `/market-articles/search-google?style=${style}&roomType=${roomType}&productType=${productType}`);
    }

    async searchMarketplaces(designRequestId, productCategory) {
        return this.request('GET', `/market-articles/search-marketplaces?designRequestId=${designRequestId}&productCategory=${productCategory}`);
    }

    async getFeaturedArticles() {
        return this.request('GET', `/market-articles/featured`);
    }

    async syncMarketArticles() {
        return this.request('POST', `/market-articles/sync`);
    }
}

// Initialize API client
const designAPI = new DesignPortalAPI();

// UI Manager for Design Portal
class DesignPortalUI {
    constructor() {
        this.currentDesignRequest = null;
        this.currentInquiry = null;
        this.designSuggestions = [];
        this.marketArticles = [];
    }

    async loadDesignGallery() {
        try {
            const response = await designAPI.getAllDesignRequests();
            const requests = response.data || [];
            
            const gallery = document.getElementById('designGalleryGrid');
            gallery.innerHTML = '';

            requests.forEach(request => {
                const card = this.createDesignCard(request);
                gallery.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading gallery:', error);
        }
    }

    createDesignCard(design) {
        const card = document.createElement('div');
        card.className = 'design-card';
        
        card.innerHTML = `
            <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); height: 200px; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fas fa-image text-5xl opacity-50"></i>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2">${design.projectName}</h3>
                <p class="text-gray-600 text-sm mb-2">${design.roomType}</p>
                <div class="flex gap-2 flex-wrap mb-3">
                    <span class="style-badge style-${design.stylePreference?.toLowerCase() || 'modern'}">${design.stylePreference}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">${new Date(design.createdAt).toLocaleDateString()}</span>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full" style="background: ${this.getStatusColor(design.status)}; color: white;">
                        ${design.status}
                    </span>
                </div>
            </div>
        `;

        return card;
    }

    async loadMarketArticles() {
        try {
            const response = await designAPI.getFeaturedArticles();
            const articles = response.data || [];
            
            const grid = document.getElementById('articlesGrid');
            grid.innerHTML = '';

            articles.forEach(article => {
                const card = this.createArticleCard(article);
                grid.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg overflow-hidden shadow-sm card-hover';
        
        card.innerHTML = `
            <div style="background: #e2e8f0; height: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-shopping-cart text-3xl text-gray-400"></i>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2">${article.title}</h3>
                <p class="text-gray-600 text-sm mb-3">${article.brand || 'Online Store'}</p>
                <div class="flex justify-between items-center">
                    <span class="text-yellow-500">
                        <i class="fas fa-star"></i> ${article.rating || 4.5}
                    </span>
                    <a href="${article.articleUrl}" target="_blank" class="text-gold font-semibold text-sm">View →</a>
                </div>
            </div>
        `;

        return card;
    }

    getStatusColor(status) {
        const colors = {
            'PENDING': '#cbd5e0',
            'IN_PROGRESS': '#fbbf24',
            'COMPLETED': '#10b981',
            'REJECTED': '#ef4444'
        };
        return colors[status] || '#cbd5e0';
    }
}

// Initialize UI Manager
const designPortalUI = new DesignPortalUI();

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    designPortalUI.loadDesignGallery();
    designPortalUI.loadMarketArticles();
});
