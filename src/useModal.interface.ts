import * as React from 'react'

export type ModalConfig<
  ContainerElement extends HTMLElement = HTMLDivElement
> = {
  open: boolean
  persistent: boolean
  animated: boolean
  animationDuration: number
  onClose?: (e: Event) => void
  ref?: React.Ref<ContainerElement>
}

export enum ModalState {
  opening = 'opening',
  opened = 'opened',
  closing = 'closing',
  closed = 'closed',
}

export type Modal<
  ContainerElement extends HTMLElement = HTMLDivElement,
  OverlayElement extends HTMLElement = HTMLDivElement
> = {
  state: ModalState
  close: (...args: any[]) => void
  overlayClick: (e: React.MouseEvent<OverlayElement> | MouseEvent) => void
  ref: React.Ref<ContainerElement>
  hasAlreadyBeenOpened: boolean
}
