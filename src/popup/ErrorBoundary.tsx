import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex flex-col gap-2 p-4">
          <h1 className="text-lg font-bold">Audio Console</h1>
          <p className="text-xs opacity-70">{this.state.error.message}</p>
        </main>
      );
    }
    return this.props.children;
  }
}
