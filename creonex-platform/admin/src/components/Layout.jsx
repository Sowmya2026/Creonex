import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="admin-container">
            <Sidebar />
            <main className="main-content">
                <header className="top-bar">
                    <h2 className="page-title">Dashboard</h2>
                    <div className="user-profile">
                        <div className="avatar">A</div>
                        <span className="username">Admin</span>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
