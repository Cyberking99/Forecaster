import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
}

export function useFarcasterUser() {
    const [user, setUser] = useState<FarcasterUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // We might be running outside of a miniapp (e.g. browser during dev)
                // sdk.context might be available if we are in a frame context or mocked

                // Wait for SDK to be ready
                await sdk.actions.ready();

                if (sdk.context) {
                    const context = await sdk.context;
                    if (context.user) {
                        setUser(context.user as FarcasterUser);
                    }
                }
            } catch (e) {
                console.error('Error loading Farcaster user context:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    return { user, isLoading };
}
