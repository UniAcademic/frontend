import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/auth/Login'
import AdminAlunos from '../../pages/admin/Alunos'
import AlunoForm from '../../pages/admin/AlunoForm'

// Helper para renderizar com contextos
const renderWithProviders = (ui) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    )
}

test("Deve renderizar a página de login corretamente", async () => {
    renderWithProviders(<Login />)

    const identifierInput = screen.getByPlaceholderText(/01622944/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /acessar plataforma/i })

    expect(identifierInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
})

test("Deve renderizar a lista de alunos", async () => {
    renderWithProviders(<AdminAlunos />)

    await waitFor(() => {
        const novoRegistroBtn = screen.getByRole('button', { name: /Adicionar Novo Aluno/i })
        expect(novoRegistroBtn).toBeInTheDocument()
    })
})

test("Deve permitir preencher o formulário de novo aluno", async () => {
    const user = userEvent.setup()
    renderWithProviders(<AlunoForm />)

    // Seletores atualizados para os placeholders reais
    const nomeInput = screen.getByPlaceholderText(/Nome do aluno/i)
    const raInput = screen.getByPlaceholderText(/202410001/i)
    const emailInput = screen.getByPlaceholderText(/aluno@uniacademic.com/i)
    const submitButton = screen.getByRole('button', { name: /CADASTRAR ALUNO/i })

    await user.type(nomeInput, 'Danilo')
    await user.type(raInput, '123456')
    await user.type(emailInput, 'danilo@uniacademic.com')

    expect(nomeInput).toHaveValue('Danilo')
    expect(raInput).toHaveValue('123456')
    expect(emailInput).toHaveValue('danilo@uniacademic.com')

    expect(submitButton).toBeInTheDocument()
})
