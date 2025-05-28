import { useEffect, useState } from "react";
import Section from "../../components/Section";
import './GroupBuyPage.css';
import { useLocation, useNavigate } from "react-router-dom";
import { dummyGroupBuyData } from '../../data/dummyGroupBuyData';
import { jwtDecode } from "jwt-decode";

const GroupBuyPage = () => {
    const [data, setData] = useState(dummyGroupBuyData);
    const [currentPage, setCurrentPage] = useState(1);
    const [role, setRole] = useState(null); // ✅ 관리자 권한 상태로 관리

    const location = useLocation();
    const navigate = useNavigate();

    // ✅ JWT 쿠키에서 권한 정보 추출
    useEffect(() => {
            console.log("현재 쿠키", document.cookie);
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('access_token='))
                ?.split('=')[1];

            if (token) {
                const decoded = jwtDecode(token);
                console.log("🔥 디코딩된 토큰:", decoded);
                setRole(decoded.role); // ex: "ROLE_ADMIN"
            }
        } catch (err) {
            console.error("JWT 디코딩 실패:", err);
        }
    }, []);

    // ✅ 글쓰기 후 돌아왔을 때 신규 아이템 추가
    useEffect(() => {
        if (location.state?.newItem) {
            setData(prev => [...prev, location.state.newItem]);
            navigate('/groupbuy', { replace: true, state: null });
        }
    }, [location.state]);

    // ✅ 페이지네이션 처리
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Section>
            <div className="Pageinfo">
                <div className="board-header">
                    <h2 className="board-title">다양한 물건을 싸게 구매해보세요!</h2>
                </div>
            </div>

            {/* ✅ 관리자만 글쓰기 버튼 보임 */}
            {role === "ROLE_ADMIN" && (
                <div className="write-button-wrapper">
                    <button className="write-button" onClick={() => navigate("/groupbuy/write")}>
                        글쓰기
                    </button>
                </div>
            )}

            <div className="Groupbuylist">
                <div className="Groupbuylist-inner">
                    {currentItems.map((item) => (
                        <div key={item.id} className="GroupbuyItem">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <h3>{item.name}</h3>
                            <p>{item.price}</p>
                            <button className="apply-button" onClick={() => navigate(`/groupbuy/info/${item.id}`)}>공동구매 신청</button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        style={{
                            margin: "0 5px",
                            padding: "8px 16px",
                            backgroundColor: currentPage === index + 1 ? "#2668A7" : "#ddd",
                            color: currentPage === index + 1 ? "#fff" : "#000",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </Section>
    );
};

export default GroupBuyPage;
