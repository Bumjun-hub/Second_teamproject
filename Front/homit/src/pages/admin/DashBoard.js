import React, { useEffect, useState } from 'react';
import './DashBoard.css';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const [groupBuyId, setGroupBuyId] = useState('');
  const [applyList, setApplyList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [role,setRole] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const applyRes = await fetch(`/api/groupBuy/admin/${groupBuyId}/applyList`, {
        credentials: 'include',
      });

      if (!applyRes.ok) {
        throw new Error('신청자 데이터를 불러오지 못했습니다.');
      }

      const applyData = await applyRes.json();

      if (!Array.isArray(applyData)) {
        throw new Error('신청자 데이터 형식이 올바르지 않습니다.');
      }

      const orderRes = await fetch(`/api/order/admin/${groupBuyId}/order`, {
        credentials: 'include',
      });

      if (!orderRes.ok) {
        throw new Error('주문자 데이터를 불러오지 못했습니다.');
      }

      const orderData = await orderRes.json();

      if (!Array.isArray(orderData)) {
        throw new Error('주문자 데이터 형식이 올바르지 않습니다.');
      }

      setApplyList(applyData);
      setOrderList(orderData);
    } catch (error) {
      alert(error.message); // ✅ 사용자에게 알림
      setApplyList([]); // ✅ 안전하게 초기화
      setOrderList([]);
    }
  };

  // 상태 변경 api
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/order/admin/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('상태 변경 실패');
      }

      // 상태 변경 후 리스트 새로고침
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

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
        if (!role === "ROLE_ADMIN") {
          alert('접근 권한이 없습니다.');
          navigate('/');

        }
      } catch (e) {
        console.error("roleinfo 요청 실패:", e);
      }
    };
    fetchRole();
  }, []);




  return (
    <div className="admin-dashboard">
      <h2>공동구매 관리자 대시보드</h2>

      <div className="form-group">
        <input
          type="text"
          value={groupBuyId}
          onChange={(e) => setGroupBuyId(e.target.value)}
          placeholder="공동구매 ID 입력"
        />
        <button onClick={fetchData}>조회</button>
      </div>

      <div className="table-section">
        <h3>신청자 명단</h3>
        <table>
          <thead>
            <tr>
              <th>회원 ID</th>
              <th>이름</th>
              <th>신청 수량</th>
              <th>신청일</th>
            </tr>
          </thead>
          <tbody>
            {applyList.map((item, idx) => (
              <tr key={idx}>
                <td>{item.memberId}</td>
                <td>{item.username}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.appliedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-section">
        <h3>주문자 명단</h3>
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>주소</th>
              <th>전화번호</th>
              <th>총 금액</th>
              <th>수량</th>
              <th>계좌번호</th>
              <th>입금상태</th>

            </tr>
          </thead>
          <tbody>
            {orderList.map((item, idx) => (
              <tr key={idx}>
                <td>{item.username}</td>
                <td>{item.address}</td>
                <td>{item.phone}</td>
                <td>{item.totalAmount.toLocaleString()}원</td>
                <td>{item.quantity}</td>
                <td>{item.paymentBank}</td>
                <td>
                  <select
                    value={item.status}
                    onChange={(e) => updateOrderStatus(item.id, e.target.value)}>
                    <option value={"PENDING"}>입금 전</option>
                    <option value={"PAID"}>입금 완료</option>
                    <option value={"CANCELLED"}>취소됨</option>

                  </select>
                </td>


              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashBoard;
