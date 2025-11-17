import axiosInstance from "../libs/axios";
export default {
  signIn: (body) => {
    return axiosInstance.post("/auth/sign-in", body);
  },
  sendOtp: (email) => axiosInstance.post("/auth/send-otp", { email }),
  verifyOtp: (email, otp) =>
    axiosInstance.post("/auth/verify-account", { email, otp }),
  signUp: (body) => axiosInstance.post("/auth/sign-up", body),
  signOut: (body) => {
    return axiosInstance.post("/auth/sign-out", body);
  },
  verifyForgotPassword: (email, otp) =>
    axiosInstance.post("/auth/verify-forgot-password", { email, otp }),
  resetPassword: (email, password, code) =>
    axiosInstance.put("/auth/reset-password", { email, password, code }),
  getProfile: () => axiosInstance.get("/user/get-profile"),
  updateProfile: (data) => {
    return axiosInstance.put("/user/update-profile", data)
  },
  createFavoriteRoom: (data, token = null) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    return axiosInstance.post("/user/favorite-room", data, config);
  },
  /**
   * Get favorite rooms with optional pagination.
   * If you want to fetch all favorites in one request while still receiving pagination metadata,
   * call with { full: true } and this will send page:1 and limit: Number.MAX_SAFE_INTEGER to the API.
   *
   * params: { page, limit, roomId, full }
   */
  getFavoriteRooms: (params = {}) => {
    // allow shorthand: getFavoriteRooms({ full: true }) to request the full list
    const p = { ...params };
    if (p.full) {
      p.page = 1;
      p.limit = Number.MAX_SAFE_INTEGER;
      delete p.full;
    }
    // console.log('Getting favorite rooms with params:', p);
    return axiosInstance.get('/user/favorite-room', { params: p });
  },
  deleteFavoriteRoom: (favoriteId) => {
    return axiosInstance.delete(`/user/favorite-room/${favoriteId}`);
  },
  createFavoriteService: (data, token = null) => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    return axiosInstance.post("/user/favorite-service", data, config);
  },
  /**
   * Get favorite services with optional pagination.
   * If you want to fetch all favorites in one request while still receiving pagination metadata,
   * call with { full: true } and this will send page:1 and limit: Number.MAX_SAFE_INTEGER to the API.
   *
   * params: { page, limit, serviceId, full }
   */
  getFavoriteServices: (params = {}) => {
    const p = { ...params };
    if (p.full) {
      p.page = 1;
      p.limit = Number.MAX_SAFE_INTEGER;
      delete p.full;
    }
    return axiosInstance.get('/user/favorite-service', { params: p });
  },
  deleteFavoriteService: (favoriteId) => {
    return axiosInstance.delete(`/user/favorite-service/${favoriteId}`);
  },
  /**
   * Create feedback with rating and comment.
   * Token is automatically included via axios interceptor.
   * Endpoint: POST /user/feedback
   */
  createFeedback: (data) => {
    return axiosInstance.post('/feedback', data);
  },
  /**
   * Get feedbacks with optional pagination.
   * Token is automatically included via axios interceptor.
   * Endpoint: GET /user/feedback
   */
  getFeedbacks: (params = {}) => {
    return axiosInstance.get('/feedback', { params });
  },

  /**
   * Get user tiers with pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.tierSlug] - Filter by tier slug
   * @returns {Promise} Axios response
   */
  getUserTiers: (params = {}) => {
    return axiosInstance.get('/user/tier', {
      params: {
        page: 1,
        limit: 10,
        ...params
      }
    });
  },
  createTier: (data) => {
    return axiosInstance.post('/user/tier', data);
  },

  updateTier: (id, data) => {
    return axiosInstance.put(`/user/tier/${id}`, data);
  },
  deleteTier: (id) => {
    return axiosInstance.delete(`/user/tier/${id}`);
  }
};
