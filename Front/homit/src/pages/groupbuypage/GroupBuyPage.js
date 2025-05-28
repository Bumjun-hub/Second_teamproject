import { useEffect, useState } from "react";
import Section from "../../components/Section";
import './GroupBuyPage.css';
import { useLocation, useNavigate } from "react-router-dom";
import { dummyGroupBuyData } from '../../data/dummyGroupBuyData';
import {jwtDecode} from "jwt-decode";




const GroupBuyPage = () => {
    const [data, setData] = useState(dummyGroupBuyData);
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ 쿠키에서 access_token 꺼내서 role 확인
    let role = null;
    try {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('access_token='))
            ?.split('=')[1];

        if (token) {
            const decoded = jwtDecode(token);
            role = decoded.auth || decoded.role || null;
        }
    } catch (err) {
        console.error("JWT 디코딩 실패:", err);
    }

    // 페이지네이션, 렌더링 등 기존 코드 계속...


    // 글쓰기 페이지에서 온 데이터 받기
    useEffect(() => {
        if (location.state?.newItem) {
            setData(prev => [...prev, location.state.newItem]);
            // 상태 초기화 ( 한번만 처리되게)
            navigate('/groupbuy', { replace: true, state: null });
        }
    }, [location.state]);


    // 8 아이템마다 페이지 나누기
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 로그인한 사용자 정보에서 role_id꺼내기
    const user = JSON.parse(localStorage.getItem('loginUser'));

    return (
        <>
            <Section>

                <div className="Pageinfo">
                    <div className="board-header">
                        <h2 className="board-title">다양한 물건을 싸게 구매해보세요!</h2>
                    </div>
                </div>


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
                                {/* 버튼 클릭시 아이템 값 전체 넘겨주기 */}
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





            </Section >

        </>
    )

}
export default GroupBuyPage;