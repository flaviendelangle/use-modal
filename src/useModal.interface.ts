import * as React from 'react'

export type ModalConfig<RefElement> = {
  open?: boolean
  persistent?: boolean
  animated?: boolean
  animationDuration?: number
  onClose?: (e: Event) => void
  ref?: React.Ref<RefElement>
}

export enum ModalState {
  opening = 'opening',
  opened = 'opened',
  closing = 'closing',
  closed = 'closed',
}

export type Modal<RefElement> = {
  state: ModalState
  close: (e?: Event) => void
  overlayClick: (e: Event) => void
  ref: React.Ref<RefElement>
  hasAlreadyBeenOpened: boolean
}
