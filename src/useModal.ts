import * as React from 'react'

import {
  ModalConfig,
  ModalFullConfig,
  Modal,
  ModalState,
} from './useModal.interface'

const ESCAPE_KEY = 'Escape'

const DEFAULT_CONFIG: Omit<ModalFullConfig<HTMLElement>, 'ref'> = {
  animationDuration: 300,
  animated: false,
  persistent: false,
  open: false,
  onClose: () => {},
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

  return !!(canBeOpened && open)
}

const useModal = <ContainerElement extends HTMLElement = HTMLDivElement>(
  baseConfig: ModalConfig<ContainerElement>
): Modal<ContainerElement> => {
  const config: ModalFullConfig<ContainerElement> = {
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
        isLocalOpened &&
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
  }, [domRef, handleClose, isLocalOpened])

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
    ref: domRef,
    hasAlreadyBeenOpened,
  }
}

export default useModal
