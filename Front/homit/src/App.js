import './App.css';
import MainPage from './pages/mainpage/MainPage';
import { Route, Routes } from 'react-router-dom';
import GroupBuyPage from './pages/groupbuypage/GroupBuyPage';
import BoardPage from './pages/boardpage/BoardPage';
import RecipePage from './pages/RecipePage';
import HotItemPage from './pages/hotitempage/HotItemPage';
import LoginPage from './pages/loginpage/LoginPage';
import MemberPage from './pages/memberpage/MemberPage';
import Layout from './components/Layout';
import GroupBuyInfoPage from './pages/groupbuypage/GroupBuyInfoPage';
import GroupBuyWritePage from './pages/groupbuypage/GroupBuyWritePage';
import BoardInfoPage from './pages/boardpage/BoardInfoPage';
import BoardWritePage from './pages/boardpage/BoardWritePage';


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/groupbuy" element={<GroupBuyPage />} />
        <Route path="/groupbuy/info/:id" element={<GroupBuyInfoPage />} />
        <Route path="/groupbuy/write" element={<GroupBuyWritePage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/board/info/:id" element={<BoardInfoPage />} />
        <Route path="/board/write" element={<BoardWritePage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/popular" element={<HotItemPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/member" element={<MemberPage />} />
      </Routes>
    </Layout>

  );
}

export default App;