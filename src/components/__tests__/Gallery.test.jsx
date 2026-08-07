import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Gallery from '../Gallery';

describe('Gallery Component', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Mock fetch to return empty list to use fallback images
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                headers: {
                    get: () => 'application/json',
                },
                json: () => Promise.resolve([]),
            })
        );
    });

    afterEach(() => {
        global.fetch.mockRestore();
    });

    test('renders Gallery header and description', async () => {
        render(<Gallery />);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Recently Completed Spaces/i);
        expect(screen.getByText(/Explore our latest projects/i)).toBeInTheDocument();
    });

    test('renders filter buttons with correct labels and default active', () => {
        render(<Gallery />);
        const allBtn = screen.getByRole('button', { name: /all/i });
        const residentialBtn = screen.getByRole('button', { name: /residential/i });
        const commercialBtn = screen.getByRole('button', { name: /commercial/i });

        expect(allBtn).toBeInTheDocument();
        expect(residentialBtn).toBeInTheDocument();
        expect(commercialBtn).toBeInTheDocument();

        // Default filter is 'all'
        expect(allBtn).toHaveAttribute('aria-pressed', 'true');
        expect(residentialBtn).toHaveAttribute('aria-pressed', 'false');
        expect(commercialBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('filter buttons change the filter state and ariat-pressed attribute', () => {
        render(<Gallery />);
        const residentialBtn = screen.getByRole('button', { name: /residential/i });
        fireEvent.click(residentialBtn);
        expect(residentialBtn).toHaveAttribute('aria-pressed', 'true');
        const allBtn = screen.getByRole('button', { name: /all/i });
        expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('favorites toggle button adds and removes favorites in localStorage', async () => {
        render(<Gallery />);
        // Wait the fallback images to be rendered (with title of first image)
        const firstFavoriteBtn = await screen.findAllByRole('button', { name: /Add to favorites/i });
        expect(firstFavoriteBtn.length).toBeGreaterThan(0);

        const firstBtn = firstFavoriteBtn[0];

        // Initially no favorites in localStorage
        expect(localStorage.getItem('gallery-favorites')).toBeNull();

        // Click to add favorite
        fireEvent.click(firstBtn);
        let favs = JSON.parse(localStorage.getItem('gallery-favorites'));
        expect(favs.length).toBe(1);

        // Click again to remove favorite
        fireEvent.click(firstBtn);
        favs = JSON.parse(localStorage.getItem('gallery-favorites'));
        expect(favs.length).toBe(0);
    });
});
