import { Link } from '@tanstack/react-router'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface MagicLinkStatusProps {
  status: 'loading' | 'success' | 'error'
  errorMessage?: string
}

export function MagicLinkStatus({ status, errorMessage }: MagicLinkStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Signing you in...</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we verify your link.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-xl font-semibold">Success!</h1>
          <p className="mt-2 text-muted-foreground">Redirecting you now...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold">Link Invalid</h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
          <Button asChild className="mt-6">
            <Link to="/login">Back to Login</Link>
          </Button>
        </>
      )}
    </div>
  )
}
