import { useNavigate } from 'react-router'
import { firstIncompleteIndex } from '../domain/progress'
import { ParticipantList } from '../ui/ParticipantList'
import { PillButton } from '../ui/PillButton'
import { Screen } from '../ui/Screen'
import { ShareCard } from '../ui/ShareCard'
import { useDocumentTitle } from '../ui/useDocumentTitle'
import { useRoomContext } from './RoomContext'

export default function Waiting() {
  const { room, me, code } = useRoomContext()
  const navigate = useNavigate()
  useDocumentTitle('Waiting room')
  if (!room) return null
  const edit = () => {
    const i = me ? firstIncompleteIndex(me, room.entries, room.criteria) : 0
    navigate(`/r/${code}/rate/${i}`)
  }
  return (
    <Screen title={room.name} subtitle="Waiting room">
      <div className="flex flex-col gap-4">
        <ShareCard />
        <ParticipantList onLeave={() => navigate('/')} />
        <PillButton variant="tertiary" onPress={edit}>
          Edit my ratings
        </PillButton>
      </div>
    </Screen>
  )
}
