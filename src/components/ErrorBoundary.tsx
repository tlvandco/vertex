import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Production Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
    // In real production, push to Sentry / Datadog / OpenTelemetry
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-2xl p-8 border border-red-100 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
              {this.props.fallbackTitle || 'High-Availability Recovery Protocol'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              An unexpected client runtime exception occurred. The application state has been safely quarantined to prevent cascade failures across active sessions.
            </p>

            {this.state.error && (
              <div className="text-left bg-gray-900 text-gray-200 text-xs p-4 rounded-lg font-mono mb-6 overflow-x-auto border border-gray-800">
                <div className="flex items-center gap-2 text-red-400 mb-1 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{this.state.error.name}: {this.state.error.message}</span>
                </div>
                {this.state.error.stack && (
                  <pre className="text-[11px] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C2416] text-white text-sm font-medium hover:bg-[#3D3320] transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload & Restore Session
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Attempt In-Memory Recovery
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
