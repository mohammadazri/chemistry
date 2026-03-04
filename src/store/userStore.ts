import { create } from 'zustand'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
    id: string;
    email: string;
    name: string;
}

interface UserState {
    user: User | null;
    session: Session | null;
    setSession: (session: Session | null) => void;
    logout: () => void;
}

function mapSupabaseUser(sbUser: SupabaseUser): User {
    const meta = sbUser.user_metadata || {};
    const firstName = meta.first_name || '';
    const lastName = meta.last_name || '';
    return {
        id: sbUser.id,
        email: sbUser.email || '',
        name: `${firstName} ${lastName}`.trim() || sbUser.email || 'User',
    };
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    session: null,
    setSession: (session) => set({
        session,
        user: session?.user ? mapSupabaseUser(session.user) : null,
    }),
    logout: () => set({ user: null, session: null }),
}))
