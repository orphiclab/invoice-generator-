import Link from 'next/link'
import { Zap, FileText, Users, Download, MessageCircle, Shield, BarChart3, ArrowRight, Check, Share2, Star } from 'lucide-react'

export const metadata = {
  title: 'InvoiceFlow — Send Invoices in 60 Seconds',
  description: 'The fastest way to create, send, and track professional invoices. Built for freelancers and small businesses.',
}

const features = [
  { icon: FileText, title: 'Professional Invoices', desc: 'Create beautiful, branded invoices in under 60 seconds with line items, tax & discounts.', color: 'hsl(262 83% 68%)' },
  { icon: MessageCircle, title: 'WhatsApp Sharing', desc: 'Share invoices directly to your client\'s WhatsApp with a pre-filled message. One click.', color: 'hsl(142 76% 46%)' },
  { icon: Download, title: 'PDF Export', desc: 'Download pixel-perfect PDF invoices. Professional, clean layout every time.', color: 'hsl(199 89% 48%)' },
  { icon: Users, title: 'Client Management', desc: 'Keep all your clients organised. Associate invoices and track history with ease.', color: 'hsl(38 92% 50%)' },
  { icon: BarChart3, title: 'Revenue Dashboard', desc: 'See your total revenue, outstanding amounts, and invoice status at a glance.', color: 'hsl(311 70% 60%)' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT-based auth and encrypted sessions. Your data belongs to you alone.', color: 'hsl(262 83% 72%)' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Freelance Designer', text: 'I used to spend 30 minutes making invoices in Word. Now it takes me 60 seconds. Absolute game changer.', stars: 5 },
  { name: 'Rohit Mehta', role: 'Web Developer', text: 'The WhatsApp sharing feature is genius. My clients pay faster because they actually receive the invoice instantly.', stars: 5 },
  { name: 'Ananya Patel', role: 'Marketing Consultant', text: 'Clean, fast, and professional. The PDF quality is excellent. I love the dark theme too!', stars: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 6%)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 border-b" style={{ borderColor: 'hsl(222 30% 12%)', background: 'rgba(14,18,34,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 68%), hsl(220 90% 62%))' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">InvoiceFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'hsl(215 20% 65%)' }}>
            Sign in
          </Link>
          <Link href="/register" className="text-sm font-semibold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 px-6 text-center">
        {/* Background blobs */}
        <div className="absolute top-[-100px] left-[-200px] w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[130px]" style={{ background: 'hsl(262 83% 58%)' }} />
        <div className="absolute top-[-50px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-[0.1] blur-[130px]" style={{ background: 'hsl(220 90% 52%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: 'hsl(262 83% 78%)' }}>
            <Zap className="w-3 h-3" /> Send professional invoices in 60 seconds
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 tracking-tight">
            Invoicing that<br />
            <span style={{ background: 'linear-gradient(135deg, hsl(262, 83%, 78%), hsl(220, 90%, 72%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              works as fast as you
            </span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'hsl(215 20% 60%)' }}>
            Create beautiful invoices, share them on WhatsApp, download PDFs, and track payments — all in one clean dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] w-full sm:w-auto justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium transition-all hover:bg-white/5 w-full sm:w-auto justify-center" style={{ color: 'hsl(215 20% 65%)', border: '1px solid hsl(222 30% 18%)' }}>
              Sign in to your account
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm" style={{ color: 'hsl(215 20% 40%)' }}>
            No credit card required · Free forever · 2-minute setup
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything you need to get paid</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'hsl(215 20% 55%)' }}>
            A complete invoicing toolkit built for modern freelancers and small businesses.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] group" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all" style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(215 20% 50%)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 lg:px-12 py-20" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How it works</h2>
            <p style={{ color: 'hsl(215 20% 55%)' }}>Three steps to get paid faster.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add a Client', desc: 'Add your client\'s name, email, and phone number. Takes 10 seconds.', icon: Users },
              { step: '02', title: 'Create Invoice', desc: 'Fill in your line items, apply tax/discount, and save. Done in under a minute.', icon: FileText },
              { step: '03', title: 'Share & Get Paid', desc: 'Send via WhatsApp or share a link. Your client views and you get paid.', icon: Share2 },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))', boxShadow: '0 0 30px rgba(139,92,246,0.25)' }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 30% 18%)', color: 'hsl(262 83% 72%)' }}>{step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm" style={{ color: 'hsl(215 20% 50%)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Loved by freelancers</h2>
          <p style={{ color: 'hsl(215 20% 55%)' }}>See what people are saying.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, stars }) => (
            <div key={name} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'hsl(38 92% 50%)' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'hsl(215 20% 65%)' }}>&ldquo;{text}&rdquo;</p>
              <div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 45%)' }}>{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 lg:px-12 py-20" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Simple pricing</h2>
          <p className="mb-10" style={{ color: 'hsl(215 20% 55%)' }}>One plan. Everything included. Free forever.</p>
          <div className="rounded-2xl p-8" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 0 60px rgba(139,92,246,0.12)' }}>
            <p className="text-5xl font-bold text-white mb-1">₹0</p>
            <p className="text-sm mb-8" style={{ color: 'hsl(215 20% 55%)' }}>Free forever</p>
            <div className="space-y-3 text-left mb-8">
              {['Unlimited invoices', 'Unlimited clients', 'PDF downloads', 'WhatsApp sharing', 'Shareable invoice links', 'Revenue analytics dashboard'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <Check className="w-3 h-3" style={{ color: 'hsl(142 76% 46%)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'hsl(215 20% 70%)' }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))' }}>
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to get paid faster?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'hsl(215 20% 55%)' }}>
            Join thousands of freelancers using InvoiceFlow to manage their billing effortlessly.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, hsl(262 83% 62%), hsl(220 90% 58%))', boxShadow: '0 0 50px rgba(139,92,246,0.35)' }}>
            Start for free — no card needed <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 lg:px-12 py-8" style={{ borderColor: 'hsl(222 30% 12%)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 68%), hsl(220 90% 62%))' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">InvoiceFlow</span>
          </div>
          <p className="text-xs" style={{ color: 'hsl(215 20% 40%)' }}>
            © {new Date().getFullYear()} InvoiceFlow. Built with ❤️ for freelancers.
          </p>
          <div className="flex gap-5">
            <Link href="/login" className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'hsl(215 20% 50%)' }}>Sign in</Link>
            <Link href="/register" className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'hsl(215 20% 50%)' }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
