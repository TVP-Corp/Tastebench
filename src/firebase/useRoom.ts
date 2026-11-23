import { useEffect, useState } from 'react'
import type { Participant, Room } from '../domain/types'
import { subscribeParticipants, subscribeRoom } from './rooms'
import { useAuth } from './useAuth'

export function useRoom(code: string): {
  room: Room | null | undefined
  participants: Participant[]
  me: Participant | null
  isCreator: boolean
} {
  const uid = useAuth()
  const [room, setRoom] = useState<Room | null | undefined>(undefined)
  const [participants, setParticipants] = useState<Participant[]>([])
  useEffect(() => {
    setRoom(undefined)
    setParticipants([])
    const offRoom = subscribeRoom(code, setRoom)
    const offParts = subscribeParticipants(code, setParticipants)
    return () => { offRoom(); offParts() }
  }, [code])
  const me = participants.find((p) => p.uid === uid) ?? null
  return { room, participants, me, isCreator: !!room && room.creatorUid === uid }
}
