import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/auth/Login'
import AdminAlunos from '../../pages/admin/Alunos'
import AlunoForm from '../../pages/admin/AlunoForm'

const EMAIL_TEST = 'admin@uniacademic.com'
const PASSWORD_TEST = 'admin123'

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

test("Deve realizar login como Admin com sucesso", async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    const emailInput = screen.getByPlaceholderText(/seu.email@uniacademic.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /acessar plataforma/i })

    await user.type(emailInput, EMAIL_TEST)
    await user.type(passwordInput, PASSWORD_TEST)

    expect(emailInput).toHaveValue(EMAIL_TEST)
    await user.click(submitButton)
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

    // Seletores corrigidos e mais seguros
    const nomeInput = screen.getByPlaceholderText(/Nome do aluno/i)
    const raInput = screen.getByPlaceholderText(/202410001/i)
    const emailInput = screen.getByPlaceholderText(/aluuno@uniacademic.com/i)
    const submitButton = screen.getByRole('button', { name: /CADASTRAR ALUNO/i })

    await user.type(nomeInput, 'Danilo')
    await user.type(raInput, '123456')
    await user.type(emailInput, 'danilo@uniacademic.com')

    expect(nomeInput).toHaveValue('Danilo')
    expect(raInput).toHaveValue('123456')
    expect(emailInput).toHaveValue('danilo@uniacademic.com')

    expect(submitButton).toBeInTheDocument()
})
