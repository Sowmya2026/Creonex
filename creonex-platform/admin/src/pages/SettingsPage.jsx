import React from 'react';
import { Settings, User, Bell, Shield, Smartphone, Globe, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
    const { user, logout } = useAuth();

    const sections = [
        {
            title: 'Profile Settings',
            icon: User,
            items: [
                { label: 'Display Name', value: user?.displayName || 'Admin User', type: 'text' },
                { label: 'Email Address', value: user?.email || 'admin@example.com', type: 'email', disabled: true },
                { label: 'Phone Number', value: '+91 8555074387', type: 'tel' }
            ]
        },
        {
            title: 'Notifications',
            icon: Bell,
            items: [
                { label: 'Email Notifications', checked: true, type: 'toggle' },
                { label: 'Desktop Alerts', checked: false, type: 'toggle' },
                { label: 'Weekly Reports', checked: true, type: 'toggle' }
            ]
        },
        {
            title: 'Security',
            icon: Shield,
            items: [
                { label: 'Two-Factor Authentication', checked: true, type: 'toggle' },
                { label: 'Password', value: '••••••••', type: 'password', action: 'Change' }
            ]
        },
        {
            title: 'Appearance',
            icon: Moon,
            items: [
                { label: 'Theme', value: 'Light', type: 'select', options: ['Light', 'Dark', 'System'] },
                { label: 'Compact Sidebar', checked: false, type: 'toggle' }
            ]
        }
    ];

    return (
        <div className="page-padding">
            <div className="header-actions">
                <h1 className="page-title">Settings</h1>
            </div>

            <div className="grid-2">
                {sections.map((section, idx) => (
                    <div key={idx} className="list-item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <div style={{
                                padding: '0.5rem',
                                background: 'rgba(139, 111, 71, 0.1)',
                                borderRadius: '8px',
                                color: '#8B6F47',
                                display: 'flex'
                            }}>
                                <section.icon size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{section.title}</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {section.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#333', fontSize: '0.95rem' }}>{item.label}</div>
                                        {item.type !== 'toggle' && (
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                                                {item.type === 'password' ? 'Last changed 3 months ago' : item.value}
                                            </div>
                                        )}
                                    </div>

                                    {item.type === 'toggle' ? (
                                        <div style={{
                                            position: 'relative',
                                            width: '44px',
                                            height: '24px',
                                            background: item.checked ? '#8B6F47' : '#e5e7eb',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: item.checked ? '22px' : '2px',
                                                width: '20px',
                                                height: '20px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                transition: 'left 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                            }} />
                                        </div>
                                    ) : item.action ? (
                                        <button style={{
                                            padding: '0.4rem 0.8rem',
                                            background: 'transparent',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}>{item.action}</button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Application Info */}
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                <p>Creonex Platform v1.2.0</p>
                <p>&copy; 2026 Creonex.viz. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
