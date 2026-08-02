import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0E10]">
      <SignUp routing="hash" />
    </div>
  )
}