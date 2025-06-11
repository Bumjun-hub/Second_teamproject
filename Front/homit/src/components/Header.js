import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";
import { logout } from '../utils/authUtils';
import { connectNotification, disconnectNotification } from '../utils/notificationClient';
import { getCookie } from '../utils/cookie';

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
        // ⭐️ 로그아웃 시 localStorage에서도 access_Token 삭제
        localStorage.removeItem('access_Token');
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
        console.log('isLoggedIn:', isLoggedIn);
        // ⭐️ localStorage에서 accessToken을 읽어서 WebSocket 연결에 사용
        if (isLoggedIn) {

            const token = localStorage.getItem('access_Token');
            console.log('token:', token); // 추가!
            if (token) {
                connectNotification(handleNotificationMessage, token);
            }
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
                                                {n.message || JSON.stringify(n)}
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
