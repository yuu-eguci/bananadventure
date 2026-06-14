import "@/App.css"
import HomePageV2 from "@/pages/HomePageV2"
import LorePage from "@/pages/LorePage"
import NotFoundPage from "@/pages/NotFoundPage"
import { Route, Routes } from "react-router-dom"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageV2 />} />
      <Route path="/lore" element={<LorePage />} />
      {/* その他のパスは 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

