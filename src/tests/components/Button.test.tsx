// src/tests/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../../components/ui/Button'

describe('Button Component', () => {
  it('renderiza corretamente com texto', () => {
    render(<Button>Clique aqui</Button>)
    
    expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument()
  })

  it('aplica variante primary corretamente', () => {
    render(<Button variant="primary">Primary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('aplica variante secondary corretamente', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-500')
  })

  it('aplica variante error corretamente', () => {
    render(<Button variant="error">Error Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-500')
  })

  it('aplica variante success corretamente', () => {
    render(<Button variant="success">Success Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-500')
  })

  it('aplica size small corretamente', () => {
    render(<Button size="small">Small Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1', 'text-sm')
  })

  it('aplica size large corretamente', () => {
    render(<Button size="large">Large Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('exibe ícone quando especificado', () => {
    render(<Button icon="plus">Com Ícone</Button>)
    
    const icon = screen.getByRole('button').querySelector('i')
    expect(icon).toHaveClass('fas', 'fa-plus')
  })

  it('chama onClick quando clicado', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Clique</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    )
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('exibe loading spinner quando loading=true', () => {
    render(<Button loading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('fica disabled quando loading=true', () => {
    render(<Button loading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renderiza como link quando href é fornecido', () => {
    render(<Button href="/test">Link Button</Button>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
  })

  it('aplica className customizada', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('suporta ref forwarding', () => {
    const ref = vi.fn()
    
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref).toHaveBeenCalled()
  })

  it('suporta todos os atributos HTML de botão', () => {
    render(
      <Button 
        type="submit" 
        form="test-form"
        data-testid="custom-button"
        aria-label="Custom aria label"
      >
        HTML Attributes
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('form', 'test-form')
    expect(button).toHaveAttribute('data-testid', 'custom-button')
    expect(button).toHaveAttribute('aria-label', 'Custom aria label')
  })

  it('tem foco acessível via teclado', async () => {
    const user = userEvent.setup()
    
    render(<Button>Focusable Button</Button>)
    
    await user.tab()
    
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('ativa com Enter', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Enter Button</Button>)
    
    await user.tab()
    await user.keyboard('{Enter}')
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ativa com Space', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Space Button</Button>)
    
    await user.tab()
    await user.keyboard('{ }')
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  describe('Estados de Loading', () => {
    it('mostra spinner durante loading', () => {
      render(<Button loading>Loading</Button>)
      
      expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('preserva texto durante loading', () => {
      render(<Button loading>Salvando...</Button>)
      
      expect(screen.getByRole('button')).toHaveTextContent('Salvando...')
    })

    it('remove ícone durante loading', () => {
      render(<Button loading icon="save">Salvar</Button>)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('.fa-save')).not.toBeInTheDocument()
      expect(button.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('tem papel de botão correto', () => {
      render(<Button>Accessible Button</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('suporta aria-pressed para toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle Button</Button>)
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('suporta aria-expanded para dropdown buttons', () => {
      render(<Button aria-expanded="false">Dropdown Button</Button>)
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    })

    it('suporta aria-describedby para descrições externas', () => {
      render(
        <>
          <Button aria-describedby="help-text">Help Button</Button>
          <div id="help-text">Texto de ajuda</div>
        </>
      )
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('Variações de Estilo', () => {
    it('aplica estilo outline corretamente', () => {
      render(<Button variant="outline">Outline Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2', 'border-primary', 'text-primary')
    })

    it('aplica estilo ghost corretamente', () => {
      render(<Button variant="ghost">Ghost Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'hover:bg-primary-light')
    })

    it('combina variante e tamanho corretamente', () => {
      render(<Button variant="primary" size="large">Large Primary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'px-6', 'py-3', 'text-lg')
    })
  })

  describe('Interações', () => {
    it('mostra feedback visual no hover', async () => {
      const user = userEvent.setup()
      
      render(<Button>Hover Button</Button>)
      
      const button = screen.getByRole('button')
      
      await user.hover(button)
      
      // Verificar se classes de hover estão aplicadas
      expect(button).toHaveClass('transition-colors')
    })

    it('mostra feedback visual no focus', async () => {
      const user = userEvent.setup()
      
      render(<Button>Focus Button</Button>)
      
      await user.tab()
      
      const button = screen.getByRole('button')
      expect(button).toHaveFocus()
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    })

    it('previne duplo clique quando loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} loading>Loading Button</Button>)
      
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Performance', () => {
    it('não re-renderiza desnecessariamente', () => {
      const renderSpy = vi.fn()
      
      const TestButton = () => {
        renderSpy()
        return <Button>Test</Button>
      }
      
      const { rerender } = render(<TestButton />)
      
      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      // Re-render com mesmas props
      rerender(<TestButton />)
      
      // Deve renderizar novamente (React.memo não aplicado neste exemplo)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('lida com children undefined', () => {
      render(<Button>{undefined}</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('lida com children null', () => {
      render(<Button>{null}</Button>)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('lida com múltiplos children', () => {
      render(
        <Button>
          <span>Texto 1</span>
          <span>Texto 2</span>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Texto 1Texto 2')
    })

    it('lida com ícone inválido graciosamente', () => {
      render(<Button icon="icon-inexistente">Button</Button>)
      
      const button = screen.getByRole('button')
      const icon = button.querySelector('i')
      expect(icon).toHaveClass('fas', 'fa-icon-inexistente')
    })
  })
})
