import { useEffect, useState, useRef } from 'react'
import {io} from 'socket.io-client'
import './App.css'
import AuthForm from './components/AuthForm.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [comments, setComments] = useState([])
  const [commentLine, setCommentLine] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [editingCommentLine, setEditingCommentLine] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)

  const [socket, setSocket] = useState(null)
  const saveTimer = useRef(null)

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

//skapa socket.io anslutning for both documents and comments
useEffect(() => {
    if (!token) {
      return
    }

    const newSocket = io(SOCKET_URL)

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket.IO ansluten:', newSocket.id)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message)
    })

    return () => {
      console.log('Stänger Socket.IO-anslutning')

      newSocket.disconnect()
      setSocket(null)
    }
  }, [token])

// Lyssna på uppdateringar från andra klienter
  useEffect(() => {
    if (!socket) {
      return
    }

    function handleDocumentUpdated(updatedDocument) {
      // Uppdatera dokumentet i listan
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document._id === updatedDocument._id
            ? updatedDocument
            : document
        )
      )

      // Om dokumentet är öppet, uppdatera det också
      setSelectedDocument((currentDocument) => {
        if (!currentDocument) {
          return currentDocument
        }

        if (currentDocument._id !== updatedDocument._id) {
          return currentDocument
        }

        return updatedDocument
      })

      // Uppdatera edit-field om det är dokumentet vi tittar på
      setEditTitle((currentTitle) => {
        if (!selectedDocument) {
          return currentTitle
        }

        if (selectedDocument._id !== updatedDocument._id) {
          return currentTitle
        }

        return updatedDocument.title
      })

      setEditContent((currentContent) => {
        if (!selectedDocument) {
          return currentContent
        }

        if (selectedDocument._id !== updatedDocument._id) {
          return currentContent
        }

        return updatedDocument.content
      })
    }

    socket.on('document:updated', handleDocumentUpdated)

    return () => {
      socket.off('document:updated', handleDocumentUpdated)
    }
  }, [socket, selectedDocument])

  useEffect(() => {
  if (!socket) {
    return
  }

  function handleRealtimeUpdate(text) {

    setEditContent(text)
  }

  socket.on(
    'uppdatering',
    handleRealtimeUpdate
  )

  return () => {
    socket.off(
      'uppdatering',
      handleRealtimeUpdate
    )
  }
}, [socket])

async function saveContent(text) {
  if (!selectedDocument) {
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/documents/${selectedDocument._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: text,
        }),
      }
    )

    if (handleUnauthorized(response)) {
      return
    }

    if (!response.ok) {
      throw new Error('Autosparningen misslyckades')
    }

    const updatedDocument = await response.json()

    setSelectedDocument(updatedDocument)

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document._id === updatedDocument._id
          ? updatedDocument
          : document
      )
    )

  } catch (err) {
    console.error('Fel vid autosparning:', err)
    setError(err.message)
  }
}

function handleContentChange(event) {
  const text = event.target.value

  // Uppdatera min egen editor
  setEditContent(text)

  // Skicka texten till andra användare
  if (socket && selectedDocument) {
    socket.emit('redigera', {
      doc: selectedDocument._id,
      text,
    })
  }

  // Debounce
  clearTimeout(saveTimer.current)

  saveTimer.current = setTimeout(() => {
    saveContent(text)
  }, 1000)
}

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
      setEditTitle(data.title)
      setEditContent(data.content || '')
      fetchComments(data._id)

      // Joina dokumentets Socket.IO-room
      if (socket) {
        socket.emit('join', id)
      }

    } catch (err) {
      setError(err.message)
    }
  }

  async function updateDocument(event) {
    event.preventDefault()

    if (!selectedDocument) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/documents/${selectedDocument._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
          }),
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Could not update document')
      }

      const updatedDocument = await response.json()

      setSelectedDocument(updatedDocument)

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document._id === updatedDocument._id
            ? updatedDocument
            : document
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }


  async function shareDocument(event) {
    event.preventDefault()

    if (!selectedDocument) {
      return
    }

    setSharing(true)
    setShareMessage('')
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/documents/${selectedDocument._id}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: shareEmail.trim(),
          }),
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Kunde inte dela dokumentet')
      }

      const updatedDocument = await response.json()

      setSelectedDocument(updatedDocument)
      setShareEmail('')
      setShareMessage('Dokumentet har delats!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSharing(false)
    }
  }

  //kod for socket kommentarer
  useEffect(() => {
  if (!socket || !selectedDocument?._id) {
    return
  }

  const documentId = selectedDocument._id

  // Gå med i dokumentets Socket.IO-rum
  socket.emit('join', documentId)

  // Ny kommentar
  function handleCommentCreated(newComment) {
    if (String(newComment.documentId) !== String(documentId)) {
      return
    }

    setComments((currentComments) => {
      const exists = currentComments.some(
        (comment) =>  String(comment._id) === String(newComment._id)
      )

      if (exists) {
        return currentComments
      }

      return [...currentComments, newComment]
    })
  }

  // Borttagen kommentar
  function handleCommentDeleted({ _id }) {
    setComments((currentComments) =>
      currentComments.filter(
        (comment) => comment._id !== _id
      )
    )
  }

  socket.on('comment:created', handleCommentCreated)
  socket.on('comment:deleted', handleCommentDeleted)

  return () => {
    socket.off('comment:created', handleCommentCreated)
    socket.off('comment:deleted', handleCommentDeleted)
  }
}, [socket, selectedDocument?._id])

//kod for socket for comments ends here
  async function fetchComments(documentId) {
    setCommentsLoading(true)
    setComments([])
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/comments/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Kunde inte hämta kommentarer')
      }

      const data = await response.json()
      setComments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCommentsLoading(false)
    }
  }


  async function addComment(event) {
    event.preventDefault()

    if (!selectedDocument) {
      return
    }

    setCommentSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: selectedDocument._id,
          lineNumber: Number(commentLine),
          text: commentText.trim(),
        }),
      })

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Kunde inte skapa kommentaren')
      }

      await response.json()

      setCommentLine('')
      setCommentText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCommentSubmitting(false)
    }
  }

  async function updateComment(event) {
    event.preventDefault()

    if (!editingCommentId) {
      return
    }

    setCommentSaving(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/comments/${editingCommentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lineNumber: Number(editingCommentLine),
            text: editingCommentText.trim(),
          }),
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Kunde inte uppdatera kommentaren')
      }

      const updatedComment = await response.json()

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment._id === updatedComment._id
            ? updatedComment
            : comment
        )
      )

      setEditingCommentId(null)
      setEditingCommentText('')
      setEditingCommentLine('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCommentSaving(false)
    }
  }


  async function deleteComment(commentId) {
    const confirmed = window.confirm(
      'Är du säker på att du vill ta bort kommentaren?'
    )

    if (!confirmed) {
      return
    }

    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (handleUnauthorized(response)) {
        return
      }

      if (!response.ok) {
        throw new Error('Kunde inte ta bort kommentaren')
      }

      setComments((currentComments) =>
        currentComments.filter(
          (comment) => comment._id !== commentId
        )
      )

      if (editingCommentId === commentId) {
        setEditingCommentId(null)
        setEditingCommentText('')
        setEditingCommentLine('')
      }
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
          <h2>Redigera dokument</h2>

          <form onSubmit={updateDocument}>
            <div>
              <label htmlFor="edit-title">Titel</label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="edit-content">Innehåll</label>
              <textarea
                id="edit-content"
                value={editContent}
                onChange={handleContentChange}
                rows={10}
              />
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </form>

          <h3>Dela dokument</h3>

          <form onSubmit={shareDocument}>
            <div>
              <label htmlFor="share-email">Användarens e-post</label>
              <input
                id="share-email"
                type="email"
                value={shareEmail}
                onChange={(event) => setShareEmail(event.target.value)}
                placeholder="namn@example.com"
                required
              />
            </div>

            <button type="submit" disabled={sharing}>
              {sharing ? 'Delar...' : 'Dela dokument'}
            </button>
          </form>

          {shareMessage && <p>{shareMessage}</p>}

          <h3>Kommentarer</h3>

          <form onSubmit={addComment}>
          <div>
            <label htmlFor="comment-line">Radnummer</label>
            <input
              id="comment-line"
              type="number"
              min="1"
              step="1"
              value={commentLine}
              onChange={(event) => setCommentLine(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="comment-text">Kommentar</label>
            <textarea
              id="comment-text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Skriv din kommentar här..."
              required
            />
          </div>

          <button type="submit" disabled={commentSubmitting}>
            {commentSubmitting ? 'Skickar...' : 'Lägg till kommentar'}
          </button>
        </form>

          {commentsLoading && <p>Laddar kommentarer...</p>}

          {!commentsLoading && comments.length === 0 && (
            <p>Det finns inga kommentarer för detta dokument.</p>
          )}

          {!commentsLoading && comments.length > 0 && (
            <ul>
              {comments.map((comment) => (
                <li key={comment._id}>
                  <strong>Rad {comment.lineNumber}:</strong>{' '}
                  {comment.text}
                  {editingCommentId === comment._id && (
                    <form onSubmit={updateComment}>
                      <div>
                        <label htmlFor="editing-comment-line">Radnummer</label>
                        <input
                          id="editing-comment-line"
                          type="number"
                          min="1"
                          step="1"
                          value={editingCommentLine}
                          onChange={(event) => setEditingCommentLine(event.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="editing-comment-text">Kommentar</label>
                        <textarea
                          id="editing-comment-text"
                          value={editingCommentText}
                          onChange={(event) => setEditingCommentText(event.target.value)}
                          required
                        />
                      </div>

                      <button type="submit" disabled={commentSaving}>
                        {commentSaving ? 'Sparar...' : 'Spara kommentar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingCommentText('')
                          setEditingCommentLine('')
                        }}
                      >
                        Avbryt
                      </button>
                    </form>
                  )}
                  {user && String(comment.userId) === String(user.id) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(comment._id)
                          setEditingCommentText(comment.text)
                          setEditingCommentLine(String(comment.lineNumber))
                        }}
                      >
                        Redigera
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteComment(comment._id)}
                      >
                        Ta bort
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}

export default App