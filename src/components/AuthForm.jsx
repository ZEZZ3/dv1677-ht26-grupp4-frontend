import { useState } from 'react'

function AuthForm({ apiUrl, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${apiUrl}/users/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Något gick fel')
      }

      if (mode === 'register') {
        setMessage('Kontot skapades. Du kan nu logga in.')
        setMode('login')
        setPassword('')
        return
      }

      localStorage.setItem('token', data.accessToken)
      onLogin(data.accessToken)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>{mode === 'login' ? 'Logga in' : 'Registrera'}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">E-post</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? 'Vänta...'
            : mode === 'login'
              ? 'Logga in'
              : 'Registrera'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setMessage('')
        }}
      >
        {mode === 'login'
          ? 'Skapa ett konto'
          : 'Jag har redan ett konto'}
      </button>
    </section>
  )
}

export default AuthForm