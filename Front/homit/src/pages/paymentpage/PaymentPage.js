import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PaymentNoticeStep from './PayMentNoticeStep';
import PaymentInfoStep from './PaymentInfoStep';
import PaymentBankStep from './PaymentBankStep';
import './PaymentPage.css';

const PaymentPage = () => {
    const { id } = useParams();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        quantity: 1,
        address: "",
        detailAddress: "",
        phone: "",
        paymentName: "",
        paymentBank: "",
    });

    // 공동구매 게시글 정보 fetch
    const [groupBuy, setGroupBuy] = useState(null);

    useEffect(() => {
        fetch(`/api/groupBuy/detail/${id}`)
            .then(res => res.json())
            .then(data => setGroupBuy(data));
    }, [id]);

    if (!groupBuy) return <div>로딩중...</div>;

    // 마감일 포맷 (YYYY-MM-DDTHH:mm:ss 포맷이면 자동 변환)
    const formattedDeadline = groupBuy.deadline
        ? new Date(groupBuy.deadline).toLocaleString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : "-";

    return (
        <div className="payment-page">
            {step === 1 && (
                <PaymentNoticeStep
                    onNext={() => setStep(2)}
                    minParticipants={groupBuy.minParticipants}
                    deadline={formattedDeadline}
                />
            )}
            {step === 2 && (
                <PaymentInfoStep
                    form={form}
                    setForm={setForm}
                    onNext={() => setStep(3)}
                    onPrev={() => setStep(1)}
                    salePrice={groupBuy.salePrice} // 단가도 내려주면 결제금액 정확!
                />
            )}
            {step === 3 && (
                <PaymentBankStep
                    form={form}
                    onPrev={() => setStep(2)}
                />
            )}
        </div>
    );
};

export default PaymentPage;
