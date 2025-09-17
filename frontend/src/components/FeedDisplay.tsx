// File: src/components/FeedDisplay.tsx
// React + TypeScript component for displaying posts in the ACE Feed
// This component fetches and displays posts from the API
// Features:
// 1. Fetches posts from GET /api/posts endpoint
// 2. Displays posts in reverse chronological order (newest first)
// 3. Shows post type (NEED/HAVE), content, and createdAt timestamp
// 4. Handles loading state with spinner
// 5. Handles error states with user-friendly messages
// 6. Uses Material-UI components for consistent styling
// 7. Uses the existing Post interface for type safety

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Paper,
  CardMedia
} from "@mui/material";
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import { Post, PostType } from "../types/Post";
import { getAuthHeader } from "../utils/auth";

interface FeedDisplayProps {
  refreshTrigger?: number; // Optional prop to trigger refresh when posts are added
  searchQuery?: string; // Optional search query
  filterType?: PostType | "ALL"; // Optional type filter
}

const FeedDisplay: React.FC<FeedDisplayProps> = ({ refreshTrigger, searchQuery, filterType }) => {
  // State for posts data
  const [posts, setPosts] = useState<Post[]>([]);

  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Function to fetch posts from API
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (filterType && filterType !== 'ALL') {
        params.append('type', filterType);
      }

      const response = await fetch(`/api/posts?${params.toString()}`, {
        headers: {
          ...getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      const data: Post[] = await response.json();

      // Sort posts in reverse chronological order (newest first)
      const sortedPosts = data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]); // Only include searchQuery and filterType as dependencies

  // Fetch posts on component mount and when search parameters or refreshTrigger changes
  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger, fetchPosts]); // Only include refreshTrigger and fetchPosts

  // Helper function to get the appropriate icon for post type
  const getTypeIcon = (type: PostType) => {
    return type === 'NEED' ? <NeedIcon /> : <HaveIcon />;
  };

  // Helper function to get the appropriate color for post type
  const getTypeColor = (type: PostType) => {
    return type === 'NEED' ? 'error' : 'success';
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Uses user's locale for date/time formatting
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'background.paper' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {searchQuery || filterType !== 'ALL' ? 'No matching posts found' : 'No posts yet'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchQuery || filterType !== 'ALL' 
            ? 'Try adjusting your search or filter criteria'
            : 'Be the first to share what you NEED or what you HAVE to offer!'}
        </Typography>
      </Paper>
    );
  }

  // Posts display
  return (
    <Stack spacing={2}>
      {posts.map((post) => (
        <Card key={post.id} elevation={1} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.primary" fontWeight="medium">
                  {post.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(post.createdAt)}
                </Typography>
              </Box>
              <Chip
                icon={getTypeIcon(post.type)}
                label={post.type}
                color={getTypeColor(post.type)}
                variant="filled"
                size="small"
              />
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {post.content}
            </Typography>
            {post.imageUrl && (
              <Box sx={{ mt: 2 }}>
                <CardMedia
                  component="img"
                  image={post.imageUrl}
                  alt="Post image"
                  sx={{
                    maxHeight: 400,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default FeedDisplay;