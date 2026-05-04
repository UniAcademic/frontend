import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/auth/Login'

const user = userEvent.setup()

test('deve permitir preencher campos e clicar no botão de login', async () => {
    render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    )

    // Selecionamos os campos pelo name (identifier, password)
    const identifierInput = screen.getByPlaceholderText(/01622944/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /acessar plataforma/i })

    // Simulamos a interação do usuário
    await user.type(identifierInput, '00100009')
    await user.type(passwordInput, '2201ads91')

    // Verificamos se os valores foram preenchidos
    expect(identifierInput).toHaveValue('00100009')
    expect(passwordInput).toHaveValue('2201ads91')

    // Verificamos se o botão está no documento
    expect(submitButton).toBeDefined()
})
