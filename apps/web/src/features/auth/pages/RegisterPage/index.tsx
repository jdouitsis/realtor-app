import { getRouteApi } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { parseError } from '@/lib/errors'

import { RegisterForm, type RegisterFormData } from './components/RegisterForm'

const routeApi = getRouteApi('/_public/register')

type Step = 'register' | 'success'

export function RegisterPage() {
  const { auth } = routeApi.useRouteContext()

  const [step, setStep] = useState<Step>('register')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      await auth.register(data.email, data.name)
      setStep('success')
    } catch (err) {
      setError(parseError(err).userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      {step === 'register' ? (
        <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} error={error} />
      ) : (
        <WaitlistSuccessView />
      )}
    </div>
  )
}

function WaitlistSuccessView() {
  return (
    <Card className="w-full max-w-md border-border/50 shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <CardTitle className="text-2xl tracking-tighter">You're on the waitlist!</CardTitle>
        <CardDescription>Check your email for confirmation.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          We'll notify you as soon as early access opens.
        </p>
      </CardContent>
    </Card>
  )
}
