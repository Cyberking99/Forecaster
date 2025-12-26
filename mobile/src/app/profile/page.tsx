'use client';

import { useFarcasterUser } from '@/hooks/useFarcasterUser';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export default function ProfilePage() {
    const { user, isLoading } = useFarcasterUser();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="animate-pulse text-gray-400">Loading profile...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 flex items-center">
                <Link href="/" className="mr-4 text-gray-600 hover:text-black">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <span className="font-bold text-lg">Profile</span>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm flex flex-col items-center border">
                    {user?.pfpUrl ? (
                        <img
                            src={user.pfpUrl}
                            alt={user.username || "Profile"}
                            className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-100"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full mb-4 bg-gray-100 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {user?.displayName || user?.username || "Anonymous User"}
                    </h2>
                    {user?.username && (
                        <p className="text-gray-500 mb-4">@{user.username}</p>
                    )}

                    <div className="w-full bg-gray-50 rounded-lg p-4 text-center mt-2">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Farcaster ID</span>
                        <p className="text-lg font-mono font-medium text-gray-700">{user?.fid ?? "Unknown"}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
