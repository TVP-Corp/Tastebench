import { Button } from 'react-aria-components'
import { HashRouter, Route, Routes } from 'react-router'

function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center gap-4 p-4">
      <Button className="min-h-11 rounded-lg bg-indigo-600 px-4 text-white">Create a room</Button>
      <Button className="min-h-11 rounded-lg border border-indigo-600 px-4 text-indigo-600">
        Join a room
      </Button>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<p>Create</p>} />
        <Route path="/r/:code/*" element={<p>Room</p>} />
      </Routes>
    </HashRouter>
  )
}
