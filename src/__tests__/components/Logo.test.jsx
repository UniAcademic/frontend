import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from '@/components/Logo';

describe('Logo', () => {
  it('renders with default text "UniAcademic"', () => {
    render(<Logo />);
    expect(screen.getByText('UniAcademic')).toBeInTheDocument();
  });

  it('renders the insights icon', () => {
    const { container } = render(<Logo />);
    const icon = container.querySelector('.material-symbols-outlined');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('insights');
  });

  it('applies custom className', () => {
    const { container } = render(<Logo className="my-custom-class" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('my-custom-class');
  });

  it('applies custom textColor', () => {
    render(<Logo textColor="text-red-500" />);
    const heading = screen.getByText('UniAcademic');
    expect(heading).toHaveClass('text-red-500');
  });

  it('uses default text color when not specified', () => {
    render(<Logo />);
    const heading = screen.getByText('UniAcademic');
    expect(heading.className).toContain('text-slate-900');
  });
});
