import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(emailOrUsername, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Map backend user to frontend User type
        const mappedUser: User = {
          id: userData.id,
          name: userData.username,
          email: userData.email,
          leetcodeUsername: userData.leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      // Allow mock login in development if backend is not found
      if (error.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: emailOrUsername.split('@')[0],
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          leetcodeUsername: emailOrUsername.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Login failed";
      throw new Error(errorMessage);
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

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Map backend user to frontend User type
        const mappedUser: User = {
          id: userData.id,
          name: userData.username,
          email: userData.email,
          leetcodeUsername: userData.leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        };

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      // Allow mock registration in development if backend is not found
      if (error.message === "Network Error") {
        console.warn("Backend not found. Using mock registration for UI preview.");
        const mockUser: User = {
          id: 'mock-id',
          name: username,
          email: email,
          leetcodeUsername: leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Registration failed";
      throw new Error(errorMessage);
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
