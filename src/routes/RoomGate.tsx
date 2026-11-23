import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import { isValidCode, normalizeCode } from '../domain/code'
import { firstIncompleteIndex } from '../domain/progress'
import type { Participant, Room } from '../domain/types'
import { useAuth } from '../firebase/useAuth'
import { useRoom } from '../firebase/useRoom'
import { PillButton } from '../ui/PillButton'
import JoinName from './JoinName'
import Rate from './Rate'
import Results from './Results'
import { RoomContext } from './RoomContext'
import Waiting from './Waiting'

export type GateView = 'loading' | 'not-found' | 'removed' | 'join' | 'rate' | 'wait' | 'results'

export function decideView(args: {
  room: Room | null | undefined
  me: Participant | null
  wasMember: boolean
  isCreator: boolean
}): GateView {
  const { room, me, wasMember, isCreator } = args
  if (room === undefined) return 'loading'
  if (room === null) return 'not-found'
  if (wasMember && !me) return 'removed'
  if (room.status === 'preview' || room.status === 'locked') return 'results'
  if (!me) return 'join'
  return isCreator ? 'wait' : 'rate'
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 via-sky-50 to-violet-50">
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4 text-center">
        {children}
      </main>
    </div>
  )
}

export default function RoomGate() {
  const params = useParams()
  const code = normalizeCode(params.code ?? '')
  const uid = useAuth()
  const validCode = isValidCode(code)
  const value = useRoom(validCode ? code : '')
  const { room, me, isCreator, error } = value
  const navigate = useNavigate()
  const location = useLocation()
  const wasMember = useRef(false)
  const prevStatus = useRef<string | undefined>(undefined)
  if (me) wasMember.current = true

  const view = decideView({ room, me, wasMember: wasMember.current, isCreator })
  const sub = location.pathname.split('/').slice(3).join('/')
  const status = room?.status

  let target: string | null = null
  if (room && me) {
    const onRate = sub.startsWith('rate/')
    const justClosed = prevStatus.current === 'open' && status === 'preview'
    if (status === 'locked') target = sub === 'results' ? null : 'results'
    else if (status === 'preview') {
      target = justClosed || !(onRate || sub === 'results') ? 'results' : null
    } else if (view === 'wait') {
      target = sub === 'wait' || onRate ? null : 'wait'
    } else {
      target = onRate || sub === 'wait' ? null : `rate/${firstIncompleteIndex(me, room.entries, room.criteria)}`
    }
  } else if (room && view === 'results') {
    target = sub === 'results' ? null : 'results'
  }

  useEffect(() => {
    prevStatus.current = status
  })
  useEffect(() => {
    if (target) navigate(`/r/${code}/${target}`, { replace: true })
  }, [target, navigate, code])

  if (!validCode) return <Shell><p>No room with this code</p></Shell>
  if (error) {
    return (
      <Shell>
        <p>Could not load this room</p>
        <PillButton onPress={() => window.location.reload()}>Try again</PillButton>
      </Shell>
    )
  }
  if (view === 'loading' || uid === null) return <Shell><p>Loading...</p></Shell>
  if (view === 'not-found') return <Shell><p>No room with this code</p></Shell>
  if (view === 'removed') {
    return (
      <Shell>
        <p>You were removed from this room</p>
        <PillButton onPress={() => navigate('/')}>Back to start</PillButton>
      </Shell>
    )
  }
  if (view === 'join') {
    return <Shell><h1 className="text-2xl font-bold">{room?.name}</h1><JoinName code={code} uid={uid} /></Shell>
  }

  return (
    <RoomContext.Provider value={{ ...value, uid, code }}>
      <Routes>
        <Route path="rate/:index" element={<Rate />} />
        <Route path="wait" element={<Waiting />} />
        <Route path="results" element={<Results />} />
        <Route path="*" element={null} />
      </Routes>
    </RoomContext.Provider>
  )
}
