import { useEffect, useState } from 'react'
import type { Participant, Room } from '../domain/types'
import { subscribeParticipants, subscribeRoom } from './rooms'
import { useAuth } from './useAuth'

export function useRoom(code: string): {
  room: Room | null | undefined
  participants: Participant[]
  me: Participant | null
  isCreator: boolean
  error: Error | null
} {
  const uid = useAuth()
  const [room, setRoom] = useState<Room | null | undefined>(undefined)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => {
    setRoom(undefined)
    setParticipants([])
    setError(null)
    const offRoom = subscribeRoom(code, setRoom, setError)
    const offParts = subscribeParticipants(code, setParticipants, setError)
    return () => { offRoom(); offParts() }
  }, [code])
  const me = participants.find((p) => p.uid === uid) ?? null
  return { room, participants, me, isCreator: !!room && room.creatorUid === uid, error }
}
