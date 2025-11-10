import API from '../lib/api.js';
import '../css/DeleteButton.css'

export default function DeleteButton({strwhattodelete, api}) {
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
        }
    }

    return <button type="button" className="delete-button" onClick={deletefn}>DELETE {strwhattodelete.toUpperCase()}</button>
}