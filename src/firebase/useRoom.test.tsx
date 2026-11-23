import { renderHook } from '@testing-library/react'

const auth: { uid: string | null } = { uid: null }
vi.mock('./app', () => ({ db: {}, auth: {} }))
vi.mock('./useAuth', () => ({ useAuth: () => auth.uid }))
vi.mock('./rooms', () => ({
  subscribeRoom: vi.fn(() => vi.fn()),
  subscribeParticipants: vi.fn(() => vi.fn()),
}))
import { subscribeParticipants, subscribeRoom } from './rooms'
import { useRoom } from './useRoom'

describe('useRoom', () => {
  it('subscribes only once uid is set', () => {
    auth.uid = null
    const { result, rerender } = renderHook(() => useRoom('ABC234'))
    expect(subscribeRoom).not.toHaveBeenCalled()
    expect(subscribeParticipants).not.toHaveBeenCalled()
    expect(result.current.room).toBeUndefined()
    auth.uid = 'u1'
    rerender()
    expect(subscribeRoom).toHaveBeenCalledTimes(1)
    expect(subscribeParticipants).toHaveBeenCalledTimes(1)
  })
})
