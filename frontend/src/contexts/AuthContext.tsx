// AuthContext.tsx
// React Context for managing authentication state
// Features:
// 1. Authentication state management (user, token, loading)
// 2. Login/logout functions
// 3. Automatic token validation on app start
// 4. Context provider for the entire app

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types/Post';
import { getToken, setToken, getUser, setUser, removeToken, removeUser, isAuthenticated } from '../utils/auth';
import { API_URL } from '../config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      const storedUser = getUser();

      if (token && storedUser && isAuthenticated()) {
        setUserState(storedUser);
      } else {
        // Clear invalid tokens
        removeToken();
        removeUser();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Don't set global loading state for individual login attempts
    // The form component handles its own loading state

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data: AuthResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response can't be parsed as JSON, create a generic error
        data = { success: false, message: 'Login failed. Please try again.' } as AuthResponse;
      }

      if (!response.ok) {
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      // Store authentication data
      setToken(data.token);
      setUser(data.user);
      setUserState(data.user);

    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    // Don't set global loading state for individual register attempts
    // The form component handles its own loading state

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      let data: AuthResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response can't be parsed as JSON, create a generic error
        data = { success: false, message: 'Registration failed. Please try again.' } as AuthResponse;
      }

      if (!response.ok) {
        throw new Error(data.message || `Registration failed (${response.status})`);
      }

      // Store authentication data
      setToken(data.token);
      setUser(data.user);
      setUserState(data.user);

    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};