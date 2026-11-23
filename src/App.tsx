import { HashRouter, Route, Routes } from 'react-router'
import CreateRoom from './routes/CreateRoom'
import Landing from './routes/Landing'
import RoomGate from './routes/RoomGate'
import { OfflineBanner } from './ui/OfflineBanner'

export default function App() {
  return (
    <HashRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/r/:code/*" element={<RoomGate />} />
      </Routes>
    </HashRouter>
  )
}
