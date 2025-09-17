// MyStuffPage.tsx
// React + TypeScript component for displaying user's own posts
// Features:
// 1. Fetches posts created by the currently logged-in user
// 2. Displays posts in a responsive grid with post details
// 3. Provides Edit and Delete functionality for each post
// 4. Uses Material-UI components for consistent styling
// 5. Handles loading states and error handling

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Paper
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  PhotoCamera as PhotoIcon
} from "@mui/icons-material";
import { Post, PostType } from "../types/Post";
import { useAuth } from "../contexts/AuthContext";
import { getAuthHeader } from "../utils/auth";

const MyStuffPage: React.FC = () => {
  // State for posts data
  const [posts, setPosts] = useState<Post[]>([]);

  // State for UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Get authenticated user
  const { user } = useAuth();

  // Function to fetch user's posts
  const fetchUserPosts = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/posts?userId=${user.id}`, {
        headers: {
          ...getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }

      const data: Post[] = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle post deletion
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove the post from the local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (post: Post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // Function to close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // Function to handle edit (placeholder for now)
  const handleEditPost = (post: Post) => {
    // TODO: Implement edit functionality
    console.log('Edit post:', post);
  };

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
    return date.toLocaleString();
  };

  // Fetch posts on component mount and when user changes
  useEffect(() => {
    fetchUserPosts();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        My Stuff
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Manage your posts and offers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'background.paper' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No posts yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't created any posts yet. Create your first post to get started!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}>
          {posts.map((post) => (
            <Card key={post.id} elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {post.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt="Post image"
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    icon={getTypeIcon(post.type)}
                    label={post.type}
                    color={getTypeColor(post.type)}
                    variant="filled"
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(post.createdAt)}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                  {post.content}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPost(post)}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => openDeleteDialog(post)}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
          {postToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                "{postToDelete.content}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePost}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyStuffPage;