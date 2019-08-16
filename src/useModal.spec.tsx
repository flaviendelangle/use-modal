import { fireEvent } from '@testing-library/dom'
import { renderHook, act } from '@testing-library/react-hooks'
import * as sinon from 'sinon'

import useModal from './useModal'
import { ModalState } from './useModal.interface'

jest.useFakeTimers()

describe('useModal hook', () => {
  it('should return state = "closed" if config.open = false', () => {
    const config = { open: false }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.state).toBe(ModalState.closed)

    unmount()
  })

  it('should start opening on mount if not animated', () => {
    const config = { animated: false, open: true }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.state).toBe(ModalState.opened)

    unmount()
  })

  it('should switch directly from closed to opened if animated = false', () => {
    let config = { animated: false, open: false, animationDuration: 1000 }
    const { result, rerender, unmount } = renderHook(() => useModal(config))

    expect(result.current.state).toBe(ModalState.closed)

    config.open = true
    rerender()

    expect(result.current.state).toBe(ModalState.opened)

    unmount()
  })

  it('should switch from closed to opening to opened if animated = true', async () => {
    let config = { animated: true, open: false, animationDuration: 1000 }
    const { result, rerender, unmount } = renderHook(() => useModal(config))

    expect(result.current.state).toBe(ModalState.closed)

    config.open = true
    rerender()

    expect(result.current.state).toBe(ModalState.opening)

    act(() => {
      jest.advanceTimersByTime(999)
    })

    expect(result.current.state).toBe(ModalState.opening)

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(result.current.state).toBe(ModalState.opened)

    unmount()
  })

  it('should switch directly from opened to closed if animated = false and modal.close is called', () => {
    let config = { animated: false, open: true, animationDuration: 1000 }
    const { result, rerender, unmount } = renderHook(() => useModal(config))

    expect(result.current.state).toBe(ModalState.opened)

    config.open = false
    rerender()

    expect(result.current.state).toBe(ModalState.closed)

    unmount()
  })

  it('should switch from opened to closing to closed if animated = true and modal.close is called', async () => {
    let config = { animated: true, open: true, animationDuration: 1000 }
    const { result, rerender, unmount } = renderHook(() => useModal(config))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.state).toBe(ModalState.opened)

    config.open = false
    rerender()

    expect(result.current.state).toBe(ModalState.closing)

    act(() => {
      jest.advanceTimersByTime(999)
    })

    expect(result.current.state).toBe(ModalState.closing)

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(result.current.state).toBe(ModalState.closed)

    unmount()
  })

  it('should return hasAlreadyBeenOpened = false if the open = false', () => {
    const config = { open: false }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.hasAlreadyBeenOpened).toBe(false)

    unmount()
  })

  it('should return hasAlreadyBeenOpened = true if the open = true', () => {
    const config = { open: true }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.hasAlreadyBeenOpened).toBe(true)

    unmount()
  })

  it('should return hasAlreadyBeenOpened = true if the open switch from false to true', () => {
    const config = { open: false }
    const { result, rerender, unmount } = renderHook(() => useModal(config))

    expect(result.current.hasAlreadyBeenOpened).toBe(false)

    config.open = true
    rerender()

    expect(result.current.hasAlreadyBeenOpened).toBe(true)

    unmount()
  })

  it('should return the given ref if any', () => {
    const ref = { current: null }
    const config = { ref, open: false }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.ref).toBe(ref)

    unmount()
  })

  it('should return an empty ref if no ref given', () => {
    const config = { open: false }
    const { result, unmount } = renderHook(() => useModal(config))

    expect(result.current.ref).toMatchObject({ current: null })

    unmount()
  })

  it('should call onClose if click on overlay outside the modal and persistent = false', () => {
    const modalRef = ({ contains: () => false } as unknown) as HTMLElement
    const config = {
      open: true,
      animated: false,
      onClose: sinon.spy(),
      ref: { current: modalRef },
    }
    const { result, unmount } = renderHook(() => useModal(config))

    act(() => {
      result.current.overlayClick(({ target: null } as unknown) as Event)
    })

    expect(config.onClose.calledOnce).toBe(true)

    unmount()
  })

  it('should not call onClose if click on overlay outside the modal and persistent = true', () => {
    const modalRef = ({ contains: () => false } as unknown) as HTMLElement
    const config = {
      open: true,
      animated: false,
      persistent: true,
      onClose: sinon.spy(),
      ref: { current: modalRef },
    }
    const { result, unmount } = renderHook(() => useModal(config))

    act(() => {
      result.current.overlayClick(({ target: null } as unknown) as Event)
    })

    expect(config.onClose.notCalled).toBe(true)

    unmount()
  })

  it('should not call onClose if click on overlay inside the modal', () => {
    const modalRef = ({ contains: () => true } as unknown) as HTMLElement
    const config = {
      open: true,
      animated: false,
      onClose: sinon.spy(),
      ref: { current: modalRef },
    }
    const { result, unmount } = renderHook(() => useModal(config))

    act(() => {
      result.current.overlayClick(({ target: null } as unknown) as Event)
    })

    expect(config.onClose.notCalled).toBe(true)

    unmount()
  })

  it('should call onClose if press Escape', () => {
    const config = {
      open: true,
      animated: false,
      onClose: sinon.spy(),
    }
    const { unmount } = renderHook(() => useModal(config))

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape', keyCode: 27 })
    })

    expect(config.onClose.calledOnce).toBe(true)

    unmount()
  })

  it('should call onClose if press Escape and persistent = true', () => {
    const config = {
      open: true,
      animated: false,
      persistent: true,
      onClose: sinon.spy(),
    }
    const { unmount } = renderHook(() => useModal(config))

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape', keyCode: 27 })
    })

    expect(config.onClose.notCalled).toBe(true)

    unmount()
  })
})
