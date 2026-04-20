import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/auth/Login'

const user = userEvent.setup()

test('deve permitir preencher campos e clicar no botão de login', async () => {
    // A SOLUÇÃO: Envolver o componente com MemoryRouter e AuthProvider
    render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    )

    // Selecionamos os elementos que o usuário vê (placeholders e texto do botão)
    const emailInput = screen.getByPlaceholderText(/seu.email@uniacademic.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /acessar plataforma/i })

    // Simulamos a interação do usuário
    await user.type(emailInput, 'admin@uniacademic.com')
    await user.type(passwordInput, 'admin123')

    // Verificamos se os valores foram preenchidos
    expect(emailInput).toHaveValue('admin@uniacademic.com')
    expect(passwordInput).toHaveValue('admin123')

    // Clicamos no botão de submissão
    await user.click(submitButton)

    // Verificamos se o botão está no documento
    expect(submitButton).toBeDefined()
})
