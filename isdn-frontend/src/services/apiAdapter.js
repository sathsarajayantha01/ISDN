/**
 * API Adapter for IslandLink System
 * Centralized API handling with authentication and error management
 */

const API_BASE_URL = "http://localhost:3100/isdn/api";

class ApiAdapter {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from localStorage
   */
  getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Set authentication token in localStorage
   */
  setToken(token) {
    localStorage.setItem("token", token);
  }

  /**
   * Remove authentication token from localStorage
   */
  removeToken() {
    localStorage.removeItem("token");
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();

    const headers = {
      Accept: "application/json",
      ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Try to parse JSON response regardless of status code
      const data = await response.json();

      // If response is not ok and data doesn't have success property, add it
      if (!response.ok && !data.hasOwnProperty("success")) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          data: null,
        };
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      // Return a structured error response
      return {
        success: false,
        message: error.message || "Network error occurred",
        data: null,
      };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, headers = {}, params = {}) {
    return this.request(endpoint, {
      method: "GET",
      headers,
      params,
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers,
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, headers = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

// Export singleton instance
export const apiAdapter = new ApiAdapter();
