import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Switch, FormControlLabel, Paper, Typography, ButtonGroup, Button, CircularProgress, AppBar, Toolbar, IconButton } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Palette as PaletteIcon, Logout as LogoutIcon, Home as HomeIcon, AccountCircle as AccountIcon, AddBusiness } from '@mui/icons-material';
import Feed from './components/Feed';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import MyStuffPage from './components/MyStuffPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Material Design 2 Light Theme
const md2LightTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes tagline1': {
          '0%, 33%': { opacity: 1 },
          '34%, 100%': { opacity: 0 }
        },
        '@keyframes tagline2': {
          '0%, 33%': { opacity: 0 },
          '34%, 66%': { opacity: 1 },
          '67%, 100%': { opacity: 0 }
        },
        '@keyframes tagline3': {
          '0%, 66%': { opacity: 0 },
          '67%, 100%': { opacity: 1 }
        }
      }
    }
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Classic MD2 blue
    },
    secondary: {
      main: '#dc004e', // MD2 pink/red
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.167,
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
    },
  },
  shape: {
    borderRadius: 4, // MD2 uses 4px border radius
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 3px 6px 0px rgba(0,0,0,0.2), 0px 3px 6px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 500,
          borderRadius: 4,
        },
        contained: {
          boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

// Material Design 2 Dark Theme
const md2DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Lighter blue for dark mode
    },
    secondary: {
      main: '#f48fb1', // Lighter pink for dark mode
    },
    background: {
      default: '#303030', // MD2 dark background
      paper: '#424242', // MD2 dark paper
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.167,
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 3px 6px 0px rgba(0,0,0,0.2), 0px 3px 6px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 500,
          borderRadius: 4,
        },
        contained: {
          boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
  },
});

// Modern Material Design 3 Theme (current)
const md3LightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

const md3DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

type ThemeType = 'md2' | 'md3';

// AppContent component that uses authentication context
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [themeType, setThemeType] = React.useState<ThemeType>('md2');

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleThemeTypeChange = (type: ThemeType) => {
    setThemeType(type);
  };

  const getCurrentTheme = () => {
    if (themeType === 'md2') {
      return isDarkMode ? md2DarkTheme : md2LightTheme;
    } else {
      return isDarkMode ? md3DarkTheme : md3LightTheme;
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={md2DarkTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={getCurrentTheme()}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          {/* Navigation Bar - only show when authenticated */}
          {isAuthenticated && (
            <AppBar position="static" elevation={1}>
              <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ACE <AddBusiness />
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 2,
                      opacity: 0.8,
                      animation: 'fadeInOut 12s infinite',
                      '@keyframes fadeInOut': {
                        '0%, 33%': { opacity: 0.8 },
                        '16.5%': { opacity: 0 },
                        '50%, 83%': { opacity: 0.8 },
                        '66.5%': { opacity: 0 }
                      }
                    }}
                  >
                    {['Be the ACE of deals', 'Your ACE in commercial real estate', 'Always connected everywhere']
                      .map((text, i) => (
                        <span
                          key={i}
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            animation: `tagline${i + 1} 12s infinite`,
                            animationDelay: '0s'
                          }}
                        >
                          {text}
                        </span>
                      ))}
                  </Typography>
                </Box>

                <Button
                  color="inherit"
                  startIcon={<HomeIcon />}
                  href="/"
                  sx={{ mr: 2 }}
                >
                  Feed
                </Button>

                <Button
                  color="inherit"
                  startIcon={<AccountIcon />}
                  href="/my-stuff"
                >
                  My Stuff
                </Button>
              </Toolbar>
            </AppBar>
          )}

          {/* Theme Controls - only show when authenticated */}
          {isAuthenticated && (
            <Paper
              elevation={1}
              sx={{
                position: 'fixed',
                top: 80,
                right: 16,
                zIndex: 1000,
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'background.paper',
                minWidth: 200,
              }}
            >
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon fontSize="small" />
                Theme Controls
              </Typography>

              {/* Theme Type Selector */}
              <ButtonGroup size="small" fullWidth>
                <Button
                  variant={themeType === 'md2' ? 'contained' : 'outlined'}
                  onClick={() => handleThemeTypeChange('md2')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  MD2
                </Button>
                <Button
                  variant={themeType === 'md3' ? 'contained' : 'outlined'}
                  onClick={() => handleThemeTypeChange('md3')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  MD3
                </Button>
              </ButtonGroup>

              {/* Dark/Light Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption">
                  {isDarkMode ? <DarkIcon fontSize="small" /> : <LightIcon fontSize="small" />}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkMode}
                      onChange={handleThemeToggle}
                      color="primary"
                      size="small"
                    />
                  }
                  label=""
                />
              </Box>

              {/* User Info and Logout */}
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Logged in as: {user?.name}
                </Typography>
                <Button
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                  fullWidth
                >
                  Logout
                </Button>
              </Box>
            </Paper>
          )}

          {/* Routes */}
          <Routes>
            {/* Protected routes - require authentication */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Feed />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/my-stuff"
              element={
                isAuthenticated ? (
                  <MyStuffPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Public routes - redirect to feed if already authenticated */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginForm
                    onSuccess={() => {
                      // User successfully logged in, will be handled by context
                    }}
                    onSwitchToRegister={() => {
                      window.location.href = '/register';
                    }}
                  />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegistrationForm
                    onSuccess={() => {
                      // User successfully registered, will be handled by context
                    }}
                    onSwitchToLogin={() => {
                      window.location.href = '/login';
                    }}
                  />
                )
              }
            />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

// Main App component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;