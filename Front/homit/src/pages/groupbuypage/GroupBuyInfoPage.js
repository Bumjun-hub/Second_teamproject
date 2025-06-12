import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';

const GroupBuyInfoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [currentUser, setCurrentUser] = useState("");
    const [hasOrder, setHasOrder] = useState(false);
    const [isLiked, setIsLiked] = useState(false);



    // 서버에서 내려주는 status값(OPEN, CLOSED, COMPLETED) 만으로 판별
    const isCompleted = item?.status === "COMPLETED";
    const isClosed = item?.status !== "OPEN";

    const fetchItem = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/groupBuy/detail/${id}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            setItem(json);

            // 참여 여부 판단
            const userRes = await fetch("http://localhost:8080/api/mypage", { credentials: "include" });
            const userData = await userRes.json();
            setCurrentUser(userData.name);

            const ordersRes = await fetch(`/api/order/myPage/order`, { credentials: "include" });
            const orders = await ordersRes.json();
            const myOrder = orders.find(order => order.groupBuyId === Number(id));
            setHasOrder(!!myOrder);

        } catch (err) {
            console.error("상세 조회 실패:", err);
            alert("데이터를 불러오는데 실패했습니다.");
        }
    };

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
            <div className="info-container">
                <div className="top-buttons">
                    <button className="edit-button" onClick={handleEdit}>수정</button>
                    <button className="delete-button" onClick={handleDelete}>삭제</button>
                </div>

                <div className="product-card">
                    <div className="image-area">
                        {item.imgUrls?.length > 0 && (
                            <img src={item.imgUrls[0]} alt={item.title} />
                        )}
                    </div>

                    <div className="details-area">
                        <div className="header-row">
                            <h2 className="main-title">{item.title}</h2>
                            <div className="actions">
                                {item.productUrl && (
                                    <a href={item.productUrl} target="_blank" rel="noreferrer" className="detail-link">
                                        제품 상세보기
                                    </a>
                                )}
                                <button className="heart-button">♡</button>
                            </div>
                        </div>

                        <div className="card-section">
                            <div className="section-title">📝 상품 설명</div>
                            <div className="section-content">{item.description}</div>
                        </div>

                        <div className="card-section">
                            <div className="section-title">📦 상세 내용</div>
                            <div className="section-content">{item.content}</div>
                        </div>

                        <div className="info-footer">
                            <div className="info-box">
                                <span className="info-label">모집 인원</span>
                                <span>{item.minParticipants} ~ {item.maxParticipants} 명</span>
                            </div>

                            <div className="info-box">
                                <span className="info-label">참여자 수 : <strong>{item.currentParticipants}</strong> / {item.maxParticipants}명
                                    {hasOrder && <span> (참여중)</span>}</span>
                                <div className="progress-bar-wrapper">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${Math.min((item.currentParticipants / item.maxParticipants) * 100, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="info-box">
                                <span className="info-label">마감일</span>
                                <span>{item.deadline ? new Date(item.deadline).toLocaleString() : '-'}</span>
                            </div>
                        </div>

                        <div className="bottom-row">
                            <div className="price-wrapper">
                                <span className="original-price">
                                    {typeof item.originalPrice === 'number'
                                        ? item.originalPrice.toLocaleString()
                                        : `${item.originalPrice ?? '-'}`}원
                                </span>
                                <span className="sale-price">
                                    {typeof item.salePrice === 'number'
                                        ? item.salePrice.toLocaleString()
                                        : `${item.salePrice ?? '-'}`}원
                                </span>
                            </div>

                            {/* 버튼 조건 분기 */}

                            {/* 마감 완료 상태일때 */}
                            {item.status === "COMPLETED" ? (
                                hasOrder ? (
                                    <button className="buy-button" disabled>
                                        신청 완료(구매대기)
                                    </button>
                                ) : (
                                    <button className="buy-button" disabled>
                                        마감 완료
                                    </button>
                                )
                            ) : item.status !== "OPEN" ? (
                                <button className="buy-button" disabled>
                                    마감 종료
                                </button>
                            ) : (
                                hasOrder ? (
                                    // <button className="buy-button" disabled>
                                    // 이미 신청함
                                    // </button>
                                    // 만약 취소 허용하려면
                                    <button className="buy-button" onClick={handleCancel}>신청 취소</button>
                                ) : (
                                    <button className="buy-button" onClick={handleApply}>
                                        구매 신청(결제)
                                    </button>
                                )
                            )}


                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default GroupBuyInfoPage;