import React, { useEffect } from 'react';
import './AddressInput.css'; // 별도 CSS 파일 (선택사항)

const AddressInput = ({ 
    address = '', 
    detailAddress = '', 
    onAddressChange, 
    onDetailAddressChange,
    required = false,
    label = "주소",
    addressPlaceholder = "주소를 입력해주세요",
    detailPlaceholder = "상세주소를 입력해주세요 (아파트명, 동/호수 등)",
    className = ""
}) => {
    
    useEffect(() => {
        // 다음 우편번호 API 스크립트 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // 주소 검색 함수
    const findAddress = () => {
        if (!window.daum) {
            alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                // 도로명주소 우선, 없으면 지번주소 사용
                let selectedAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                
                // 부모 컴포넌트로 주소 전달
                if (onAddressChange) {
                    onAddressChange(selectedAddr);
                }
            }
        }).open();
    };

    const handleDetailAddressChange = (e) => {
        if (onDetailAddressChange) {
            onDetailAddressChange(e.target.value);
        }
    };

    return (
        <div className={`address-input-group ${className}`}>
            <label className="address-label">
                {label} {required && <span className="required">*</span>}
            </label>
            
            {/* 기본 주소 검색 */}
            <div className="address-search-container">
                <input
                    type="text"
                    value={address}
                    placeholder={addressPlaceholder}
                    className="address-input"
                    readOnly
                    required={required}
                />
                <button
                    type="button"
                    onClick={findAddress}
                    className="address-search-btn"
                >
                    주소 검색
                </button>
            </div>
            
            {/* 상세주소 입력 */}
            <input
                type="text"
                value={detailAddress}
                onChange={handleDetailAddressChange}
                placeholder={detailPlaceholder}
                className="detail-address-input"
            />
        </div>
    );
};

export default AddressInput;