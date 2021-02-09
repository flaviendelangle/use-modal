import * as React from 'react'

import {
  Modal,
  ModalConfig,
  ModalFullConfig,
  ModalState,
} from './useModal.interface'

const ESCAPE_KEY = 'Escape'

const DEFAULT_CONFIG: Omit<ModalFullConfig<HTMLElement>, 'ref'> = {
  animationDuration: 300,
  animated: false,
  persistent: false,
  open: false,
  onClose: () => {},
  value: undefined,
}

const useSSRLayoutEffect =
  typeof window === 'object' ? React.useLayoutEffect : React.useEffect

const useMergedRef = <RefElement>(
  ref: React.Ref<RefElement> | null | undefined
): React.RefObject<RefElement> => {
  const innerRef = React.useRef<RefElement>(null)

  return (ref ? ref : innerRef) as React.RefObject<RefElement>
}

const useHasAlreadyBeenOpened = (open: boolean): boolean => {
  const hasAlreadyBeenOpened = React.useRef<boolean>(false)

  if (!hasAlreadyBeenOpened.current && open) {
    hasAlreadyBeenOpened.current = true
  }

  return hasAlreadyBeenOpened.current
}

const useDelayedOpen = (open: boolean, animated: boolean): boolean => {
  const hasAlreadyRendered = React.useRef<boolean>(false)

  const shouldDelayOpening = !hasAlreadyRendered.current && animated && open

  const [canBeOpened, setCanBeOpened] = React.useState<boolean>(
    !shouldDelayOpening
  )

  React.useEffect(() => {
    hasAlreadyRendered.current = true

    if (!canBeOpened) {
      setCanBeOpened(true)
    }
  }, [canBeOpened])

  return canBeOpened && open
}

const useValue = <Value = any>(value: Value, state: ModalState): Value => {
  const valueRef = React.useRef(value)

  if ([ModalState.opened, ModalState.opening].includes(state)) {
    valueRef.current = value
  }

  return valueRef.current
}

const useModal = <
  ContainerElement extends HTMLElement = HTMLDivElement,
  Value = any
>(
  baseConfig: ModalConfig<ContainerElement>
): Modal<ContainerElement, Value> => {
  const config: ModalFullConfig<ContainerElement, Value> = {
    ...DEFAULT_CONFIG,
    ...baseConfig,
  }

  const open = useDelayedOpen(config.open, config.animated)
  const hasAlreadyBeenOpened = useHasAlreadyBeenOpened(open)

  const domRef = useMergedRef<ContainerElement>(config.ref)
  const configRef = React.useRef(config)

  const [isLocalOpened, setLocalOpened] = React.useState<boolean>(false)

  const state = React.useMemo<ModalState>(() => {
    if (!open && !isLocalOpened) {
      return ModalState.closed
    }

    if (!open && isLocalOpened) {
      return ModalState.closing
    }

    if (open && !isLocalOpened) {
      return ModalState.opening
    }

    return ModalState.opened
  }, [open, isLocalOpened])

  const value = useValue(config.value, state)

  React.useEffect(() => {
    configRef.current = config
  })

  useSSRLayoutEffect(() => {
    if (!configRef.current.animated && open !== isLocalOpened) {
      setLocalOpened(open)
    }
  }, [isLocalOpened, open])

  const handleClose = React.useCallback(() => {
    configRef.current.onClose()
  }, [])

  React.useEffect(() => {
    if (configRef.current.animated) {
      const timeout = setTimeout(
        () => setLocalOpened(open),
        configRef.current.animationDuration
      )

      return () => clearTimeout(timeout)
    }
  }, [open])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !configRef.current.persistent &&
        configRef.current.open &&
        e.key === ESCAPE_KEY
      ) {
        handleClose()
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (
        !configRef.current.persistent &&
        state === ModalState.opened &&
        domRef.current &&
        !domRef.current.contains(e.target as Node)
      ) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [domRef, handleClose, isLocalOpened, state])

  return {
    state,
    close: handleClose,
    ref: domRef,
    hasAlreadyBeenOpened,
    value,
    animated: config.animated,
    animationDuration: config.animationDuration,
    persistent: config.persistent,
  }
}

export default useModal
