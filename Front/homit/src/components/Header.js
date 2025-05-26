import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Header.css';
import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);

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
                <Link to="/login">로그인</Link>
            </nav>
        </header>
    )
}

export default Header;