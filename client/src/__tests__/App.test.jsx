import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('KrishiSetu React Frontend Suite', () => {
  it('renders landing page with headline and branding', () => {
    render(<App />);
    expect(screen.getAllByText(/KrishiSetu/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Better Decisions/i)).toBeInTheDocument();
    expect(screen.getByText(/Stronger Markets/i)).toBeInTheDocument();
  });

  it('renders agricultural call to action buttons', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
  });
});
