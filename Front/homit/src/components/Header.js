import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";
import { logout } from '../utils/authUtils'; 

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 추가

    // 인증 상태 확인
    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/mypage', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json(); // 사용자 데이터 파싱
                setIsLoggedIn(true);
                setUserInfo(userData); // 사용자 정보 저장
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

    // 로그아웃 처리
    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            setUserInfo(null); // 로그아웃 시 사용자 정보 초기화
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
            
            {/* 중앙 고정 네비게이션 */}
            <nav className="header-center">
                <Link to="/groupbuy">공동구매</Link>
                <Link to="/board">게시판</Link>
                <Link to="/recipe">요리레시피</Link>
                <Link to="/popular">인기상품</Link>
            </nav>
            
            <nav className="header-right">
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
                        {/* 프로필 정보 표시 */}
                        <div className="header-user-profile">
                            {userInfo?.imageUrl ? (
                                <img 
                                    src={userInfo.imageUrl} 
                                    alt="프로필" 
                                    className="header-profile-image"
                                />
                            ) : (
                                <div className="header-profile-placeholder">
                                    {(userInfo?.username || userInfo?.name) ? (userInfo?.username || userInfo?.name).charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            {(userInfo?.username || userInfo?.name) && (
                                <span className="header-username">{userInfo?.username || userInfo?.name}님</span>
                            )}
                        </div>
                        <Link to="/mypage">마이페이지</Link>
                        <button 
                            className="header-logout-btn" 
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