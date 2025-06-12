const PaymentBankStep = () => {
    // 팝업일 때 부모 새로고침
    const handleClose = () => {
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload(); // 부모 창 새로고침
        }
        window.close(); // 현재 창 닫기
    };

    return (
        <div className="bank-step">
            <h2>입금(결제) 안내</h2>
            <div className="bank-info-box">
                <div>
                    <label>가상계좌</label>
                    <input value="1234-5678-9012" readOnly />
                </div>
                <div>
                    <label>예금주</label>
                    <input value="Homit" readOnly />
                </div>
                <div>
                    <label>은행명</label>
                    <input value="농협" readOnly />
                </div>
            </div>
            <div style={{ margin: "24px 0" }}>
                <b>신청이 완료되었습니다!<br />
                    아래 계좌로 입금해주시면 운영자가 순차적으로 입금 확인 후,
                    입금 완료 상태로 변경됩니다.<br /><br />
                    문의는 [운영자 연락처]로 부탁드립니다.</b>
            </div>
            <button
                onClick={handleClose}
                style={{
                    width: "100%",
                    padding: "13px 0",
                    background: "#2668A7",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "7px",
                    border: "none",
                    fontSize: "1.13rem",
                    cursor: "pointer"
                }}
            >
                창 닫기
            </button>
        </div>
    );
};

export default PaymentBankStep;
