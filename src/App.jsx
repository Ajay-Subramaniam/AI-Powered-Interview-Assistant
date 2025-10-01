import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Interviewee from './pages/Interviewee'
import CandidateList from './pages/CandidateList'
import NotFoundPage from './pages/NotFoundPage'
import CandidateProfile from './pages/CandidateProfile'
import LoaderProvider from './components/LoaderContext'

function App() {

  return (
      <LoaderProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/interviewee' element={<Interviewee />} />
            <Route path='/interviewer' element={<CandidateList />} />
            <Route path='/interviewer/:id' element={<CandidateProfile />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </LoaderProvider>
  )
}

export default App
