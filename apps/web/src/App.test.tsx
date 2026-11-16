import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { App } from './App';

vi.mock('./api', () => ({
  api: { inventory: vi.fn().mockRejectedValue(new Error('Not Implemented')) },
}));

it('renders the workspace and reports API errors', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Every item, accounted for');
  expect(await screen.findByRole('alert')).toHaveTextContent('Not Implemented');
  expect(screen.getByRole('button', { name: /Refresh inventory/ })).toBeEnabled();
});
