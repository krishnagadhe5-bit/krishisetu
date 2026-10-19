import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('KrishiSetu React Frontend Suite', () => {
  it('renders landing page with headline and branding', () => {
    render(<App />);
    expect(screen.getAllByText(/KrishiSetu/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Better Decisions/i)).toBeInTheDocument();
    expect(screen.getByText(/Stronger Markets/i)).toBeInTheDocument();
  });

  it('renders all 4 main navbar links (Home, Marketplace, Govt Schemes, Agro Intelligence)', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Marketplace$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Govt Schemes$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Agro Intelligence$/i })).toBeInTheDocument();
  });

  it('renders action buttons on header', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('renders language switcher with Marathi and Hindi options', () => {
    render(<App />);
    const langBtn = screen.getByRole('button', { name: /Select Language/i });
    expect(langBtn).toBeInTheDocument();

    // Click to open language selector
    fireEvent.click(langBtn);
    expect(screen.getByText('मराठी')).toBeInTheDocument();
    expect(screen.getByText('हिंदी')).toBeInTheDocument();

    // Select Marathi
    fireEvent.click(screen.getByText('मराठी'));
    // Verify that navigation switches to Marathi
    expect(screen.getByText('मुख्यपृष्ठ')).toBeInTheDocument();
  });
});
