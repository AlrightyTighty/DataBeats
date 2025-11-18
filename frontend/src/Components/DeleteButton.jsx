import API from '../lib/api.js';
import { useNavigate } from 'react-router';
import { createPortal } from 'react-dom';
import '../css/DeleteButton.css'

export default function DeleteButton({ strwhattodelete, api, state, clickFunction, styles }) {

    const navigate = useNavigate();

    const deletefn = async () => {
        const response = await fetch(api, {
            method: "DELETE",
            credentials: "include"
        });
        if (!response.ok) {
            console.log(`Failed to delete ${strwhattodelete}...`)
        }
        else {
            console.log(`${strwhattodelete.charAt(0).toUpperCase()}${strwhattodelete.slice(1)} deleted!`)
            if (strwhattodelete == 'account') navigate('/logout');
            else navigate('/page-not-found');
        }
    }

    const modal = <div className="modal-delete">
        <h1 style={{fontSize: '1.5rem', margin: '0 0 12px 0'}}>Are you sure you'd like to delete this {strwhattodelete}?</h1>
        <p>THIS ACTION CANNOT BE UNDONE</p>
        <div className="button-row">
            <button type="button" className="cancel" onClick={clickFunction}>CANCEL</button>
            <button type="button" className="confirm-delete" onClick={deletefn}>DELETE</button>
        </div>
    </div>

    return <>
        <button type="button" className={`delete-button ${styles}`} onClick={clickFunction}>DELETE {strwhattodelete.toUpperCase()}</button>
        {state && createPortal(modal, document.body)}
    </>
}