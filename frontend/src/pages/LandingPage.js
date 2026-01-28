import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Clock, Shield, TrendingUp, Zap, Calendar, DollarSign, 
  Heart, Users, CheckCircle, Star, ArrowRight, Sparkles,
  Scissors, Eye, Pen, Sparkle, Store, Scan, Hand
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AuraSync
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition">
              Pricing
            </a>
            <Button size="sm" onClick={() => navigate('/master/dashboard')} data-testid="nav-login-btn">
              Master Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">AI-Powered Smart Scheduling with Fair Protection</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight" data-testid="hero-title">
            Stop Losing Money to
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              No-Shows
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="hero-subtitle">
            AuraSync protects beauty professionals' time & income from no-shows by holding client money fairly—
            without forcing full upfront payments.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" onClick={() => navigate('/sophiabrown')} data-testid="hero-cta-demo">
              Try Live Demo <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/master/dashboard')} data-testid="hero-cta-start">
              Start Free Trial
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>1 Month Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" data-testid="problem-section-title">
            The Problem Every Master Faces
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lost Income</h3>
              <p className="text-gray-600">
                No-shows mean empty slots you could have filled. That's direct income lost forever.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wasted Time</h3>
              <p className="text-gray-600">
                You blocked that time. Prepared materials. Turned down other clients. All for nothing.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Client Relationships</h3>
              <p className="text-gray-600">
                Forcing 100% upfront payment feels aggressive and pushes good clients away.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Insight Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" data-testid="insight-title">
            The Insight
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            <span className="font-semibold text-purple-600">You don't need the full payment upfront.</span>
            <br />You need <span className="italic">protection</span>—fair compensation if they no-show,
            but not punishment if they're reliable.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" data-testid="solution-title">
              Enter AuraSync
            </h2>
            <p className="text-xl text-gray-700">
              The fair way to protect your time without losing clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Hold, Don't Charge</h3>
                    <p className="text-gray-600">
                      We authorize a AuraSync amount on their card—but don't take their money unless they no-show.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Smart, Not Fixed</h3>
                    <p className="text-gray-600">
                      AuraSync adapts based on service value, client reliability, and booking patterns.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Fair Split on No-Show</h3>
                    <p className="text-gray-600">
                      If they don't show: You get compensated. They get wallet credit for next time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white shadow-2xl">
              <div className="space-y-4">
                <div className="text-sm text-gray-500 font-medium">Example Booking</div>
                <div className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service</span>
                    <span className="font-semibold">Balayage Hair Color</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Price</span>
                    <span className="font-semibold text-lg">€150</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-900 font-medium">AuraSync Amount</span>
                    <span className="text-2xl font-bold text-purple-600">€40</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Only held, not charged. Released if client shows up.
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 mb-3">If No-Show Happens:</div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">→ Master receives</span>
                    <span className="font-semibold text-green-600">€25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">→ Client wallet credit</span>
                    <span className="font-semibold text-blue-600">€15</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" data-testid="how-it-works-title">
            How AuraSync Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Client Books', desc: 'Selects service and time slot on your booking page', icon: Calendar },
              { step: 2, title: 'AuraSync Applied', desc: 'Smart algorithm calculates fair hold amount', icon: Zap },
              { step: 3, title: 'Card Authorized', desc: 'Amount held on card, not charged', icon: Shield },
              { step: 4, title: 'Client Shows', desc: 'Hold released. Or no-show? Fair split applied.', icon: CheckCircle },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-bold text-purple-600 mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" data-testid="why-different-title">
            Why AuraSync is Different
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Not Full Upfront', desc: 'Other platforms force 100% payment. We hold just enough to protect you.' },
              { title: 'Not Punishment', desc: 'Even no-shows get wallet credit. It\'s about fairness, not revenge.' },
              { title: 'Adaptive Intelligence', desc: 'AuraSync adjusts based on client history, slot demand, and service length.' },
              { title: 'Stress-Free Rescheduling', desc: 'Smart rules let reliable clients reschedule freely within your terms.' },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 hover:shadow-xl transition">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Star className="w-5 h-5 text-purple-600 mr-2" />
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" data-testid="who-its-for-title">
            Built for Beauty Professionals
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Hair Stylists', icon: Scissors, gradient: 'from-purple-500 to-pink-500' },
              { title: 'Nail Artists', icon: Sparkle, gradient: 'from-pink-500 to-rose-500' },
              { title: 'Lash Technicians', icon: Eye, gradient: 'from-indigo-500 to-purple-500' },
              { title: 'Brow Artists', icon: Scan, gradient: 'from-violet-500 to-fuchsia-500' },
              { title: 'Tattoo Artists', icon: Pen, gradient: 'from-purple-600 to-pink-600' },
              { title: 'Skin & Aesthetics', icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-500' },
              { title: 'Massage Therapists', icon: Hand, gradient: 'from-rose-500 to-pink-500' },
              { title: 'Salon Owners', icon: Store, gradient: 'from-purple-600 to-indigo-600' },
            ].map((prof, idx) => (
              <Card 
                key={idx} 
                className="p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-purple-200"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${prof.gradient} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <prof.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition">{prof.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" data-testid="pricing-title">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">Protect your time without breaking the bank</p>
          
          <Card className="p-8 md:p-12 bg-white shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-block bg-purple-100 px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-semibold text-purple-600">SPECIAL OFFER</span>
              </div>
              <div className="text-6xl font-bold mb-2">
                €29
                <span className="text-2xl text-gray-500">/month</span>
              </div>
              <p className="text-purple-600 font-semibold text-lg">First month free</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Unlimited bookings',
                'Smart AuraSync algorithm',
                'Client reliability tracking',
                'Calendar management',
                'Wallet & instant payouts',
                'Analytics dashboard',
                'Email & SMS notifications',
                'Telegram bot integration',
                'No hidden fees',
                'Cancel anytime',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full" onClick={() => navigate('/master/dashboard')} data-testid="pricing-cta">
              Start Free Trial
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card required • Cancel anytime
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" data-testid="final-cta-title">
            Ready to Stop Losing Money?  
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of beauty professionals protecting their time with AuraSync
          </p>
          <Button size="lg" onClick={() => navigate('/master/dashboard')} data-testid="final-cta-button">
            Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold">AuraSync</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered smart scheduling. Fair protection for professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 AuraSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
