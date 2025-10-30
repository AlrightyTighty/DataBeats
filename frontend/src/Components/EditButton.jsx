import { createPortal } from 'react-dom'               // allows rendering of children into different part of dom outside parent container
import '../css/EditButton.css'

export default function EditButton({ state, clickFunction, modal }) {           // when passing props to child component, always need to put them in { } - destructurng
    return (
        <>
            <button type="button" className="edit" onClick={clickFunction}>✎</button>

            {/* {state && jsx} is simplified ternary operator - if state (modal) is true, return jsx (modal content); else, do nothing */}
            {/* createPortal creates a portal for editing popup window by calling createPortal(jsx for children to teleport, dom node where it should be rendered) */}
            {/* react puts the dom nodes for the jsx passed (first param EditButton jsx component) inside of the dom node provided (second param document.body) */}
            {state && createPortal(modal, document.body)}
        </>
    )
}