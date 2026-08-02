import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0E10]">
      <SignIn routing="hash" />
    </div>
  )
}