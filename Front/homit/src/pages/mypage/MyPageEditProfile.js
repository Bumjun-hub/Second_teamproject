import React, { useState, useEffect } from 'react';
import './MyPageEditProfile.css';

const MyPageEditProfile = () => {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', imageUrl: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [availableImages, setAvailableImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAvailableImages();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mypage', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.username || data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          imageUrl: data.imageUrl || '/static/profileimages/default.jpg'
        });
      } else {
        setError(`서버 오류: ${response.status}`);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
      console.error('이미지 목록 로드 실패:', err);
    }
  };

  const startEdit = () => {
    setEditData({ ...profile });
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditData({});
    setError('');
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (imageUrl) => {
    setEditData(prev => ({ ...prev, imageUrl }));
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      
      // 1. 프로필 정보 업데이트
      const profileResponse = await fetch('/api/mypage/editProfile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          address: editData.address
        })
      });

      if (!profileResponse.ok) {
        throw new Error('프로필 업데이트 실패');
      }

      // 2. 프로필 이미지 업데이트 (변경된 경우에만)
      if (editData.imageUrl && editData.imageUrl !== profile.imageUrl) {
        const imageName = editData.imageUrl.substring(editData.imageUrl.lastIndexOf('/') + 1);
        const imageResponse = await fetch('/api/profile/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_imageName: imageName
          })
        });

        if (!imageResponse.ok) {
          throw new Error('프로필 이미지 업데이트 실패');
        }
      }

      // 3. 성공 처리
      const data = await profileResponse.json();
      setProfile({
        name: data.username || data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        imageUrl: editData.imageUrl || profile.imageUrl
      });
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setEditMode(false);
      setEditData({});

    } catch (err) {
      setError(err.message || '업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1>프로필 편집</h1>
          {!editMode && (
            <button onClick={startEdit} className="edit-button">편집</button>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

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
                  <p className="selection-label">이미지 선택:</p>
                  <div className="image-grid">
                    {availableImages.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className={`image-option ${editData.imageUrl === imageUrl ? 'selected' : ''}`}
                        onClick={() => handleImageSelect(imageUrl)}
                      >
                        <img src={imageUrl} alt={`프로필 옵션 ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 기존 필드들 */}
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
              />
            ) : (
              <span>{profile.phone || '설정되지 않음'}</span>
            )}
          </div>

          <div className="field-group">
            <label>주소</label>
            {editMode ? (
              <textarea
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                rows={3}
              />
            ) : (
              <span>{profile.address || '설정되지 않음'}</span>
            )}
          </div>
        </div>

        {editMode && (
          <div className="action-buttons">
            <button onClick={cancelEdit} className="cancel-button">취소</button>
            <button onClick={updateProfile} disabled={loading} className="save-button">
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPageEditProfile;