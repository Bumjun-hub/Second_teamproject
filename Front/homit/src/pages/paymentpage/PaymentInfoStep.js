import { useParams } from "react-router-dom";
import { useState } from "react";
import AddressInput from "../memberpage/AddressInput";

const UNIT_PRICE = 25000; // 임시 기본값, 부모 컴포넌트에서 salePrice 넘길 수 있음

const PaymentInfoStep = ({ form, setForm, onNext, onPrev, salePrice = UNIT_PRICE }) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  // 연락처 자동 하이픈
  const formatPhone = (value) => {
    const onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length < 4) return onlyNums;
    if (onlyNums.length < 7) return onlyNums.slice(0, 3) + '-' + onlyNums.slice(3);
    return onlyNums.slice(0, 3) + '-' + onlyNums.slice(3, 7) + '-' + onlyNums.slice(7, 11);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 연락처만 자동포맷
    if (name === "phone") {
      setForm(prev => ({ ...prev, phone: formatPhone(value) }));
    } else if (name === "quantity") {
      // 최소 1 이상 제한
      const safeVal = Math.max(1, Number(value));
      setForm(prev => ({ ...prev, quantity: safeVal }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // AddressInput 콜백
  const handleAddressChange = addr => setForm(prev => ({ ...prev, address: addr }));
  const handleDetailAddressChange = detailAddr => setForm(prev => ({ ...prev, detailAddress: detailAddr }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/order/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          quantity: Number(form.quantity),
          address: (form.address || "") + (form.detailAddress ? " " + form.detailAddress : ""),
          phone: form.phone,
          paymentName: form.paymentName,
          paymentBank: form.paymentBank,
        }),
      });
      setLoading(false);
      if (res.ok) {
        onNext();
      } else {
        const msg = await res.text();
        alert("신청 실패: " + msg);
      }
    } catch (err) {
      setLoading(false);
      alert("네트워크 오류: " + err.message);
    }
  };

  // 총 결제금액 계산
  const totalAmount = (salePrice || UNIT_PRICE) * (form.quantity || 1);

  return (
    <div className="info-step">
      <h2>주문 정보 입력</h2>
      <form onSubmit={handleSubmit} className="payment-form">
        <div>
          <label>이름</label>
          <input value={form.name || ""} name="name" onChange={handleChange} required />
        </div>
        <div>
          <label>수량</label>
          <input
            type="number"
            name="quantity"
            min={1}
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>총 결제금액</label>
          <input
            value={totalAmount.toLocaleString() + "원"}
            readOnly
            tabIndex={-1}
            style={{ background: "#f5f7fb" }}
          />
        </div>
        <AddressInput
          address={form.address}
          detailAddress={form.detailAddress}
          onAddressChange={handleAddressChange}
          onDetailAddressChange={handleDetailAddressChange}
          required
          label="배송지"
        />
        <div>
          <label>연락처</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            maxLength={13}
            required
          />
        </div>
        <div>
          <label>결제자명(입금자명)</label>
          <input
            type="text"
            name="paymentName"
            value={form.paymentName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>결제 은행</label>
          <input
            type="text"
            name="paymentBank"
            value={form.paymentBank}
            onChange={handleChange}
            placeholder="카카오뱅크, 국민은행 등"
            required
          />
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="button" onClick={onPrev} disabled={loading}>이전</button>
          <button type="submit" style={{ marginLeft: 16 }} disabled={loading}>
            {loading ? "신청 중..." : "다음"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentInfoStep;
