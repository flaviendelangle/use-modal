## useModal

Handle the most common use cases to create a Modal-like component :

- animation on enter / leave
- close when press Escape or click outside

The rendering part is up to you, this hook can be used for modals, drawers, dropdown menus and pretty much any thing with an opened and closed state.


[Usage](#usage)
[API](#api)


## Usage

### Simple example

```jsx harmony
import * as React from 'react'

const Modal = () => {
  const [open, setOpen] = React.useState(false)
  const modal = useModal({ open, onClose: () => setOpen(false) })

  return (
    <React.Fragment>
      <button onClick={() => setOpen(true)}>Open</button>
      <dialog open={modal.state === 'opened'}>
        Hello World
      </dialog>
    </React.Fragment>
  )
}
```


### Add fadeIn / fadeOut animation

```jsx harmony
import * as React from 'react'
import styled, { keyframes } from 'styled-components'

const FADE_IN = keyframes`
  from {
    background-color: transparent;
  }

  to {
    background-color: rgba(50, 50, 50, 0.7);
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 10;

  .opening {
    animation: ${FADE_IN} 300ms linear 0ms;
  }

  .closing {
    animation: ${FADE_IN} 300ms linear 0ms reverse;
    opacity: 0;
    pointer-events: none;
  }

  .closed {
    opacity: 0;
    pointer-events: none;
  }
`

const Modal = () => {
  const [open, setOpen] = React.useState(false)
  const modal = useModal({
    open,
    onClose: () => setOpen(false),
    animated: true,
    animationDuration: 300,
  })

  return (
    <React.Fragment>
      <button onClick={() => setOpen(true)}>Open</button>
      <Overlay className={modal.state}>
          <dialog open={modal.state !== 'closed'}>
            Hello World
          </dialog>
      </Overlay>
    </React.Fragment>
  )
}
```

## API

```typescript jsx
declare const useModal: <ContainerElement extends HTMLElement = HTMLDivElement>(
  baseConfig: Partial<ModalConfig<ContainerElement>>
) => Modal<ContainerElement>
```

### ModalConfig

| name | description | type | default value |
| --- | --- | --- | --- |
| open | is the modal open | boolean | false |
| onClose | callback to close the modal | function | - |
| persistent | should avoid closing the modal when press Escape or click outside | boolean | false |
| animated | should have a "opening" and "closing" state to allow CSS animations | boolean | false |
| animationDuration | time spent (in ms) in the "opening" and "closing" state | number | 300 |
| ref | React reference to the main DOM Node of the Modal (useful if your modal use React.forwardRef\<ContainerElement\>) | React.Ref | null | 

#### Modal\<ContainerElement\>

| name | description | type |
| --- | --- | --- |
| state | current state of the modal | 'opened' / 'closed' / 'opening' / 'closing' |
| close | callback to close the modal | () => void |
| ref | React reference to pass to the main DOM Node of the Modal | React.Ref\<ContainerElement\> |
| hasAlreadyBeenOpened | Has the Modal already been in state = "opened" | boolean |
