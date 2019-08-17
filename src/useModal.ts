import * as React from 'react'

import { ModalConfig, Modal, ModalState } from './useModal.interface'

const ESCAPE_KEY = 27

const DEFAULT_CONFIG: Omit<ModalConfig<HTMLElement>, 'ref'> = {
  animationDuration: 300,
  animated: false,
  persistent: false,
  open: false,
}

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

  const shouldDelayOpening = !hasAlreadyRendered.current && animated

  const [canBeOpened, setCanBeOpened] = React.useState<boolean>(
    !shouldDelayOpening
  )

  React.useEffect(() => {
    hasAlreadyRendered.current = true

    if (!canBeOpened) {
      setCanBeOpened(true)
    }
  }, [canBeOpened])

  return !!(canBeOpened && open)
}

const useModal = <
  ContainerElement extends HTMLElement = HTMLDivElement,
  OverlayElement extends HTMLElement = HTMLDivElement
>(
  baseConfig: Partial<ModalConfig<ContainerElement>>
): Modal<ContainerElement, OverlayElement> => {
  const config: ModalConfig<ContainerElement> = {
    ...DEFAULT_CONFIG,
    ...baseConfig,
  }

  const open = useDelayedOpen(config.open, config.animated)
  const hasAlreadyBeenOpened = useHasAlreadyBeenOpened(open)

  const domRef = useMergedRef<ContainerElement>(config.ref)
  const configRef = React.useRef(config)

  const [isLocalOpened, setLocalOpened] = React.useState<boolean>(false)

  React.useEffect(() => {
    configRef.current = config
  })

  React.useLayoutEffect(() => {
    if (!configRef.current.animated && open !== isLocalOpened) {
      setLocalOpened(open)
    }
  }, [isLocalOpened, open])

  const handleClose = React.useCallback((e = null) => {
    if (configRef.current.onClose) {
      configRef.current.onClose(e)
    }
  }, [])

  const handleOverlayClick = React.useCallback(
    e => {
      if (
        !configRef.current.persistent &&
        configRef.current.open &&
        domRef.current &&
        !domRef.current.contains(e.target)
      ) {
        handleClose(e)
      }
    },
    [domRef, handleClose]
  )

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
        e.keyCode === ESCAPE_KEY
      ) {
        handleClose(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

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

  return {
    state,
    close: handleClose,
    overlayClick: handleOverlayClick,
    ref: domRef,
    hasAlreadyBeenOpened,
  }
}

export default useModal
