import React, { ReactNode } from 'react';
import { Grid, useMediaQuery, useTheme } from '@mui/material';

interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
  containerProps?: any;
  itemProps?: any;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 2,
  containerProps = {},
  itemProps = {},
  xs = 12,
  sm = 6,
  md = 4,
  lg = 3,
  xl = 3,
  className = ''
}) => {
  const theme = useTheme();
  
  // 根据屏幕大小自动调整间距
  const getAdjustedSpacing = () => {
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return isMobile ? spacing - 1 : spacing;
  };

  // 单个子元素的特殊处理
  const renderItem = (child: ReactNode, index: number) => {
    return (
      <Grid 
        item 
        key={index}
        xs={xs}
        sm={sm}
        md={md}
        lg={lg}
        xl={xl}
        {...itemProps}
      >
        {child}
      </Grid>
    );
  };

  return (
    <Grid 
      container 
      spacing={getAdjustedSpacing()}
      className={className}
      {...containerProps}
    >
      {React.isValidElement(children) && !children.type.toString().includes('Grid') ? (
        renderItem(children, 0)
      ) : (
        React.Children.map(children, (child, index) => 
          React.isValidElement(child) ? (
            child.type.toString().includes('Grid') ? child : renderItem(child, index)
          ) : null
        )
      )}
    </Grid>
  );
};

// 响应式卡片网格组件
interface ResponsiveCardGridProps extends ResponsiveGridProps {
  cards: ReactNode[];
}

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  cards,
  ...props
}) => {
  return (
    <ResponsiveGrid {...props}>
      {cards.map((card, index) => (
        <React.Fragment key={index}>
          {card}
        </React.Fragment>
      ))}
    </ResponsiveGrid>
  );
};

// 响应式内容区域组件
interface ResponsiveContentProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  centerContent?: boolean;
  className?: string;
}

export const ResponsiveContent: React.FC<ResponsiveContentProps> = ({
  children,
  maxWidth = 'lg',
  centerContent = true,
  className = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <div 
      className={`${className} ${centerContent ? 'mx-auto' : ''}`}
      style={{
        maxWidth: maxWidth ? theme.breakpoints.values[maxWidth] : 'none',
        width: '100%',
        padding: isMobile ? '16px' : '24px'
      }}
    >
      {children}
    </div>
  );
};

// 响应式Flex容器
interface ResponsiveFlexProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  gap?: number;
  responsiveDirection?: boolean;
  className?: string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  gap = 0,
  responsiveDirection = true,
  className = ''
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const flexDirection = responsiveDirection && isMobile ? 'column' : direction;
  
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection,
        justifyContent: justify,
        alignItems: align,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
};

// 响应式断点检测Hook
export const useResponsiveBreakpoints = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentWidth: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'largeDesktop'
  };
};