import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    MessageSquare,
    Settings,
    LogOut,
    Package,
    Image,
    Shield,
    Briefcase,
    Menu,
    X,
    StickyNote,
    BookOpen,
    FileText,
    Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// ----------------------------------------------------------------------
// Simple Clean Sidebar Component
// Features: Clean navigation, collapsible, notification badge
// ----------------------------------------------------------------------

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved !== null ? saved === 'true' : false;
    });
    const [notifications, setNotifications] = useState(0);

    // Fetch unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await api.get('/contact');
                if (response.data && Array.isArray(response.data)) {
                    const unreadCount = response.data.filter(inquiry => !inquiry.read).length;
                    setNotifications(unreadCount);
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                setNotifications(0);
            }
        };

        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(intervalId);
    }, [location.pathname]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
    }, [isCollapsed]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Package, label: 'Services', path: '/services' },
        { icon: MessageSquare, label: 'Ser.Inquiries', path: '/inquiries', badge: notifications },
        { icon: Briefcase, label: 'Brands & Collabs', path: '/brands-collabs' },
        { icon: BookOpen, label: 'Catalogs', path: '/catalogs' },
        { icon: MessageSquare, label: 'Cat. Inquiries', path: '/catalog-inquiries' },
        { icon: Image, label: 'Portfolio', path: '/portfolio' },
        { icon: LinkIcon, label: 'Affiliates', path: '/links' },
        { icon: StickyNote, label: 'Notes', path: '/notes' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
        { icon: Users, label: 'Visitors', path: '/visitors' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && !isCollapsed && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Mobile Toggle Button */}
            {isMobile && isCollapsed && (
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsCollapsed(false)}
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Main Sidebar */}
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Header */}
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <div className="sidebar-brand">
                            <img
                                src="/logo-light.svg"
                                alt="Creonex"
                                className="sidebar-logo"
                            />
                            <div className="brand-text">
                                <span className="brand-name">Creonex</span>
                                <span className="brand-subtitle">Admin</span>
                            </div>
                        </div>
                    )}

                    {/* Toggle Button (Desktop) */}
                    {!isMobile && (
                        <button
                            className="sidebar-toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
                        </button>
                    )}

                    {/* Close Button (Mobile) */}
                    {isMobile && !isCollapsed && (
                        <button
                            className="sidebar-close"
                            onClick={() => setIsCollapsed(true)}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                title={isCollapsed ? item.label : undefined}
                                onClick={() => isMobile && setIsCollapsed(true)}
                            >
                                <Icon size={20} className="nav-icon" />
                                {!isCollapsed && (
                                    <>
                                        <span className="nav-label">{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="nav-badge">{item.badge}</span>
                                        )}
                                    </>
                                )}
                                {isCollapsed && item.badge > 0 && (
                                    <span className="nav-badge-collapsed">{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {!isCollapsed && (
                        <div className="user-info">
                            <div className="user-avatar">
                                <Shield size={16} />
                            </div>
                            <div className="user-details">
                                <span className="user-name">Administrator</span>
                                <span className="user-role">Super Admin</span>
                            </div>
                        </div>
                    )}

                    <button
                        className="logout-btn"
                        onClick={logout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
