import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // 로그인 상태 확인 (localStorage 사용)
    useEffect(() => {
        checkLoginStatus();
        
        // 다른 탭에서 로그인/로그아웃 시 상태 동기화
        const handleStorageChange = () => {
            checkLoginStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const checkLoginStatus = () => {
        const loginStatus = localStorage.getItem('isLoggedIn');
        const storedUsername = localStorage.getItem('username');
        
        if (loginStatus === 'true' && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        } else {
            setIsLoggedIn(false);
            setUsername('');
        }
    };

    const handleLogout = () => {
        // localStorage에서 로그인 정보 제거
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // 상태 업데이트
        setIsLoggedIn(false);
        setUsername('');
        
        alert('로그아웃되었습니다.');
        navigate('/');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <header className="Header">
            <div className="header-left">
                <Link to="/">Homit</Link>
            </div>
            <nav className="header-right">
                <Link to="/groupbuy">공동구매</Link>
                <Link to="/board">게시판</Link>
                <Link to="/recipe">요리레시피</Link>
                <Link to="/popular">인기상품</Link>
                <div className="notification-container">
                    <button 
                        className="notification-bell" 
                        onClick={toggleNotifications}
                    >
                        <IoIosNotificationsOutline size={25} />
                    </button>
                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">알림</div>
                            <div className="notification-empty">
                                새로운 알림이 없습니다.
                            </div>
                        </div>
                    )}
                </div>
                {isLoggedIn ? (
                    <div className="user-section">
                        <button 
                            className="logout-button" 
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <Link to="/login">로그인</Link>
                )}
            </nav>
        </header>
    )
}

export default Header;