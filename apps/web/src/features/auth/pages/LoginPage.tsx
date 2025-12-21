import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm, type LoginFormData } from '../components/LoginForm'
import { useNavigate } from '@tanstack/react-router'
export function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (data: LoginFormData) => {
    console.log(data)
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
