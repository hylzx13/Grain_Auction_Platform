import React, { useEffect, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  ListItemIcon,
  Button,
} from '@mui/material'
import { Menu, Home, ShoppingCart, PieChart, LogOut, Users, User, BarChart3, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useResponsiveBreakpoints } from './layouts/ResponsiveGrid'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isTablet } = useResponsiveBreakpoints()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { text: 'Home', icon: <Home size={18} />, path: '/', roles: ['all'] },
    { text: 'Auctions', icon: <PieChart size={18} />, path: '/auctions', roles: ['all'] },
    { text: 'Create Auction', icon: <PieChart size={18} />, path: '/auction/create', roles: ['farmer', 'admin'] },
    { text: 'Dealer Center', icon: <ShoppingCart size={18} />, path: '/dealer-center', roles: ['dealer'] },
    { text: 'User Management', icon: <Users size={18} />, path: '/admin/users', roles: ['admin'] },
    { text: 'Profile', icon: <User size={18} />, path: '/profile', roles: ['all'] },
    { text: 'Analytics', icon: <BarChart3 size={18} />, path: '/analytics', roles: ['all'] },
    { text: 'Content', icon: <FileText size={18} />, path: '/content-display', roles: ['all'] },
  ]

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes('all') || (user && item.roles.includes(user.role))
  )

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <motion.div key={item.path} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
      <ListItem
        button
        component={Link}
        to={item.path}
        onClick={() => setDrawerOpen(false)}
        sx={{
          borderRadius: '8px',
          margin: '4px 8px',
          '&.active': {
            bgcolor: 'rgba(76, 175, 80, 0.1)',
            '& .MuiListItemText-primary': { color: 'primary.main' },
            '& .MuiListItemIcon-root': { color: 'primary.main' },
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItem>
    </motion.div>
  )

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          G
        </Box>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Grain Auction
        </Typography>
      </Box>
      <Divider />
      <List>
        {filteredMenuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {renderMenuItem(item)}
          </motion.div>
        ))}
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        {user ? (
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={18} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <ListItem button component={Link} to="/login">
              <ListItemIcon>
                <Users size={18} />
              </ListItemIcon>
              <ListItemText primary="Login / Register" />
            </ListItem>
          </motion.div>
        )}
      </Box>
    </Box>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'background.paper',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          '& .MuiTypography-root': { color: scrolled ? 'text.primary' : 'inherit' },
          '& .MuiButton-root': { color: scrolled ? 'text.primary' : 'inherit' },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: scrolled ? 'text.primary' : 'inherit' }}
            >
              <Menu />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                G
              </Box>
              <Typography
                variant="h6"
                sx={{ marginLeft: 1 }}
                color={scrolled ? 'primary' : 'inherit'}
                fontWeight="bold"
              >
                Grain Auction
              </Typography>
            </Link>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {filteredMenuItems.map((item) => (
                <motion.div key={item.path} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Button
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{
                      marginLeft: 2,
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: 0,
                        height: 2,
                        bottom: 6,
                        left: '50%',
                        backgroundColor: 'primary.main',
                        transition: 'all 0.3s ease',
                      },
                      '&:hover:after': {
                        width: '80%',
                        left: '10%',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                </motion.div>
              ))}
              {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleLogout}
                      sx={{ borderRadius: '20px' }}
                    >
                      Logout
                    </Button>
                  </motion.div>
                </Box>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Button
                    component={Link}
                    to="/login"
                    variant={scrolled ? 'contained' : 'text'}
                    color="primary"
                    size="small"
                    sx={scrolled ? { borderRadius: '20px' } : {}}
                  >
                    Login
                  </Button>
                </motion.div>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isTablet ? 280 : 250,
            maxWidth: '80vw',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>{drawerContent}</div>
      </Drawer>
      <Container sx={{ py: { xs: 2, md: 4 }, mt: 8 }}>{children}</Container>
      <Box sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto', boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Copyright 2024 Grain Auction Platform
          </Typography>
        </Container>
      </Box>
    </div>
  )
}

export default Layout
