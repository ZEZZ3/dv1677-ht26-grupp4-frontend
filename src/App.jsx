import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch(`${API_URL}/documents`)

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
  }, [])

  async function showDocument(id) {
    try {
      setError(null)

      const response = await fetch(`${API_URL}/documents/${id}`)

      if (!response.ok) {
        throw new Error('Could not fetch document')
      }

      const data = await response.json()
      setSelectedDocument(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main>
      <h1>SSR Editor</h1>

      <h2>Dokument</h2>

      {loading && <p>Laddar dokument...</p>}

      {error && (
        <p>Kunde inte hämta dokument: {error}</p>
      )}

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