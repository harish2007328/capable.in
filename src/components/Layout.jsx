import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Listen for toggle-sidebar events from page headers
    React.useEffect(() => {
        const handler = () => setIsSidebarOpen(prev => !prev);
        window.addEventListener('toggle-sidebar', handler);
        return () => window.removeEventListener('toggle-sidebar', handler);
    }, []);

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
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />


                    <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''} lg:ml-64 relative z-10`}>
                        {children}
                    </main>

                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
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
