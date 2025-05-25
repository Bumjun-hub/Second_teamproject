import Section from "../../components/Section";
import { Link } from 'react-router-dom';
import './MainPage.css';


const MainPage = () => {
    return (  
        <Section>
            <div className="main-page">
                <div className="hero-image-container">
                    <img 
                        src="/img/main_banner.png"
                        alt="웹사이트 홍보 이미지" 
                        className="hero-image"
                    />
                    <div className="hero-overlay">
                        <h1>Homit에서</h1>
                        <p>생활비를 절약해보세요</p>
                    </div>
                </div>
                    <div className="container">
                        <div className="menu-grid">                     
                            <Link to="/board" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-board">📋</div>
                            </div>
                            <h2>게시판</h2>
                            <h2>바로가기</h2>
                            <p>다양한 주제의<br/>게시글을 확인해보세요.</p>
                            </Link>
                            
                            <Link to="/recipe" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-recipe">🥕🥬🍯</div>
                            </div>
                            <h2>오늘 뭐 먹지?</h2>
                            <p>생각고 한 재료로 만들 수 있는<br/>요리 추천</p>
                            </Link>

                            <Link to="/groupbuy" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-group">🤝🛒</div>
                            </div>
                            <h2>같이 사면</h2>
                            <h2>싸다</h2>
                            <p>지금 모집 중인 공동 구매에<br/>참여해보세요.</p>
                            </Link>

                            <Link to="/popular" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-hot">🏆⭐</div>
                            </div>
                            <h2>인기상품</h2>
                            <h2>바로가기</h2>
                            <p>많은 사람들이 인기 있는<br/>상품을 확인해보세요.</p>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* 공구 인플루언서 섹션 */}
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">공구 인플루언서를 만나보세요 🔥</h2>
                        </div>
                        <div className="influencer-grid">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="influencer-card">
                                    <div className="influencer-avatar">
                                        <div className="avatar-circle">👤</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 오늘의 상품 섹션 */}
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">오늘의 상품 🔥</h2>
                        </div>
                        <div className="product-grid">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="product-card">
                                    <div className="product-image"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 공동구매 마감임박 섹션 */}
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">공동구매 마감임박 ⏰</h2>
                        </div>
                        <div className="product-grid">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="product-card">
                                    <div className="product-image"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 저주 본 상품 섹션 */}
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">저주 본 상품</h2>
                        </div>
                        <div className="product-grid">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="product-card">
                                    <div className="product-image"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                
        </Section>
        
    )

}
export default MainPage;