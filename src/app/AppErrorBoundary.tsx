import { Component, type ReactNode } from 'react'
import styles from './AppErrorBoundary.module.css'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.errorPage} role="alert">
          <div className={styles.errorContent}>
            <p className={styles.eyebrow}>The Skills Mine</p>
            <h1 className={styles.title}>This page couldn&apos;t load</h1>
            <p className={styles.message}>
              Something went wrong while loading this page. Reload to try again.
            </p>
            <button
              className={styles.reloadButton}
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload page
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}