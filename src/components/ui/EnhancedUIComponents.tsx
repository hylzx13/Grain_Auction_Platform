import React, { ReactNode, useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Fab,
  Fade,
  Modal,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useResponsiveBreakpoints } from '../layouts/ResponsiveGrid';

interface FloatingActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'inherit' | 'default';
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
  tooltip?: string;
  animate?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  color = 'primary',
  position = { bottom: 24, right: 24 },
  size = 'medium',
  className = '',
  tooltip = '',
  animate = true
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  const adjustedSize = isMobile ? 'small' : size;

  const fab = (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: animate ? [1, 1.05, 1] : 1,
        opacity: 1,
        transition: {
          scale: animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 },
          opacity: { duration: 0.3 }
        }
      }}
    >
      <Fab
        color={color}
        size={adjustedSize}
        onClick={onClick}
        sx={{
          position: 'fixed',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          ...position
        }}
        className={className}
      >
        {icon}
      </Fab>
    </motion.div>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="left">
        {fab}
      </Tooltip>
    );
  }

  return fab;
};

interface LoadingIndicatorProps {
  open?: boolean;
  message?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  size?: 'small' | 'medium' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  open = true,
  message = '加载中...',
  fullScreen = false,
  color = 'primary',
  size = 'medium'
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  const adjustedSize = isMobile ? 'small' : size;

  const spinnerSize =
    adjustedSize === 'small' ? 40 : adjustedSize === 'medium' ? 60 : 80;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress color={color} size={spinnerSize} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop open={open} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        {content}
      </Backdrop>
    );
  }

  return open ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}
    >
      {content}
    </Box>
  ) : null;
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e0e0e0'
      }}
      initial={{ opacity: 0.5 }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    />
  );
};

interface CardSkeletonProps {
  height?: string | number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  height = 280,
  className = ''
}) => {
  return (
    <Paper elevation={1} className={className} sx={{ p: 3, height }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton height="40%" borderRadius="8px" />
        <Skeleton width="80%" height="20px" />
        <Skeleton height="16px" />
        <Skeleton width="60%" height="16px" />
        <Box sx={{ mt: 'auto' }}>
          <Skeleton width="40%" height="40px" borderRadius="4px" />
        </Box>
      </Box>
    </Paper>
  );
};

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity?: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  onClose,
  severity = 'info',
  autoHideDuration = 3000
}) => {
  const getBackgroundColor = () => {
    switch (severity) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, onClose, autoHideDuration]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ top: -20, opacity: 0 }}
          animate={{ top: 80, opacity: 1 }}
          exit={{ top: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: getBackgroundColor(),
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '90%'
          }}
        >
          <Typography variant="body2">{message}</Typography>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface EnhancedModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableBackdropClick?: boolean;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  open,
  onClose,
  children,
  title,
  fullWidth = false,
  maxWidth = 'md',
  disableBackdropClick = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      closeAfterTransition
      slots={{ backdrop: Fade }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : fullWidth ? '100%' : theme.breakpoints.values[maxWidth],
            maxWidth: isMobile ? '90%' : 'none',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {title && (
            <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              {title}
            </Typography>
          )}
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

interface ExpandablePanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  icon?: ReactNode;
}

export const ExpandablePanel: React.FC<ExpandablePanelProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper elevation={1} sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
      <Button
        fullWidth
        onClick={() => setExpanded((prev) => !prev)}
        startIcon={icon}
        sx={{
          justifyContent: 'flex-start',
          p: 3,
          textTransform: 'none',
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" fontWeight="medium">
            {title}
          </Typography>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <Typography variant="body1">{expanded ? '▲' : '▼'}</Typography>
          </motion.div>
        </Box>
      </Button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>{children}</Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};
