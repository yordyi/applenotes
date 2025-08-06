import { render, screen, fireEvent } from '@testing-library/react'
import { AppleButton } from '@/components/ui/AppleButton'

describe('AppleButton', () => {
  it('renders with default props', () => {
    render(<AppleButton>Test Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    render(<AppleButton variant="secondary">Secondary Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Secondary Button' })
    expect(button).toHaveClass('bg-apple-gray-100')
  })

  it('applies correct size classes', () => {
    render(<AppleButton size="lg">Large Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Large Button' })
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('handles loading state', () => {
    render(<AppleButton isLoading>Loading Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Loading Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-70')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<AppleButton onClick={handleClick}>Clickable Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Clickable Button' })
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<AppleButton disabled>Disabled Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<AppleButton className="custom-class">Custom Button</AppleButton>)
    const button = screen.getByRole('button', { name: 'Custom Button' })
    expect(button).toHaveClass('custom-class')
  })

  it('supports destructive variant', () => {
    render(<AppleButton variant="destructive">Delete</AppleButton>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-apple-red')
  })
})
