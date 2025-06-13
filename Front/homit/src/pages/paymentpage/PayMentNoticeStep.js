import { useState } from 'react';

const PaymentNoticeStep = ({ onNext, minParticipants = 5, deadline = "6월 15일 13:00" }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="notice-step">
      <h2>공동구매 신청 안내</h2>
      <div className="notice-box">
        <ul>
          <li>
            🛒 <b>공동구매 신청 안내</b><br/>
            이 공동구매는 최소 <b>{minParticipants}명</b> 이상 참여 시에만 진행되며,<br/>
            참여자가 부족한 경우 자동으로 취소 및 환불됩니다.
          </li>
          <li>
            💳 <b>결제(입금) 안내</b><br/>
            신청을 완료하면 입금 안내 페이지로 이동합니다.<br/>
            안내된 계좌로 입금해주시면, 관리자가 순차적으로 확인합니다.<br/>
            입금 후 반드시 입금자명과 동일한 이름으로 신청해주세요.<br/>
            입금 확인은 수동으로 진행되며, 확인까지 시간이 다소 소요될 수 있습니다.<br/>
            입금하신 뒤 24시간 이내로 운영자가 수동 확인 후, 입금 완료 상태로 변경됩니다.<br/>
            입금 후 상태가 변경되지 않으면 [문의하기] 버튼을 통해 알려주세요.
          </li>
          <li>
            ⏳ <b>마감 및 진행 여부</b><br/>
            공동구매는 마감일 (<b>{deadline}</b>) 까지 진행되며,<br/>
            해당 시점까지 결제(입금) 완료 인원이 최소인원을 넘을 경우에만<br/>
            공동구매가 성공적으로 진행됩니다.<br/>
            그렇지 않을 경우, 입금하신 금액은 전액 환불 처리됩니다.
          </li>
          <li>
            ❌ <b>취소 및 환불 안내</b><br/>
            신청 후 입금 전까지는 자유롭게 취소가 가능합니다.<br/>
            입금 후 취소는 불가능하며, 마감 이후 공동구매 실패 시 자동 환불됩니다.<br/>
            환불은 1~3일 이내 처리되며, 입금하신 계좌로 반환됩니다.
          </li>
          <li>
            📩 <b>추가 안내</b><br/>
            입금 및 공동구매 관련 문의사항은<br/>
            [운영자 이메일/문의채널]로 연락주시면 빠르게 도와드리겠습니다.
          </li>
        </ul>
      </div>
      <label className="check-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
        />
        안내사항을 모두 확인했습니다
      </label>
      <button
        className="next-btn"
        disabled={!checked}
        onClick={onNext}
      >
        다음
      </button>
    </div>
  );
};

export default PaymentNoticeStep;
