import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Logo from '../components/Logo'


test('renders Logo with correct text', () => {
    render(<Logo />)

    const { container } = render(< Logo />)


    const div = container.querySelector('.exib')
    expect(div).toHaveTextContent(
        'UniAcademic'
    )


    screen.debug(div)
})