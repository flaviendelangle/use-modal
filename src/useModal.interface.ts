import * as React from 'react'

export type ModalFullConfig<
  ContainerElement extends HTMLElement = HTMLDivElement,
  Value = any
> = {
  open: boolean
  persistent: boolean

  /**
   * If false, the state will jump from `opened` to `closed`
   * If true, the state will have an `opening` and `closing` phase lasting `animationDuration`
   */
  animated: boolean

  /**
   * Duration of the `opening` and `closing` state in millisecond
   */
  animationDuration: number
  onClose: () => void
  ref?: React.Ref<ContainerElement>

  /**
   * Value cached from the last time the modal was opening / opened
   * Can be useful if you want to keep Modal UI consistent during `closing` phase while resetting your application state.
   * For instance :
   * ```tsx
   * const MyComponent = () => {
   *   const [selectedRow, setSelectedRow] = React.useState(null)
   *   const ref = React.useRef(null)
   *   const modal = useModal({ ref, onClose: () => setSelectedRow(null), open: selectedRow !== null, value: selectedRow })
   *
   *   return (
   *     <React.Fragment>
   *       <MyTable onSelectRow={setSelectedRow} />
   *       { modal.state !== ModalState.closed && <MyModal row={modal.value} /> }
   *     </React.Fragment>
   *   )
   *
   * }
   * ```
   */
  value: Value
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

export type Modal<
  ContainerElement extends HTMLElement = HTMLDivElement,
  Value = any
> = {
  state: ModalState
  close: (...args: any[]) => void
  ref: React.RefObject<ContainerElement>
  hasAlreadyBeenOpened: boolean
  value: Value
  persistent: boolean
  animated: boolean
  animationDuration: number
}
