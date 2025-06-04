import React, { useState, useEffect } from 'react';
import AddressInput from '../memberpage/AddressInput'; 
import './MyPageEditProfile.css';

const MyPageEditProfile = () => {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', detailAddress: '', imageUrl: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [availableImages, setAvailableImages] = useState([]);

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
      // 에러 처리 제거
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
      // 에러 처리 제거
    }
  };

  const startEdit = () => {
    setEditData({ ...profile });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const updateProfile = async () => {
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

      if (!profileResponse.ok) return;

      // 프로필 이미지 업데이트
      let finalImageUrl = profile.imageUrl;
      
      if (editData.imageUrl && editData.imageUrl !== profile.imageUrl) {
        const imageName = editData.imageUrl.substring(editData.imageUrl.lastIndexOf('/') + 1);
        const imageResponse = await fetch('/api/profile/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_imageName: imageName })
        });

        if (imageResponse.ok) {
          finalImageUrl = editData.imageUrl;
        }
      }

      // 성공 처리
      const data = await profileResponse.json();
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

    } catch (err) {
      // 에러 처리 제거
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
              <input
                type="tel"
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="전화번호를 입력하세요"
                maxLength="13"
              />
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
        </div>

        {editMode && (
          <div className="action-buttons">
            <button onClick={cancelEdit} className="cancel-button1">취소</button>
            <button onClick={updateProfile} className="save-button">저장</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPageEditProfile;