import { render, screen } from '@testing-library/react'
import Logo from '../components/Logo'

test('renders Logo with correct text', () => {
    render(<Logo />)
    expect(screen.getByText('UniAcademic')).toBeInTheDocument()
})