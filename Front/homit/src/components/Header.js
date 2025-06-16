import { Link, useNavigate } from 'react-router-dom';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    // ✅ 사용자 인증 상태 확인
    const checkAuth = async () => {
        try {
            console.log('Header: 사용자 인증 상태 확인 중...'); // 디버깅
            
            const response = await fetch('http://localhost:8080/api/mypage', {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Header: 받아온 사용자 데이터:', userData); // 디버깅
                
                setIsLoggedIn(true);
                setUserInfo(userData);
            } else {
                setIsLoggedIn(false);
                setUserInfo(null);
            }
        } catch (error) {
            console.error('Header: 인증 확인 실패:', error);
            setIsLoggedIn(false);
            setUserInfo(null);
        }
    };

    // ✅ 로그아웃 처리
    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            setUserInfo(null);
        }
    };

    // ✅ 프로필 클릭 시 마이페이지로 이동
    const handleProfileClick = () => {
        navigate('/mypage');
    };

    // ✅ 종 버튼 클릭 시 알림창 열기/닫기
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // ✅ 알림 수신 시 호출되는 콜백
    const handleNotificationMessage = (message) => {
        setNotifications((prev) => [message, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    // ✅ 알림 클릭 시 해당 상세 페이지로 이동
    const handleNotificationClick = (notification) => {
        if (notification.groupBuyId) {
            navigate(`/groupbuy/info/${notification.groupBuyId}`);
        } else if (notification.communityId && notification.category) {
            navigate(`/board/info/${notification.category}/${notification.communityId}`);
        } else if (notification.recipeId) {
            navigate(`/recipe/${notification.recipeId}`);
        }
        setShowNotifications(false);
    };

    // ✅ 마우스 오버 시 해당 알림 읽음 처리 (호버 기반)
    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                credentials: 'include'
            });

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
            console.error("읽음 처리 실패", e);
        }
    };

    // 렌더링할때 모든 유저의 안읽은 알림 반환
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications/get', { credentials: 'include' });
                const data = await res.json();
                const unread = data.filter((n) => !n.isRead);
                setNotifications(unread);
            } catch (err) {
                console.error('알림 불러오기 실패', err);
            }
        };

        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn]);

    // ✅ 알림 수 표시 초기값 불러오기
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch('/api/notifications/count/unread', { credentials: 'include' });
                const count = await res.json();
                setUnreadCount(count);
            } catch (err) {
                console.error('알림 수 불러오기 실패', err);
            }
        };
        
        if (isLoggedIn) {
            fetchUnreadCount();
        }
    }, [isLoggedIn]);

    // ✅ 최초 로그인 상태 확인
    useEffect(() => {
        checkAuth();
    }, []);

    // ✅ 로그인 상태 변경 시 알림 수신 연결/해제
    useEffect(() => {
        if (isLoggedIn) {
            connectNotification(handleNotificationMessage);
        } else {
            disconnectNotification();
        }
        return () => disconnectNotification();
    }, [isLoggedIn]);

    // ✅ 인증 변경 이벤트 감지 (프로필 수정 시에도 업데이트)
    useEffect(() => {
        const handleAuthChange = () => {
            console.log('Header: authChange 이벤트 감지 - 사용자 정보 새로고침');
            checkAuth(); // 사용자 정보 다시 불러오기
        };
        
        const handleProfileUpdate = () => {
            console.log('Header: profileUpdate 이벤트 감지 - 사용자 정보 새로고침');
            checkAuth(); // 프로필 업데이트 시에도 헤더 정보 갱신
        };
        
        // 두 이벤트 모두 감지
        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('profileUpdate', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('profileUpdate', handleProfileUpdate);
        };
    }, []);

    // ✅ 프로필 이미지 URL 생성 (캐시 방지)
    const getProfileImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        return `http://localhost:8080${imageUrl}?t=${Date.now()}`;
    };

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
                <Link to="/donation">동네톡</Link>
            </nav>

            <nav className="header-right">
                {isLoggedIn && (
                    <div className="notification-container">
                        <button className="notification-bell" onClick={toggleNotifications}>
                            <IoIosNotificationsOutline size={25} />
                            {/* ✅ 종 옆 알림 수 뱃지 표시 */}
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">알림</div>
                                {notifications.length === 0 ? (
                                    <div className="notification-empty">새로운 알림이 없습니다.</div>
                                ) : (
                                    <ul className="notification-list">
                                        {notifications.map((n, idx) => (
                                            <li
                                                key={n.id || idx}
                                                className={`notification-item ${n.isRead ? 'read' : ''}`}
                                                onMouseEnter={() => !n.isRead && handleMarkAsRead(n.id)}
                                                onClick={() => handleNotificationClick(n)}
                                                style={{ cursor: 'pointer' }}
                                            >
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
                        <button className="header-user-profile" onClick={handleProfileClick}>
                            {userInfo?.imageUrl ? (
                                <img 
                                    src={getProfileImageUrl(userInfo.imageUrl)}
                                    alt="프로필" 
                                    className="header-profile-image"
                                    key={userInfo.imageUrl} 
                                />
                            ) : (
                                <div className="header-profile-placeholder">
                                    {(userInfo?.username || userInfo?.name)?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {(userInfo?.username || userInfo?.name) && (
                                <span className="header-username">{userInfo.username || userInfo.name}님</span>
                            )}
                        </button>
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