import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();

    // Define "App" routes that should use the Sidebar layout
    const appRoutes = ['/dashboard', '/settings', '/metrics'];
    const isAppPage = appRoutes.some(route => location.pathname.startsWith(route));

    // Focus Pages (No Sidebar, No Header)
    const focusRoutes = ['/task', '/wizard', '/report', '/project', '/login'];
    if (focusRoutes.some(route => location.pathname.startsWith(route))) {
        return (
            <div className="h-screen w-full bg-slate-50 overflow-hidden">
                {children}
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue flex flex-col overflow-x-hidden">

            {/* Soft Ambient Light Effect */}
            <div className="fixed top-0 left-0 w-full h-screen bg-gradient-radial from-white via-slate-50 to-slate-100 pointer-events-none -z-10"></div>

            {isAppPage ? (
                // --- APP LAYOUT (Sidebar) ---
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 ml-64 p-8 relative z-10">
                        {children}
                    </main>
                </div>
            ) : (
                // --- LANDING LAYOUT (Header) ---
                <>
                    <Header />
                    <main className="relative z-10 w-full flex-grow flex flex-col">
                        {children}
                    </main>
                </>
            )}
        </div>
    );
};

export default Layout;
