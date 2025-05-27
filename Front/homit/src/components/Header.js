import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";
import { logout } from '../utils/authUtils'; 

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 인증 상태 확인
    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/mypage', {
                credentials: 'include'
            });
            
            if (response.ok) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('인증 확인 실패:', error);
            setIsLoggedIn(false);
        } finally {
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        const success = await logout();
        if (success) {
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // 컴포넌트 마운트 시 인증 상태 확인
    useEffect(() => {
        checkAuth();
    }, []);

    // 전역적으로 인증 상태 변화 감지 (커스텀 이벤트 사용)
    useEffect(() => {
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    

    return (
        <header className="Header">
            <div className="header-left">
                <Link to="/">Homit</Link>
            </div>
            <nav className="header-right">
                <div className="header-right2">
                    <Link to="/groupbuy">공동구매</Link>
                    <Link to="/board">게시판</Link>
                    <Link to="/recipe">요리레시피</Link>
                    <Link to="/popular">인기상품</Link>
                </div>
                
                {/* 로그인한 사용자만 알림 표시 */}
                {isLoggedIn && (
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
                )}
                {/* 인증 상태에 따른 메뉴 분기 */}
                {isLoggedIn ? (
                    // 로그인된 상태
                    <>
                        <Link to="/mypage">마이페이지</Link>
                        <button 
                            className="header-right" 
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    // 로그인되지 않은 상태
                    <Link to="/login">로그인</Link>
                )}
                
            </nav>
        </header>
    );
};

export default Header;