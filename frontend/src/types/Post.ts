export type PostType = 'NEED' | 'HAVE';

export interface Post {
  id: string;
  type: PostType;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
  imageUrl?: string;
}

// Authentication Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}