import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null }
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong: {this.state.error?.message}</div>
    }
    return this.props.children
  }
}