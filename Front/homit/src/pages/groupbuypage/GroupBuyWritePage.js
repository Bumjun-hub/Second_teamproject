import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GroupBuyWritePage.css';
import Section from '../../components/Section';

const GroupBuyWritePage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        
        content: '',
        price: '',
        description: '',
        maxParticipants: 10,
        minParticipants: 1,
        maxQuantity: 5,
        originalPrice: 20000
    });

    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("status", "RECRUITING");
        form.append("title", formData.title);
        form.append("content", formData.content);
        form.append("description", formData.description);
        form.append("maxParticipants", formData.maxParticipants);
        form.append("minParticipants", formData.minParticipants);
        form.append("maxQuantity", formData.maxQuantity);
        form.append("originalPrice", formData.originalPrice);
        form.append("salePrice", parseInt(formData.price));
        form.append("deadline", new Date().toISOString().slice(0, 19));
        if (imageFile) form.append("images", imageFile);

        try {
            const res = await fetch("http://localhost:8080/api/groupBuy/admin/write", {
                method: "POST",
                credentials: "include",
                body: form,
            });

            if (res.ok) {
                alert("✅ 등록 완료!");
                navigate("/groupbuy");
            } else {
                const text = await res.text();
                alert("❌ 등록 실패: " + text);
            }
        } catch (err) {
            console.error("등록 중 오류:", err);
            alert("서버 오류 발생");
        }
    };

    const handleCancel = () => {
        navigate('/groupbuy');
    };

    return (
        <Section>
            <div className="write-wrapper">
                <form id="writeForm" className="input-form" onSubmit={handleSubmit}>
                    <label>제목</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="제목을 입력해주세요" required />

                    <div className="row-group">
                        {/* <div className="link-group">
                            <label>제품 상세보기 링크</label>
                            <input name="link" value={formData.link} onChange={handleChange} placeholder="제품 상세보기 URI를 입력해주세요" />
                        </div> */}
                        <div className="image-group">
                            <label>제품 이미지</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {formData.image && (
                                <img src={formData.image} alt="미리보기" style={{ marginTop: '10px', maxWidth: '100%' }} />
                            )}
                        </div>
                    </div>

                    <label>내용</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} placeholder="내용을 입력해주세요" required />

                    <label>상품 설명</label>
                    <input name="description" value={formData.description} onChange={handleChange} placeholder="상품 설명 입력" required />

                    <label>정가 (원)</label>
                    <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} required />

                    <label>할인가 (원)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleChange} required />

                    <label>최대 인원</label>
                    <input name="maxParticipants" type="number" value={formData.maxParticipants} onChange={handleChange} required />

                    <label>최소 인원</label>
                    <input name="minParticipants" type="number" value={formData.minParticipants} onChange={handleChange} required />

                    <label>최대 수량</label>
                    <input name="maxQuantity" type="number" value={formData.maxQuantity} onChange={handleChange} required />

                    <div className="form-buttons">
                        <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                        <button type="submit" className="submit-button">등록</button>
                    </div>
                </form>
            </div>
        </Section>
    );
};

export default GroupBuyWritePage;
