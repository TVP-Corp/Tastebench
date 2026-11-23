import { createContext, useContext } from 'react'
import type { Participant, Room } from '../domain/types'

export interface RoomContextValue {
  room: Room | null | undefined
  participants: Participant[]
  me: Participant | null
  isCreator: boolean
  error: Error | null
  uid: string
  code: string
}

export const RoomContext = createContext<RoomContextValue | null>(null)

export function useRoomContext(): RoomContextValue {
  const v = useContext(RoomContext)
  if (!v) throw new Error('useRoomContext outside RoomGate')
  return v
}
