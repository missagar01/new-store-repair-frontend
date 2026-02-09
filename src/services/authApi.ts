// Authentication API Services
import { apiRequest, setToken, removeToken } from "../config/api";

export interface LoginRequest {
  user_name?: string;
  employee_id?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    user_name: string;
    employee_id?: string;
    role: string;
    access?: string[];
    store_role_access?: string;
  };
  message?: string;
}

export const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.token) {
      setToken(response.token);
    }

    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    removeToken();
  },
};
