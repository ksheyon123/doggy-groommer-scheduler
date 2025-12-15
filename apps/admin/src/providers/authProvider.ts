import { AuthProvider } from "react-admin";

const apiUrl = "/api";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    // 관리자 로그인 API 호출
    const response = await fetch(`http://localhost:3001${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const { accessToken, user } = await response.json();
    localStorage.setItem("admin_token", accessToken);
    localStorage.setItem("admin_user", JSON.stringify(user));
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem("admin_token");
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const user = localStorage.getItem("admin_user");
    if (user) {
      const { id, name, email, profile_image } = JSON.parse(user);
      return Promise.resolve({
        id,
        fullName: name || email,
        avatar: profile_image,
      });
    }
    return Promise.reject();
  },

  getPermissions: () => {
    const user = localStorage.getItem("admin_user");
    if (user) {
      const { role } = JSON.parse(user);
      return Promise.resolve(role);
    }
    return Promise.resolve("");
  },
};
