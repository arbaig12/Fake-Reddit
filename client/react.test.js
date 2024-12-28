import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '/src/components/authContext.jsx'; // Adjust path if needed
import { ViewProvider } from '/src/components/.jsx'; // Adjust path if needed
import { DataProvider } from '/src/components/.jsx'; // Adjust path if needed
import Banner from '../banner.jsx'; // Adjust path if needed

describe('Create Post Button', () => {
    test('is disabled for guest users', () => {
        // Mock AuthContext for guest user
        const guestAuthState = {
            authState: {
                isLoggedIn: false,
                isGuest: true,
                user: null,
            },
        };

        // Mock ViewContext
        const mockViewContext = {
            currentView: 'homeView',
        };

        // Mock DataContext
        const mockDataContext = {
            fetchData: jest.fn(),
        };

        render(
            <AuthProvider value={guestAuthState}>
                <ViewProvider value={mockViewContext}>
                    <DataProvider value={mockDataContext}>
                        <Banner />
                    </DataProvider>
                </ViewProvider>
            </AuthProvider>
        );

        // Check that the "Create Post" button is disabled
        const createPostButton = screen.getByRole('button', { name: /create post/i });
        expect(createPostButton).toBeDisabled();
    });

    test('is enabled for registered users', () => {
        // Mock AuthContext for registered user
        const registeredAuthState = {
            authState: {
                isLoggedIn: true,
                isGuest: false,
                user: { username: 'testuser' },
            },
        };

        // Mock ViewContext
        const mockViewContext = {
            currentView: 'homeView',
        };

        // Mock DataContext
        const mockDataContext = {
            fetchData: jest.fn(),
        };

        render(
            <AuthProvider value={registeredAuthState}>
                <ViewProvider value={mockViewContext}>
                    <DataProvider value={mockDataContext}>
                        <Banner />
                    </DataProvider>
                </ViewProvider>
            </AuthProvider>
        );

        // Check that the "Create Post" button is enabled
        const createPostButton = screen.getByRole('button', { name: /create post/i });
        expect(createPostButton).toBeEnabled();
    });
});
