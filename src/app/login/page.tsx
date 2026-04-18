'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SignInPage } from '@/components/ui/sign-in'

const testimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Priya Sharma',
    handle: '@priyafreelance',
    text: 'I used to spend 30 minutes making invoices in Word. Now it takes me 60 seconds. Game changer.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Rohit Mehta',
    handle: '@rohitdev',
    text: 'The WhatsApp sharing feature is genius. My clients pay faster because they receive the invoice instantly.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Ananya Patel',
    handle: '@ananyacreates',
    text: 'Clean, fast, and professional. The PDF quality is excellent. I love the dark theme too!',
  },
]

export default function LoginPage() {
  const router = useRouter()

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleCreateAccount = () => {
    router.push('/register')
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Welcome back
          </span>
        }
        description="Sign in to your InvoiceFlow account and manage your billing"
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}
