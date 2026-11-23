import type { ReactNode } from 'react'
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { PillButton } from './PillButton'
import { overlayClass, sheetMotion } from './sheet'

interface Props {
  isOpen: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({ isOpen, title, body, confirmLabel, onConfirm, onCancel, destructive }: Props) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onCancel()} isDismissable className={overlayClass}>
      <Modal className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl ${sheetMotion}`}>
        <Dialog role="alertdialog" className="flex flex-col gap-4 outline-none">
          <Heading slot="title" className="text-lg font-semibold">
            {title}
          </Heading>
          <div className="text-neutral-700">{body}</div>
          <PillButton variant={destructive ? 'destructive' : 'primary'} onPress={onConfirm}>
            {confirmLabel}
          </PillButton>
          <Button
            onPress={onCancel}
            className="min-h-11 rounded-full text-base font-medium text-neutral-700 outline-none transition-colors data-[hovered]:bg-neutral-900/5 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
          >
            Cancel
          </Button>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
