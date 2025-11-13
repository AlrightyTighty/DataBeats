import API from '../lib/api.js';
import { useNavigate } from 'react-router';
import { createPortal } from 'react-dom';
import '../css/DeleteButton.css'

export default function DeleteButton({ strwhattodelete, api }) {

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
            navigate('/page-not-found');
        }
    }

    return <>
        <button type="button" className="delete-button" onClick={() => {
            if (confirm(`Are you sure you'd like to delete this ${strwhattodelete}?\nThis action cannot be undone.`)) {
                deletefn();
            }
        }}>DELETE {strwhattodelete.toUpperCase()}</button>
    </>
}