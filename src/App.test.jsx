import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('renders the workshop shell with all workshop tabs and repeated prompt', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Agentic CRM Workshop Demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Old Software/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /L2 Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /L3 Components/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /L4 Compose/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /L5 Tools/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /L6 Shared State/i })).toBeInTheDocument();
    expect(screen.getByText(/Prepare my Q3 follow-up for Acme Corp/i)).toBeInTheDocument();
  });
});
