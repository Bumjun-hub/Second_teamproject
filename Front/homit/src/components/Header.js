import { Link } from 'react-router-dom';
import './Header.css';
const Header = () => {
    return (
        <header className="Header">
            <div className="header-left">Homit</div>
            <nav className="header-right">
                <Link to="/groupbuy">공동구매</Link>
                <Link to="/board">게시판</Link>
                <Link to="/recipe">요리레시피</Link>
                <Link to="/popular">인기상품</Link>
                <Link to="/login">로그인</Link>
            </nav>
        </header>
    )
}
export default Header;