import { useState } from "react";
import Section from "../components/Section";
import './GroupBuyPage.css';
// 8 아이템마다 페이지 나누기
const ITEMS_PER_PAGE = 8;

const GroupBuyPage = () => {

    const [currentPage, setCurrentPage] = useState(1);


    // 더미데이터 추후에 테이블에 있는 글 목록 불러오기
    const dummyData = [
        { id: 1, name: "무선 청소기", price: "35,000원" },
        { id: 2, name: "유기농 쌀", price: "22,000원" },
        { id: 3, name: "계란 30구", price: "7,500원" },
        { id: 4, name: "생수 2L x 6", price: "4,200원" },
        { id: 5, name: "주방세제 세트", price: "9,800원" },
        { id: 6, name: "주방세제 세트", price: "9,800원" },
        { id: 7, name: "주방세제 세트", price: "9,800원" },
        { id: 8, name: "주방세제 세트", price: "9,800원" },
        { id: 9, name: "주방세제 세트", price: "9,800원" },
        { id: 10, name: "주방세제 세트", price: "9,800원" },
        { id: 10, name: "주방세제 세트", price: "9,800원" }


    ];

    const totalPages = Math.ceil(dummyData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = dummyData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <>

            <Section>
                <div className="Pageinfo">
                        <h2>다양한 물건을 싸게 공동구매하세요!</h2>
                </div>

                {/* <div className="Groupbuylist">
                    <div className="Groupbuylist-inner">
                        <div className="GroupbuyItem">
                            <h2>아이템 영역</h2>
                        </div>
                        <div className="GroupbuyItem">
                            <h2>아이템 영역</h2>
                        </div>

                        <div className="GroupbuyItem">
                            <h2>아이템 영역</h2>
                        </div>

                        <div className="GroupbuyItem">
                            <h2>아이템 영역</h2>
                        </div>
                        <div className="GroupbuyItem">
                            <h2>아이템 영역</h2>
                        </div>
                    </div>
                </div> */}

                <div className="Groupbuylist">
                    <div className="Groupbuylist-inner">
                        {currentItems.map((item) => (
                            <div key={item.id} className="GroupbuyItem">
                                <h3>{item.name}</h3>
                                <p>{item.price}</p>
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
    )

}
export default GroupBuyPage;