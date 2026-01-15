import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('should render header with default navigation', () => {
    render(<Header />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Chefs')).toBeInTheDocument();
  });

  it('should render custom logo when provided in config', () => {
    const config = {
      header_logo: '/uploads/custom-logo.png'
    };

    render(<Header config={config} />);
    
    const logo = screen.getAllByAltText('klassy cafe html template')[0];
    expect(logo).toHaveAttribute('src', '/uploads/custom-logo.png');
  });

  it('should render default logo when no custom logo provided', () => {
    render(<Header config={{}} />);
    
    const logo = screen.getAllByAltText('klassy cafe html template')[0];
    expect(logo).toHaveAttribute('src', 'assets/images/klassy-logo.png');
  });

  it('should render with empty navigation array', () => {
    render(<Header navigation={[]} />);
    
    // Default navigation should still be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('.header-area')).toBeInTheDocument();
    expect(container.querySelector('.header-sticky')).toBeInTheDocument();
    expect(container.querySelector('.main-nav')).toBeInTheDocument();
  });
});

