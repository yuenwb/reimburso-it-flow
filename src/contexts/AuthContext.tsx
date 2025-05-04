
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

export type UserRole = "employee" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "employee@company.com": {
    password: "password123",
    user: {
      id: "1",
      name: "John Employee",
      email: "employee@company.com",
      role: "employee",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  "manager@company.com": {
    password: "password123",
    user: {
      id: "2",
      name: "Sarah Manager",
      email: "manager@company.com",
      role: "manager",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  },
  "admin@company.com": {
    password: "password123",
    user: {
      id: "3",
      name: "Alex Admin",
      email: "admin@company.com",
      role: "admin",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage on initial load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const userRecord = MOCK_USERS[email.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
    
    // Set user and store in localStorage
    setUser(userRecord.user);
    localStorage.setItem("user", JSON.stringify(userRecord.user));
    toast.success(`Welcome back, ${userRecord.user.name}!`);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You have been logged out");
  };

  const hasPermission = (requiredRole: UserRole) => {
    if (!user) return false;
    
    // Role hierarchy: admin > manager > employee
    if (user.role === "admin") return true;
    if (user.role === "manager" && requiredRole !== "admin") return true;
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
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
