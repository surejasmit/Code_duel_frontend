import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Map backend API user response to frontend User type
 */
const mapApiUserToUser = (userData: unknown): User => {
  const data = userData as {
    id: string;
    username?: string;
    name?: string;
    email: string;
    leetcodeUsername?: string;
    avatar?: string;
    createdAt?: string;
  };
  const username = data.username || data.name || "user";
  return {
    id: data.id,
    name: data.name || username,
    username,
    email: data.email,
    leetcodeUsername: data.leetcodeUsername || "",
    avatar:
      data.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    createdAt: data.createdAt,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user");

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      try {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          const mappedUser = mapApiUserToUser(response.data);
          localStorage.setItem("user", JSON.stringify(mappedUser));
          setUser(mappedUser);
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error: unknown) {
        console.error("Profile fetch unsuccessful during session restore:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(emailOrUsername, password);

      if (!response.success || !response.data) {
        return { success: false, message: response.message || "Login failed" };
      }

      const { user: userData, token } = response.data;
      const mappedUser = mapApiUserToUser(userData);

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);

      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: "mock-id",
          name: emailOrUsername.split("@")[0] || emailOrUsername,
          email: emailOrUsername.includes("@")
            ? emailOrUsername
            : `${emailOrUsername}@example.com`,
          leetcodeUsername: emailOrUsername.split("@")[0] || emailOrUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(
        email,
        username,
        password,
        leetcodeUsername
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }

      const { user: userData, token } = response.data;
      const mappedUser = mapApiUserToUser(userData);

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setUser(mappedUser);

      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock registration for UI preview.");
        const mockUser: User = {
          id: "mock-id",
          name: username,
          email: email,
          leetcodeUsername: leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
