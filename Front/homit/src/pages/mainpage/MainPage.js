import Section from "../../components/Section";
import { Link } from 'react-router-dom';
import './MainPage.css';

import { influencers } from './../../data/influencers';
import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthProvider";
import UrgentGroupBuyCard from "../../components/UrgentGroupBuyCard";





const MainPage = () => {


    const { user, loading } = useAuth(); // ✅ 로그인된 사용자 정보
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [urgentItems, setUrgentItems] = useState([]);

    const itemsPerPage = 4;

    const totalPages = Math.ceil(recentlyViewed.length / itemsPerPage);
    const currentItems = recentlyViewed.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    )

    useEffect(() => {
        const fetchUrgentItems = async () => {
            const res = await fetch("http://localhost:8080/api/groupBuy/view");
            const data = await res.json();

            const now = new Date();
            const deadlineThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            const filtered = data.filter(item => {
                const deadline = new Date(item.deadline);
                return deadline > now && deadline <= deadlineThreshold && item.status === "OPEN";
            });

            setUrgentItems(filtered);
        };
        fetchUrgentItems();
    }, []);

    useEffect(() => {
        if (!loading && user?.email) {
            const key = `viewedProducts_${user.email}`;
            const data = JSON.parse(localStorage.getItem(key)) || [];
            setRecentlyViewed(data.reverse());
        }
    }, [loading]);

    useEffect(() => {
        if (user?.email) {
            const key = `viewedProducts_${user.email}`;
            const data = JSON.parse(localStorage.getItem(key)) || [];
            setRecentlyViewed(data.reverse());
        }
    }, [user?.email]);




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
                            <p>다양한 주제의<br />게시글을 확인해보세요</p>
                        </Link>

                        <Link to="/recipe" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-recipe">🥕🥬🍯</div>
                            </div>
                            <h2>오늘 뭐 먹지?</h2>
                            <p>냉장고 속 재료로 만들 수 있는<br />요리 추천</p>
                        </Link>

                        <Link to="/groupbuy" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-group">🤝🛒</div>
                            </div>
                            <h2>같이 사면</h2>
                            <h2>싸다</h2>
                            <p>지금 모집 중인 공동구매 상품<br />참여해보세요</p>
                        </Link>

                        <Link to="/popular" className="menu-card">
                            <div className="card-icon">
                                <div className="icon-hot">🏆⭐</div>
                            </div>
                            <h2>인기상품</h2>
                            <h2>바로가기</h2>
                            <p>많은 사람에게 인기 있는<br />상품을 확인해보세요</p>
                        </Link>
                    </div>
                </div>
            </div>
            {/* 공구 인플루언서 섹션 */}
            <div className="section-container">
                <div className="section-header2">
                    <h2 className="section-title">공구 인플루언서를 만나보세요</h2>
                </div>
                <div className="influencer-grid">
                    {influencers.map((inf, index) => (
                        <div key={index} className="influencer-card">
                            <a href={inf.link} target="_blank" rel="noopener noreferrer">
                                {inf.icon ? (
                                    <img src={inf.icon} alt={inf.name} className="avatar-circle" />
                                ) : (
                                    <div className="avatar-circle">{inf.initial}</div>
                                )}
                            </a>
                            <p>{inf.name}<br /><small>{inf.category}</small></p>
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
                    {urgentItems.map(item => (
                        <UrgentGroupBuyCard key={item.id} item={item} />
                    ))}
                </div>

            </div>

            {/* 자자주 본 상품 섹션 */}
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">자주 본 상품</h2>
                </div>
                <div className="product-grid">
                    {currentItems.map((item, idx) => (
                        <div key={idx} className="product-card">
                            <div className="product-image">
                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '8px', fontSize: '14px' }}>
                                <strong>{item.name}</strong><br />
                                {Number(item.price).toLocaleString()}원
                            </div>
                        </div>
                    ))}
                </div>
                {/* 화살표 네비게이션 */}
                {recentlyViewed.length > itemsPerPage && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '20px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                        >
                            ◀ 이전
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            다음 ▶
                        </button>
                    </div>
                )}
            </div>

        </Section>
    )

}
export default MainPage;