import { SignIn, useAuth } from "@clerk/clerk-react"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export default function SignInPage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard")
    }
  }, [isSignedIn, navigate])
  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <SignIn />
    </main>
  )
}
