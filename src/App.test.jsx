
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('Registrering', () => {
  it('skapar ett konto och visar ett bekräftelsemeddelande', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Skapa ett konto' })
    )

    await user.type(
      screen.getByLabelText('E-post'),
      'test6@test.com'
    )

    await user.type(
      screen.getByLabelText('Lösenord'),
      'test123'
    )

    await user.click(
      screen.getByRole('button', { name: 'Registrera' })
    )

    expect(
      await screen.findByText(
        'Kontot skapades. Du kan nu logga in.'
      )
    ).toBeInTheDocument()
  })
})







/**
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('visar rubriken SSR Editor', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'SSR Editor',
      })
    ).toBeInTheDocument()
  })
})
 */