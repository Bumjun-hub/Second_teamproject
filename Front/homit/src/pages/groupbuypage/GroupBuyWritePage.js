import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GroupBuyWritePage.css';
import Section from '../../components/Section';

const GroupBuyWritePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    productUrl: '',
    maxParticipants: 10,
    minParticipants: 1,
    maxQuantity: 5,
    originalPrice: 20000,
    salePrice: 10000,
    deadline: '',
    status: 'OPEN'
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [originalImageUrls, setOriginalImageUrls] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/groupBuy/detail/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title,
            content: data.content,
            description: data.description,
            productUrl: data.productUrl,
            maxParticipants: data.maxParticipants,
            minParticipants: data.minParticipants,
            maxQuantity: data.maxQuantity,
            originalPrice: data.originalPrice,
            salePrice: data.salePrice,
            deadline: data.deadline?.slice(0, 16),
            status: data.status
          });
          if (data.imgUrls && data.imgUrls.length > 0) {
            setOriginalImageUrls(data.imgUrls);
            setPreviewUrls(data.imgUrls);
          }
        });
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const handleImageRemove = (index) => {
    const removedUrl = previewUrls[index];
    if (originalImageUrls.includes(removedUrl)) {
      setRemovedImages((prev) => [...prev, removedUrl]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('status', formData.status);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('description', formData.description);
    data.append('productUrl', formData.productUrl);
    data.append('maxParticipants', formData.maxParticipants);
    data.append('minParticipants', formData.minParticipants);
    data.append('maxQuantity', formData.maxQuantity);
    data.append('originalPrice', formData.originalPrice);
    data.append('salePrice', formData.salePrice);
    data.append('deadline', formData.deadline);

    imageFiles.forEach((file) => {
      data.append('images', file);
    });

    if (isEdit) {
      // 삭제 대상 이미지 ID만 추출하여 넘김 (URL -> ID 매핑 필요할 경우 백엔드 기준 따라야 함)
      const deleteImageIds = removedImages.map((url, index) => index + 1); // 예시
      deleteImageIds.forEach(id => data.append('deleteImageIds', id));
    }

    const url = isEdit
      ? `/api/groupBuy/admin/edit/${id}`
      : '/api/groupBuy/admin/write';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: data,
      });

      if (response.ok) {
        alert(isEdit ? '공동구매 글이 수정되었습니다!' : '공동구매 글이 등록되었습니다!');
        navigate('/groupbuy');
      } else {
        const errorText = await response.text();
        alert('요청 실패: ' + errorText);
      }
    } catch (err) {
      console.error('요청 실패', err);
      alert('서버 연결 실패');
    }
  };

  const handleCancel = () => {
    navigate('/groupbuy');
  };

  return (
    <Section>
      <div className="write-wrapper">
        <div className="write-container">
          <form className="input-form" onSubmit={handleSubmit}>
            <h2>{isEdit ? '공동구매 글 수정' : '공동구매 글 작성'}</h2>

            <label>제목</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>제품 상세 링크</label>
            <input
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
            />

            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
            />

            <label>상품 설명</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <label>정가</label>
            <input
              name="originalPrice"
              type="number"
              value={formData.originalPrice}
              onChange={handleChange}
              required
            />

            <label>할인가</label>
            <input
              name="salePrice"
              type="number"
              value={formData.salePrice}
              onChange={handleChange}
              required
            />

            <label>최대 인원</label>
            <input
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
            />

            <label>최소 인원</label>
            <input
              name="minParticipants"
              type="number"
              value={formData.minParticipants}
              onChange={handleChange}
              required
            />

            <label>최대 수량</label>
            <input
              name="maxQuantity"
              type="number"
              value={formData.maxQuantity}
              onChange={handleChange}
              required
            />

            <label>마감일</label>
            <input
              name="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={handleChange}
              required
            />

            {previewUrls.length > 0 && (
              <div className="image-preview-area">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="image-preview-wrapper">
                    <img src={url} alt={`첨부 이미지 ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleImageRemove(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-bottom">
              <div className="button-area">
                <label className="upload-button">
                  이미지 첨부
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                <button type="submit" className="submit-button">{isEdit ? '수정' : '등록'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default GroupBuyWritePage;
