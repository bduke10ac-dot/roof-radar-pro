import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props { children: ReactNode; fallback?: ReactNode; label?: string }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error("ErrorBoundary caught:", error); }
  reset = () => this.setState({ hasError: false, error: undefined });
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Card className="p-6 m-4 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold">Something went wrong{this.props.label ? ` · ${this.props.label}` : ""}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <Button size="sm" variant="outline" onClick={this.reset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Try again
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}

export function FallbackState({
  icon: Icon, title, description, action,
}: { icon: any; title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="p-6 text-center max-w-md mx-auto">
      <Icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
      <div className="font-semibold mb-1">{title}</div>
      {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
      {action}
    </Card>
  );
}
