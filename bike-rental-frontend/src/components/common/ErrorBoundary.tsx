import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground p-6">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-5 shadow-lg">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertOctagon className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-destructive">Something went wrong</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred in the application. Please try reloading or returning home.
            </p>
            {this.state.error && (
              <div className="text-left text-xs bg-muted border border-border p-3 rounded-lg overflow-x-auto max-h-40 font-mono text-destructive">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-xl cursor-pointer shadow-sm active:scale-95 text-center w-full"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
