import { useEffect, useState } from 'react'
import './App.css'
import AuthForm from './components/AuthForm.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

useEffect(() => {
  if (!token) {
    return
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/users/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        setToken(null)
        return
      }

      const data = await response.json()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
    }
  }

  fetchCurrentUser()
}, [token])


  useEffect(() => {
    if (!token) {
      return
    }

  function handleUnauthorized(response) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setDocuments([])
      setSelectedDocument(null)
      return true
    }

    return false
  }


    async function fetchDocuments() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_URL}/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (handleUnauthorized(response)) {
          return
        }

        if (!response.ok) {
          throw new Error('Could not fetch documents')
        }

        const data = await response.json()
        setDocuments(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [token])

  async function showDocument(id) {
    try {
      setError(null)

      const response = await fetch(`${API_URL}/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Could not fetch document')
      }

      const data = await response.json()
      setSelectedDocument(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function createDocument(event) {
    event.preventDefault()
    setError(null)

    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          type: 'text',
        }),
      })

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Could not create document')
      }

      const document = await response.json()

      setDocuments((currentDocuments) => [
        ...currentDocuments,
        document,
      ])

      setNewTitle('')
      setNewContent('')
    } catch (err) {
      setError(err.message)
    }
  }

  function handleLogin(accessToken) {
    setToken(accessToken)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setDocuments([])
    setSelectedDocument(null)
    setError(null)
  }

  if (!token) {
    return (
      <main>
        <h1>SSR Editor</h1>
        <AuthForm apiUrl={API_URL} onLogin={handleLogin} />
      </main>
    )
  }

  return (
    <main>
      <h1>SSR Editor</h1>

      {user && <p>Inloggad som: {user.email}</p>}

      <button type="button" onClick={handleLogout}>
        Logga ut
      </button>

      <h2>Dokument</h2>

          <form onSubmit={createDocument}>
      <div>
        <label htmlFor="title">Titel</label>
        <input
          id="title"
          type="text"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="content">Innehåll</label>
        <textarea
          id="content"
          value={newContent}
          onChange={(event) => setNewContent(event.target.value)}
        />
      </div>

      <button type="submit">
        Skapa dokument
      </button>
    </form>

      {loading && <p>Laddar dokument...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p>Det finns inga dokument.</p>
      )}

      <ul>
        {documents.map((document) => (
          <li key={document._id}>
            <button
              type="button"
              onClick={() => showDocument(document._id)}
            >
              {document.title}
            </button>
          </li>
        ))}
      </ul>

      {selectedDocument && (
        <section>
          <h2>{selectedDocument.title}</h2>
          <p>{selectedDocument.content}</p>
        </section>
      )}
    </main>
  )
}

export default App