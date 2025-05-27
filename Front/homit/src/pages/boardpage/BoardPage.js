import { useNavigate } from "react-router-dom";
import Section from "../../components/Section";
import { boarddummyData } from '../../data/dummyGroupBuyData';
import { useState } from "react";
import './BoardPage.css';

const BoardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(boarddummyData);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const categories = ['전체', '자유게시판', '꿀팁', '공구후기', '요리후기'];
    const [selectedCategory, setSelectedCategory] = useState('전체');



    return (
        <>

            <Section>
                <div className="section-action-button">

                </div>

                <div className="Pageinfo">
                    <div className="board-header">
                        <h2 className="board-title">다양한 정보를 공유해보세요!</h2>
                    </div>
                </div>
                <div className="category-filter">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={selectedCategory === cat ? 'active' : ''}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="boardtable-container">
                    <button className="write-button" onClick={() => navigate("/board/write")}>
                        글쓰기
                    </button>
                    <table className="board-table">
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>제목</th>
                                <th>작성자</th>
                                <th>작성일</th>
                                <th>조회</th>
                                <th>추천</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.category}</td>
                                    <td><a onClick={() => { navigate(`/board/info/${item.id}`) }}>{item.title}</a></td>
                                    <td>{item.writer}</td>
                                    <td>{item.date}</td>
                                    <td>{item.count}</td>
                                    <td>{item.like}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="board-pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                className={currentPage === index + 1 ? 'active' : ''}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>


        </>
    )

}
export default BoardPage;