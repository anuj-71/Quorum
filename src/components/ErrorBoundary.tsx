import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[QUORUM ERROR BOUNDARY]', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9f9ff] p-6 text-center font-sans">
          <div className="bg-white border border-[#e2e8f8] rounded-xl p-8 max-w-lg w-full shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-bold text-[#151c27]">Application State Recovered</h2>
            <p className="text-xs text-[#474651] leading-relaxed">
              An unexpected render error occurred. Quorum safe recovery is active and session state is preserved.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-[#f0f3ff] rounded-md text-[11px] font-mono text-[#1a146b] text-left overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a146b] hover:bg-[#312e81] text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
