import { Component } from 'react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) return (
      <div style={{ display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Inter, sans-serif',
        backgroundColor: '#F0F4F8', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#0F1C2E', marginBottom: '8px' }}>
          Something went wrong
        </h2>
        <p style={{ color: '#94A3B8', marginBottom: '24px', fontSize: '14px' }}>
          {this.state.error?.message || 'An unexpected error occurred'}
        </p>
        <button onClick={() => window.location.href = '/login'} style={{
          padding: '12px 24px', backgroundColor: '#007CC2',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer',
        }}>Back to Login</button>
      </div>
    )
    return this.props.children
  }
}