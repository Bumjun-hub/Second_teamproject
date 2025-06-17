import React, { useState, useEffect } from 'react';
import AddressInput from '../memberpage/AddressInput'; 
import './MyPageEditProfile.css';
import { deleteAccount } from '../../utils/authUtils';

const MyPageEditProfile = () => {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', detailAddress: '', imageUrl: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [availableImages, setAvailableImages] = useState([]);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAvailableImages();
  }, []);

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { address: '', detailAddress: '' };
    const parts = fullAddress.split(' ');
    if (parts.length > 3) {
      return { 
        address: parts.slice(0, -2).join(' '), 
        detailAddress: parts.slice(-2).join(' ') 
      };
    }
    return { address: fullAddress, detailAddress: '' };
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/mypage', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const { address, detailAddress } = parseAddress(data.address);
        
        setProfile({
          name: data.username || data.name,
          email: data.email,
          phone: data.phone,
          address,
          detailAddress,
          imageUrl: data.imageUrl || '/static/profileimages/profile1.jpg'  
        });
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err);
    }
  };

  const fetchAvailableImages = async () => {
    try {
      const response = await fetch('/api/profile/getimages', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const images = await response.json();
        setAvailableImages(images);
      }
    } catch (err) {
      console.error('이미지 로드 실패:', err);
    }
  };

  const startEdit = () => {
    setEditData({ ...profile });
    setEditMode(true);
    setPhoneError('');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditData({});
    setPhoneError('');
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value);
      
      // 전화번호 유효성 검사
      if (value && value.length > 0 && value.length !== 13) {
        setPhoneError(`전화번호는 13자리로 입력해주세요. (현재: ${value.length}자리)`);
      } else {
        setPhoneError('');
      }
    }
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 11자리 이상 입력 방지
    if (numbers.length > 11) {
      return editData.phone || '';
    }
    
    // 전화번호 포맷팅 (13자리: 010-1234-5678)
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const validateForm = () => {
    // 전화번호가 입력되었다면 13자리 검증
    if (editData.phone && editData.phone.length !== 13) {
      setPhoneError('전화번호는 13자리로 입력해주세요. (예: 010-1234-5678)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const updateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 프로필 정보 업데이트
      const profileResponse = await fetch('/api/mypage/editProfile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          address: `${editData.address} ${editData.detailAddress}`.trim()
        })
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('프로필 업데이트 실패:', errorText);
        alert('프로필 업데이트에 실패했습니다.');
        return;
      }

      // 프로필 이미지 업데이트
      let finalImageUrl = profile.imageUrl;
      let imageUpdated = false;
      
      if (editData.imageUrl && editData.imageUrl !== profile.imageUrl) {
        const imageName = editData.imageUrl.substring(editData.imageUrl.lastIndexOf('/') + 1);
        console.log('이미지 업데이트 시도:', imageName);
        
        const imageResponse = await fetch('/api/profile/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_imageName: imageName })
        });

        if (imageResponse.ok) {
          finalImageUrl = editData.imageUrl;
          imageUpdated = true;
          console.log('이미지 업데이트 성공');
          
          // ✅ 이미지만 변경된 경우에도 이벤트 발생
          window.dispatchEvent(new Event('profileUpdate'));
        } else {
          console.error('이미지 업데이트 실패');
        }
      }

      // 성공 처리
      const data = await profileResponse.json();
      console.log('서버 응답 데이터:', data);
      
      const { address, detailAddress } = parseAddress(data.address);
      
      setProfile({
        name: data.username || data.name,
        email: data.email,
        phone: data.phone,
        address,
        detailAddress,
        imageUrl: finalImageUrl
      });
      
      setEditMode(false);
      setEditData({});
      setPhoneError('');

      alert('프로필이 성공적으로 업데이트되었습니다.');

      // ✅ 프로필 업데이트 후 헤더와 마이페이지의 사용자 정보도 업데이트
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('profileUpdate'));

    } catch (err) {
      console.error('프로필 업데이트 중 오류:', err);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
          if (window.confirm('정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
              try {
                  const result = await deleteAccount();
                  if (result.success) {
                      alert('회원탈퇴가 완료되었습니다.');
                  }
              } catch (error) {
                  alert('회원탈퇴 중 오류가 발생했습니다.');
              }
          }
      };

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1>프로필 편집</h1>
          {!editMode && (
            <button onClick={startEdit} className="edit-button1">편집</button>
          )}
        </div>

        <div className="profile-content">
          {/* 프로필 이미지 섹션 */}
          <div className="field-group">
            <label>프로필 이미지</label>
            <div className="profile-image-section">
              <div className="current-image">
                <img 
                  src={editMode ? (editData.imageUrl || profile.imageUrl) : profile.imageUrl} 
                  alt="프로필 이미지" 
                  className="profile-image-preview"
                />
              </div>
              
              {editMode && (
                <div className="image-selection">
                  <p className="selection-label">이미지 선택 (선택사항):</p>
                  <div className="image-grid">
                    {availableImages.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className={`image-option ${editData.imageUrl === imageUrl ? 'selected' : ''}`}
                        onClick={() => handleInputChange('imageUrl', imageUrl)}
                      >
                        <img src={imageUrl} alt={`프로필 옵션 ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                  <p className="image-help-text">이미지를 선택하지 않으면 기존 이미지가 유지됩니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 기본 정보 필드들 */}
          <div className="field-group">
            <label>사용자명</label>
            {editMode ? (
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="사용자명을 입력하세요"
              />
            ) : (
              <span>{profile.name || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>이메일</label>
            {editMode ? (
              <input
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                disabled
              />
            ) : (
              <span>{profile.email || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>전화번호</label>
            {editMode ? (
              <div>
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="010-1234-5678 ( - 제외하고 입력 )"
                  maxLength="13"
                />
                {phoneError && (
                  <small className="phone-error" style={{color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                    {phoneError}
                  </small>
                )}
              </div>
            ) : (
              <span>{profile.phone || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>주소</label>
            {editMode ? (
              <AddressInput
                address={editData.address || ''}
                detailAddress={editData.detailAddress || ''}
                onAddressChange={(address) => handleInputChange('address', address)}
                onDetailAddressChange={(detailAddress) => handleInputChange('detailAddress', detailAddress)}
                label=""
                editMode={true}
                className=""
              />
            ) : (
              <span>{`${profile.address} ${profile.detailAddress}`.trim() || '설정되지 않음'}</span>
            )}
          </div>

          <div className="bottom-section">
                    <button 
                        onClick={handleDeleteAccount}
                        className="delete-account-btn"
                    >
                        회원탈퇴
                    </button>
                </div>
        </div>

        {editMode && (
          <div className="action-buttons">
            <button onClick={cancelEdit} className="cancel-button1">취소</button>
            <button 
              onClick={updateProfile} 
              className="save-button"
              disabled={!!phoneError}
            >
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPageEditProfile;