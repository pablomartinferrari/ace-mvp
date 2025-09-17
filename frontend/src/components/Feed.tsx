// File: src/components/Feed.tsx
// React + TypeScript component for ACE Feed with Material-UI styling
// This component allows a user to create a new post (NEED or HAVE) and view the feed
// Features:
// 1. A controlled form with a text input for the post content
// 2. A dropdown to select post type: "NEED" or "HAVE"
// 3. Submit button that sends a POST request to /api/posts
// 4. On successful submission, the new post is prepended to the feed
// 5. Feed displays all posts in reverse chronological order
// 6. Uses TypeScript interfaces and types for type safety
// 7. Material-UI components for modern, professional styling

import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Stack,
  SelectChangeEvent,
  Popover,
  Fab
} from "@mui/material";
import {
  Add as AddIcon,
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  PhotoCamera as PhotoIcon
} from "@mui/icons-material";
import { Post, PostType } from "../types/Post";
import FeedDisplay from "./FeedDisplay";
import { getAuthHeader } from "../utils/auth";
import { useAuth } from "../contexts/AuthContext";

// TODO: Use fetch or Axios to call the backend API
// TODO: Implement proper error handling
// TODO: Connect with real-time updates later using Socket.IO or similar

const Feed: React.FC = () => {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<PostType | "ALL">("ALL");

  // State for new post
  const [content, setContent] = useState<string>("");
  const [type, setType] = useState<PostType>("NEED");
  const [image, setImage] = useState<File | null>(null);

  // State for submission
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State for triggering refresh of FeedDisplay
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // State for Popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  // Get authenticated user
  const { user } = useAuth();

  // Function to submit new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter some content for your post.');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('type', type);
      formData.append('userId', user.id);

      if (type === 'HAVE' && image) {
        formData.append('image', image);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      await response.json();

      // Clear form and trigger refresh
      setContent("");
      setType("NEED");
      setImage(null);
      setError("");
      setRefreshTrigger(prev => prev + 1);
      handleClosePopover(); // Close the popover on successful post
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Your ACE in commercial estate
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Be the ACE of deals
      </Typography>

      {/* Create Post FAB */}
      <Fab
        color="primary"
        onClick={handleOpenPopover}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: 500 },
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Post
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={(e) => {
            handleSubmit(e).then(() => {
              if (!error) handleClosePopover();
            });
          }} encType="multipart/form-data">
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="What's on your mind?"
                placeholder="Describe what you need or what you have to offer..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                required
              />

              <FormControl fullWidth>
                <InputLabel>Post Type</InputLabel>
                <Select
                  value={type}
                  label="Post Type"
                  onChange={(e: SelectChangeEvent) => setType(e.target.value as PostType)}
                >
                  <MenuItem value="NEED">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NeedIcon color="error" />
                      NEED - I need this
                    </Box>
                  </MenuItem>
                  <MenuItem value="HAVE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HaveIcon color="success" />
                      HAVE - I have this to offer
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {type === 'HAVE' && (
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImage(file);
                    }}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoIcon />}
                      sx={{ width: '100%' }}
                    >
                      {image ? `Selected: ${image.name}` : 'Add Image (Optional)'}
                    </Button>
                  </label>
                  {image && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      File size: {(image.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleClosePopover}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Popover>

      {/* Posts Feed */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Community Posts
        </Typography>
        
        {/* Search and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search posts..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              sx: { backgroundColor: 'background.paper' }
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={filterType}
              onChange={(e: SelectChangeEvent) => setFilterType(e.target.value as PostType | 'ALL')}
              size="small"
              sx={{ backgroundColor: 'background.paper' }}
            >
              <MenuItem value="ALL">All Posts</MenuItem>
              <MenuItem value="NEED">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NeedIcon color="error" fontSize="small" />
                  NEED
                </Box>
              </MenuItem>
              <MenuItem value="HAVE">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HaveIcon color="success" fontSize="small" />
                  HAVE
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <FeedDisplay 
        refreshTrigger={refreshTrigger} 
        searchQuery={searchQuery} 
        filterType={filterType}
      />
    </Container>
  );
};

export default Feed;