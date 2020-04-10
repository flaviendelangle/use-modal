import * as React from 'react'

export type ModalFullConfig<
  ContainerElement extends HTMLElement = HTMLDivElement
> = {
  open: boolean
  persistent: boolean
  animated: boolean
  animationDuration: number
  onClose: () => void
  ref?: React.Ref<ContainerElement>
}

export type ModalConfig<
  ContainerElement extends HTMLElement = HTMLDivElement
> = Partial<ModalFullConfig<ContainerElement>>

export enum ModalState {
  opening = 'opening',
  opened = 'opened',
  closing = 'closing',
  closed = 'closed',
}

export type Modal<ContainerElement extends HTMLElement = HTMLDivElement> = {
  state: ModalState
  close: (...args: any[]) => void
  ref: React.RefObject<ContainerElement>
  hasAlreadyBeenOpened: boolean
}
