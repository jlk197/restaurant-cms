import { render, screen } from '@testing-library/react';
import Preloader from './Preloader';

describe('Preloader Component', () => {
  it('should render preloader', () => {
    const { container } = render(<Preloader />);
    
    expect(container.querySelector('.preloader')).toBeInTheDocument();
  });

  it('should have correct structure', () => {
    const { container } = render(<Preloader />);
    
    const preloader = container.querySelector('.preloader');
    expect(preloader).toBeInTheDocument();
  });
});

