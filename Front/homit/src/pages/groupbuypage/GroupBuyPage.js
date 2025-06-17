import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Section from "../../components/Section";
import "./GroupBuyPage.css";

const GroupBuyPage = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [role, setRole] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // 권한 정보 불러오기
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/roleinfo", {
                    credentials: "include",
                });
                const text = await res.text();
                console.log("🎯 현재 사용자 권한:", text);
                setRole(text);
            } catch (e) {
                console.error("roleinfo 요청 실패:", e);
            }
        };
        fetchRole();
    }, []);

    // 공동구매 목록 불러오기
    useEffect(() => {
        const fetchGroupBuys = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/groupBuy/view");

                const json = await res.json();
                console.log("✅ 서버 응답 확인:", json);

                if (Array.isArray(json)) {
                    setData(json); // 정상 응답이면 세팅
                } else {
                    console.error("❌ 응답이 배열이 아님:", json);
                    setData([]); // slice 오류 방지용 빈 배열
                }
            } catch (err) {
                console.error("공동구매 목록 불러오기 실패:", err);
                setData([]); // 네트워크 실패 시도 slice 방지
            }
        };
        fetchGroupBuys();
    }, []);


    // 페이지네이션
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <Section>
            <div className="gbp-Pageinfo">
                <div className="board-header">
                    <h2 className="board-title">다양한 물건을 싸게 구매해보세요!</h2>
                </div>
            </div>

            {/* 관리자만 글쓰기 가능 */}
            {role === "ROLE_ADMIN" && (
                <div className="gbp-write-button-wrapper">
                    <button
                        className="gbp-write-button"
                        onClick={() => navigate("/groupbuy/write")}
                    >
                        글쓰기
                    </button>
                </div>
            )}

            <div className="gbp-Groupbuylist">
                <div className="gbp-Groupbuylist-inner">
                    {currentItems.map((item) => (
                        <div key={item.id} className="gbp-GroupbuyItem">
                            <div className="gbp-image-wrapper">
                                {item.status === 'COMPLETED' && (
                                    <div className="gbp-diagonal-badge gbp-status-completed">모집 완료</div>
                                )}
                                {item.status === 'CLOSED' && (
                                    <div className="gbp-diagonal-badge gbp-status-closed">모집 실패</div>
                                )}
                                <img src={item.imgUrls?.[0]} alt={item.title} className="item-image" />
                            </div>

                            <h3>{item.title}</h3>
                            <p>{item.salePrice?.toLocaleString()}원</p>

                            <button
                                className="gbp-apply-button"
                                onClick={() => {
                                    if (item.status === 'CLOSED') {
                                        alert("모집 실패된 공동구매는 열람할 수 없습니다.");
                                        return;
                                    }
                                    navigate(`/groupbuy/info/${item.id}`);
                                }}
                                disabled={item.status === 'CLOSED'}
                            >
                                {item.status === 'COMPLETED'
                                    ? '마감 완료'
                                    : item.status === 'CLOSED'
                                        ? '모집 실패'
                                        : '공동구매 신청'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 페이지네이션 버튼 */}
            <div className="gbp-pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        className={currentPage === index + 1 ? 'active' : ''}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>


        </Section >
    );
};

export default GroupBuyPage;
