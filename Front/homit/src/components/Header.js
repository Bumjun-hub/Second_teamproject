import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";
import { logout } from '../utils/authUtils';
import { connectNotification, disconnectNotification } from '../utils/notificationClient';

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/mypage', {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setIsLoggedIn(true);
                setUserInfo(userData);
            } else {
                setIsLoggedIn(false);
                setUserInfo(null);
            }
        } catch (error) {
            console.error('인증 확인 실패:', error);
            setIsLoggedIn(false);
            setUserInfo(null);
        }
    };

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            setUserInfo(null);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotificationMessage = (message) => {
        setNotifications((prev) => [message, ...prev]);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            connectNotification(handleNotificationMessage); // ✅ 토큰 인자 없이
        } else {
            disconnectNotification();
        }
        return () => disconnectNotification();
    }, [isLoggedIn]);

    return (
        <header className="Header">
            <div className="header-left">
                <Link to="/">Homit</Link>
            </div>

            <nav className="header-center">
                <Link to="/groupbuy">공동구매</Link>
                <Link to="/board">게시판</Link>
                <Link to="/recipe">요리레시피</Link>
                <Link to="/popular">인기상품</Link>
            </nav>

            <nav className="header-right">
                {isLoggedIn && (
                    <div className="notification-container">
                        <button className="notification-bell" onClick={toggleNotifications}>
                            <IoIosNotificationsOutline size={25} />
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">알림</div>
                                {notifications.length === 0 ? (
                                    <div className="notification-empty">새로운 알림이 없습니다.</div>
                                ) : (
                                    <ul className="notification-list">
                                        {notifications.map((n, idx) => (
                                            <li key={idx} className="notification-item">
                                                <div className="noti-card">
                                                    <div className="noti-header">
                                                        <span className={`noti-type ${n.type?.toLowerCase()}`}>
                                                            {n.type === "GROUP_BUY_OPEN" && "🛒 공동구매 오픈"}
                                                            {n.type === "GROUP_BUY_COMPLETED" && "✅ 마감 완료"}
                                                            {n.type === "GROUP_BUY_CLOSED" && "❌ 마감 실패"}
                                                            {!["GROUP_BUY_OPEN", "GROUP_BUY_COMPLETED", "GROUP_BUY_CLOSED"].includes(n.type) && "🔔 알림"}
                                                        </span>
                                                        {n.createdAt && (
                                                            <span className="noti-time">
                                                                {new Date(n.createdAt).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="noti-content">
                                                        {n.content}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                )}
                            </div>
                        )}
                    </div>
                )}

                {isLoggedIn ? (
                    <>
                        <div className="header-user-profile">
                            {userInfo?.imageUrl ? (
                                <img src={userInfo.imageUrl} alt="프로필" className="header-profile-image" />
                            ) : (
                                <div className="header-profile-placeholder">
                                    {(userInfo?.username || userInfo?.name)?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {(userInfo?.username || userInfo?.name) && (
                                <span className="header-username">{userInfo.username || userInfo.name}님</span>
                            )}
                        </div>
                        <Link to="/mypage">마이페이지</Link>
                        <button className="header-logout-btn" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </>
                ) : (
                    <Link to="/login">로그인</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
