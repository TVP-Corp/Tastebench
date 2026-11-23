import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { formatTenths } from '../domain/score'
import type { ResultsSnapshot } from '../domain/types'

interface Props {
  data: ResultsSnapshot
  entryId: string | null
  onClose: () => void
}

export function EntryDetail({ data, entryId, onClose }: Props) {
  const entry = data.entries.find((e) => e.id === entryId)
  const cell = (uid: string, cid: string) => {
    const v = data.participants.find((p) => p.uid === uid)?.scores[entryId ?? '']?.[cid]
    return v === 'skip' ? 'skipped' : typeof v === 'number' ? formatTenths(v) : '-'
  }
  return (
    <ModalOverlay
      isOpen={entry !== undefined}
      onOpenChange={(o) => !o && onClose()}
      isDismissable
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    >
      <Modal className="max-h-[85dvh] w-full max-w-md overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <Dialog className="flex flex-col gap-4 outline-none">
          <Heading slot="title" className="text-lg font-semibold">{entry?.title}</Heading>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-1 pr-2">Person</th>
                  {data.criteria.map((c) => <th key={c.id} className="px-2 py-1">{c.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p) => (
                  <tr key={p.uid} className="border-t border-neutral-200">
                    <td className="py-1 pr-2 font-medium">{p.name}</td>
                    {data.criteria.map((c) => <td key={c.id} className="px-2 py-1">{cell(p.uid, c.id)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            {data.participants.filter((p) => p.notes[entryId ?? '']).map((p) => (
              <p key={p.uid} className="text-sm"><span className="font-medium">{p.name}:</span> {p.notes[entryId ?? '']}</p>
            ))}
          </div>
          <Button
            onPress={onClose}
            className="min-h-11 rounded-full text-base font-medium text-neutral-700 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
          >
            Close
          </Button>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
