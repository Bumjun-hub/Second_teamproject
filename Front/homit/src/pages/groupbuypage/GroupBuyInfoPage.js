import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';
import { refreshToken } from "../../utils/authUtils";
import CommentSection from './../../components/CommentSection';
import ParticipantList from '../../components/ParticipantList';

const GroupBuyInfoPage = ({ postId }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [currentUser, setCurrentUser] = useState("");
    const [hasOrder, setHasOrder] = useState(false);
    const [role, setRole] = useState(null);
    const [activeTab, setActiveTab] = useState('detail');

    const salepercent = item && item.salePrice && item.originalPrice
        ? Math.round((1 - item.salePrice / item.originalPrice) * 100)
        : 0;



    // 서버에서 내려주는 status값(OPEN, CLOSED, COMPLETED) 만으로 판별
    const isCompleted = item?.status === "COMPLETED";
    const isClosed = item?.status !== "OPEN";

    const fetchItem = async () => {
        try {
            // 1. 게시글 정보
            const res = await fetch(`http://localhost:8080/api/groupBuy/detail/${id}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`상세 불러오기 실패: ${res.status}`);
            const json = await res.json();
            setItem(json);

            // gbi-2. 사용자 정보
            const userRes = await fetch("http://localhost:8080/api/mypage", {
                credentials: "include"
            });

            if (!userRes.ok) throw new Error(`사용자 정보 불러오기 실패: ${userRes.status}`);
            const userData = await userRes.json();
            if (!userData.name) throw new Error("사용자 이름이 없음");
            setCurrentUser(userData.name);

            // 3. 주문 정보
            const ordersRes = await fetch(`/api/order/myPage/order`, {
                credentials: "include"
            });

            let orders = [];
            if (ordersRes.ok) {
                const orderJson = await ordersRes.json();
                if (Array.isArray(orderJson)) {
                    orders = orderJson;
                }
            }

            const myOrder = orders.find(order => order.groupBuyId === Number(id));
            setHasOrder(!!myOrder);

        } catch (err) {
            console.error("상세 조회 실패:", err);
            alert("데이터를 불러오는데 실패했습니다.");
        }
    };
    // 권한 정보 불러오기


    // useEffect 안에서 fetchRole 함수 수정
    useEffect(() => {
        const fetchRole = async () => {
            try {
                let res = await fetch("http://localhost:8080/api/roleinfo", {
                    credentials: "include",
                });

                // 401이면 토큰 갱신 시도
                if (res.status === 401) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        res = await fetch("http://localhost:8080/api/roleinfo", {
                            credentials: "include",
                        });
                    }
                }

                if (!res.ok) throw new Error("권한 요청 실패");

                const text = await res.text();
                console.log("🎯 현재 사용자 권한:", text);
                setRole(text);

            } catch (e) {
                console.error("roleinfo 요청 실패:", e);
                alert("로그인이 필요합니다.");
                navigate("/login");
            }
        };

        fetchRole();
    }, [navigate]);




    useEffect(() => {
        if (id) fetchItem();
    }, [id]);

    const handleEdit = () => {
        if (item.username !== currentUser) {
            alert("권한이 없습니다");
            return;
        }
        navigate(`/groupBuy/admin/edit/${item.id}`);
    };

    const handleDelete = async () => {
        if (item.username !== currentUser) {
            alert("권한이 없습니다");
            return;
        }
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                const res = await fetch(`http://localhost:8080/api/groupBuy/admin/delete/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) throw new Error("삭제 실패");
                alert("삭제가 완료되었습니다");
                navigate('/groupbuy');
            } catch (err) {
                console.error("삭제 실패:", err);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // 구매 참여 버튼 이벤트 - URL 경로 수정

    const handleApply = () => {
        // 팝업 창 크기와 옵션 설정(원하는 대로 조절 가능)
        const popupWidth = 520;
        const popupHeight = 720;
        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2;

        window.open(
            `/payment/${id}`,
            '_blank',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no,scrollbars=yes`
        );
    };

    const handleCancel = async () => {
        try {
            // 내 주문 내역에서 orderId를 가져와야 함!
            const ordersRes = await fetch(`/api/order/myPage/order`, { credentials: "include" });
            const ordersData = await ordersRes.json();
            const orders = Array.isArray(ordersData) ? ordersData : []; // 배열 보장

            const myOrder = orders.find(order => order.groupBuyId === Number(id));
            if (!myOrder) {
                alert("취소할 주문 내역이 없습니다.");
                return;
            }

            const res = await fetch(`/api/order/${myOrder.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || '취소 실패');
            }

            alert("신청이 취소되었습니다!");
            setHasOrder(false);
            fetchItem(); // 참여자수 및 버튼 즉시 갱신
        } catch (err) {
            console.error('취소 실패:', err);
            alert(err.message || "취소 중 오류가 발생했습니다.");
        }
    };



    if (!item) return <div>로딩 중...</div>;

    return (
        <Section>
            <div className="gbi-info-container">
                {role === "ROLE_ADMIN" && (
                    <div className="gbi-top-buttons">
                        <button className="gbi-edit-button" onClick={handleEdit}>수정</button>
                        <button className="gbi-delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                )}

                <div className="gbi-product-card">
                    <div className="gbi-image-area">
                        {item.imgUrls?.length > 0 && (
                            <img src={item.imgUrls[0]} alt={item.title} />
                        )}
                    </div>

                    <div className="gbi-details-area">
                        <div className="gbi-header-row">
                            <h2 className="gbi-main-title">{item.title}</h2>
                            <div className="gbi-actions">
                                {item.productUrl && (
                                    <a href={item.productUrl} target="_blank" rel="noreferrer" className="gbi-detail-link">
                                        제품 상세보기
                                    </a>
                                )}
                                <button className="gbi-heart-button">♡</button>
                            </div>
                        </div>

                        <div className="gbi-card-section">
                            <div className="gbi-section-title">📝 상품 설명</div>
                            <div className="gbi-section-content">{item.description}</div>
                        </div>



                        <div className="gbi-info-footer">
                            <div className="gbi-info-box">
                                <span className="gbi-info-label">모집 인원</span>
                                <span>{item.minParticipants} ~ {item.maxParticipants} 명</span>
                            </div>

                            <div className="gbi-info-box">
                                <span className="gbi-info-label">참여자 수 : <strong>{item.currentParticipants}</strong> / {item.maxParticipants}명
                                    {hasOrder && <span> (참여중)</span>}</span>
                                <div className="gbi-progress-bar-wrapper">
                                    <div
                                        className="gbi-progress-bar-fill"
                                        style={{
                                            width: `${Math.min((item.currentParticipants / item.maxParticipants) * 100, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="gbi-info-box">
                                <span className="gbi-info-label">마감일</span>
                                <span>{item.deadline ? new Date(item.deadline).toLocaleString() : '-'}</span>
                            </div>
                        </div>

                        <div className="gbi-bottom-row">
                            <div className='gbi-sale-badge'>
                                {salepercent > 0 ? `${salepercent}% 할인` : ``}
                            </div>
                            <div className="gbi-price-wrapper">
                                <span className="gbi-original-price">
                                    {typeof item.originalPrice === 'number'
                                        ? item.originalPrice.toLocaleString()
                                        : `${item.originalPrice ?? '-'}`}원
                                </span>
                                <span className="gbi-sale-price">
                                    {typeof item.salePrice === 'number'
                                        ? item.salePrice.toLocaleString()
                                        : `${item.salePrice ?? '-'}`}원
                                </span>
                            </div>

                            {/* 버튼 조건 분기 */}

                            {/* 마감 완료 상태일때 */}
                            {item.status === "COMPLETED" ? (
                                hasOrder ? (
                                    <button className="gbi-buy-button" disabled>
                                        신청 완료(구매대기)
                                    </button>
                                ) : (
                                    <button className="gbi-buy-button" disabled>
                                        마감 완료
                                    </button>
                                )
                            ) : item.status !== "OPEN" ? (
                                <button className="gbi-buy-button" disabled>
                                    마감 종료
                                </button>
                            ) : (
                                hasOrder ? (
                                    // <button className="gbi-buy-button" disabled>
                                    // 이미 신청함
                                    // </button>
                                    // 만약 취소 허용하려면
                                    <button className="gbi-buy-button" onClick={handleCancel}>신청 취소</button>
                                ) : (
                                    <button className="gbi-buy-button" onClick={handleApply}>
                                        구매 신청(결제)
                                    </button>
                                )
                            )}


                        </div>
                    </div>
                </div>
            </div>

            <div className="gbi-tabs">
                <button
                    className={activeTab === 'detail' ? 'active' : ''}
                    onClick={() => setActiveTab('detail')}
                >
                    상세정보
                </button>
                <button
                    className={activeTab === 'participants' ? 'active' : ''}
                    onClick={() => setActiveTab('participants')}
                >
                    공구 참가자 목록
                </button>
                <button
                    className={activeTab === 'review' ? 'active' : ''}
                    onClick={() => setActiveTab('review')}
                >
                    후기
                </button>
            </div>

            <div className='tab-content'>
                {activeTab === 'detail' && (
                    <div className='gbi-content-container'>
                        {item.contentImgUrls?.map((url, idx) => (
                            <img
                                key={idx}
                                src={url}
                                alt={`상세 이미지 ${idx + 1}`}
                                className="gbi-detail-image"
                            />
                        ))}
                    </div>
                )}
                {activeTab === 'participants' && (
                    <ParticipantList groupBuyId={id} />
                )}
                {activeTab === 'review' && (
                    <CommentSection
                        postId={id}
                        currentUser={currentUser}
                        entityType="GROUPBUY"
                    />
                )}
            </div>
        </Section >
    );
};

export default GroupBuyInfoPage;