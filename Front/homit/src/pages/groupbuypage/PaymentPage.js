import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [groupBuy, setGroupBuy] = useState(null);

    // Homit으로 고정
    const [form, setForm] = useState({
        quantity: 1,
        address: '',
        phone: '',
        bankName: '농협',              // 고정
        paymentName: '',              // 사용자 입력
        paymentBank: '',              // 사용자 입력
        virtualAccount: '1234-5678-9012',
        accountHolderName: 'Homit',   // 고정
    });


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/mypage", { credentials: "include" })
            .then(res => res.json())
            .then(data => setUser(data));
    }, []);

    useEffect(() => {
        fetch(`/api/groupBuy/detail/${id}`)
            .then(res => res.json())
            .then(data => setGroupBuy(data));
    }, [id]);

    if (!user || !groupBuy) return <div>로딩중...</div>;

    const totalAmount = (groupBuy.salePrice || 0) * (form.quantity || 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/order/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    quantity: Number(form.quantity),
                    address: form.address,
                    phone: form.phone,
                    bankName: form.bankName,
                    paymentBank: form.paymentBank,
                    paymentName: form.paymentName,
                    virtualAccount: form.virtualAccount,
                    accountHolderName: form.accountHolderName,
                    totalAmount: totalAmount,
                }),
            });

            if (res.ok) {
                alert('주문이 완료되었습니다!');
                navigate('/groupbuy');
            } else {
                const msg = await res.text();
                alert('주문 실패: ' + msg);
            }
        } catch (err) {
            alert('서버 연결 실패');
        }
        setLoading(false);
    };

    return (
        <div className="payment-page">
            <h2 className="payment-title">공동구매 결제</h2>
            <div className="payment-info">
                <h3>{groupBuy.title}</h3>
                <img src={groupBuy.imgUrls?.[0]} alt={groupBuy.title} />
                <p>할인가: <b>{groupBuy.salePrice.toLocaleString()}원</b></p>
            </div>
            <form className="payment-form" onSubmit={handleSubmit}>
                {/* 1. 이름(사용자이름, 읽기전용) */}
                <div>
                    <label>이름</label>
                    <input value={user.name || ''} disabled readOnly />
                </div>

                {/* 2. 수량 */}
                <div>
                    <label>수량</label>
                    <input
                        type="number"
                        name="quantity"
                        min={1}
                        max={groupBuy.maxQuantity}
                        value={form.quantity}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* 3. 배송지 */}
                <div>
                    <label>배송지</label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="배송지 주소 입력"
                        required
                    />
                </div>

                {/* 4. 연락처 */}
                <div>
                    <label>연락처</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                        required
                    />
                </div>

                {/* --- 구분선 --- */}
                <div className="payment-divider"></div>

                {/* 5. 가상계좌 */}
                <div>
                    <label>가상계좌</label>
                    <input
                        name="virtualAccount"
                        value={form.virtualAccount}
                        disabled
                        readOnly
                    />
                </div>

                {/* 6. 예금주 */}
                <div>
                    <label>예금주</label>
                    <input
                        name="accountHolderName"
                        value={form.accountHolderName}
                        disabled
                        readOnly
                    />
                </div>

                {/* 7. 은행명(입금받을 은행) */}
                <div>
                    <label>은행명</label>
                    <input
                        name="bankName"
                        value="농협"
                        disabled
                        readOnly
                    />
                </div>

                {/* 8. 결제 은행 */}
                <div>
                    <label>결제 은행</label>
                    <input
                        name="paymentBank"
                        value={form.paymentBank}
                        onChange={handleChange}
                        placeholder="카카오뱅크, 국민은행 등"
                        required
                    />
                </div>

                {/* 9. 결제자명 */}
                <div>
                    <label>결제자명</label>
                    <input
                        name="paymentName"
                        value={form.paymentName}
                        onChange={handleChange}
                        placeholder="실제 송금자 이름"
                        required
                    />
                </div>

                {/* 10. 총 결제금액 */}
                <div>
                    <label>총 결제금액</label>
                    <input value={totalAmount.toLocaleString() + '원'} disabled readOnly />
                </div>

                <button type="submit" disabled={loading} className="payment-submit-btn">
                    {loading ? "주문 처리 중..." : "결제하기"}
                </button>
            </form>

        </div>
    );
};

export default PaymentPage;
