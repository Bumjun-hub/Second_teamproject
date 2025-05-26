import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GroupBuyWritePage.css';
import { dummyGroupBuyData } from '../data/dummyGroupBuyData';

const GroupBuyWritePage = () => {
    const [formData, setFormData] = useState({
        title: '',
        link: '',
        image: '',
        content: '',
        price: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            ...formData,
            id: dummyGroupBuyData.length + 1,
        };
        navigate('/groupbuy', { state: { newItem } });
    };

    const handleCancel = () => {
        navigate('/groupbuy');
    };

    return (
        <div className="write-wrapper">
            <div className="top-buttons">
                <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                <button type="submit" form="writeForm" className="submit-button">등록</button>
            </div>
            <div className="write-container">
                <form id="writeForm" className="input-form" onSubmit={handleSubmit}>
                    <label>제목</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="제목을 입력해주세요" required />

                    <div className="row-group">
                        <div className="link-group">
                            <label>제품 상세보기 링크</label>
                            <input name="link" value={formData.link} onChange={handleChange} placeholder="제품 상세보기 URI를 입력해주세요" />
                        </div>
                        <div className="image-group">
                            <label>제품 이미지</label>
                            <input type="file" accept="img/*" onChange={handleImageChange} />
                            {formData.image && <img src={formData.image} alt='미리보기' style={{ marginTop: '10px', maxWidth: '100%' }} />}
                        </div>
                    </div>

                    <label>내용</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} placeholder="내용을 입력해주세요" required />
                </form>
            </div>
        </div>
    );
};

export default GroupBuyWritePage;