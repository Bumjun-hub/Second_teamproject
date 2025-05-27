import { useState } from "react";
import Section from "../../components/Section";
import { dummyGroupBuyData } from '../../data/dummyGroupBuyData';
import { useNavigate } from "react-router-dom";
import './HotItemPage.css';

const HotItemPage = () => {
    const [data] = useState(dummyGroupBuyData);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const navigate = useNavigate();

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <>
            <Section>
                <div className="HotItemlist">
                    <div className="Hotitemlist-inner">
                        <div className="Pageinfo">
                            <div className="board-header">
                                <h2 className="board-title">인기있는 상품을 한눈에 확인해보세요!</h2>
                            </div>
                        </div>
                        
                        {currentItems.map((item) => (
                            <div key={item.id} className="HotItem">
                                <img src={item.image} alt={item.name} className="item-image" />
                                <h3>{item.name}</h3>
                                <p>{item.price}</p>
                                <button className="apply-button" onClick={() => window.open(item.link, "_blank")}>상세 보기</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            style={{
                                margin: "0 5px",
                                padding: "8px 16px",
                                backgroundColor: currentPage === index + 1 ? "#2668A7" : "#ddd",
                                color: currentPage === index + 1 ? "#fff" : "#000",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </Section>
        </>
    );
};

export default HotItemPage;
