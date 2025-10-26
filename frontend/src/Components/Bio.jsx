import '../css/Bio.css'

export default function Bio({musician}) {
    return <div className="bio">
        <h2>About</h2>
        <p>{musician.bio}</p>
    </div>
}