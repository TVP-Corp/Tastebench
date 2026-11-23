import type { ReactNode } from 'react'
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components'
import { PillButton, type PillVariant } from './PillButton'
import { overlayClass, sheetMotion } from './sheet'

interface Props {
  isOpen: boolean
  title: string
  body: ReactNode
  confirmLabel: ReactNode
  onConfirm: () => void
  onCancel: () => void
  variant?: PillVariant
}

export function ConfirmDialog({ isOpen, title, body, confirmLabel, onConfirm, onCancel, variant }: Props) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onCancel()} isDismissable className={overlayClass}>
      <Modal className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl ${sheetMotion}`}>
        <Dialog role="alertdialog" className="flex flex-col gap-4 outline-none">
          <Heading slot="title" className="text-lg font-semibold">
            {title}
          </Heading>
          <div className="text-neutral-700">{body}</div>
          <PillButton variant={variant} onPress={onConfirm}>
            {confirmLabel}
          </PillButton>
          <PillButton variant="tertiary" onPress={onCancel}>
            Cancel
          </PillButton>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
