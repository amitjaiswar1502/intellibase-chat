import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MessageSquare, FileText, Zap, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react'

export function Welcome() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-large animate-bounce-gentle">
              <Zap className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent">
            Welcome to Intellibase Chat
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your documents into intelligent AI assistants. Upload your knowledge base and start having meaningful conversations with your data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="xl" className="text-lg px-8 py-6 shadow-large hover:shadow-xl transition-all duration-300">
            <Upload className="mr-3 h-6 w-6" />
            Create Your First Knowledge Base
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
          <Button variant="outline" size="xl" className="text-lg px-8 py-6">
            <MessageSquare className="mr-3 h-6 w-6" />
            View Demo
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="group hover:scale-105 transition-all duration-300 animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Smart Document Upload</CardTitle>
            </div>
            <CardDescription className="text-base">
              Upload PDF, DOCX, TXT, or Markdown files with intelligent text extraction and automatic processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Support for multiple file formats
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Automatic text extraction
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Smart content chunking
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">AI-Powered Conversations</CardTitle>
            </div>
            <CardDescription className="text-base">
              Ask questions and get intelligent, contextual answers based on your uploaded content with source citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Advanced AI understanding
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Source citations included
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Context-aware responses
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Organize & Manage</CardTitle>
            </div>
            <CardDescription className="text-base">
              Create multiple knowledge bases, organize documents efficiently, and manage your AI assistants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Multiple knowledge bases
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Easy document management
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Conversation history
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center space-y-6">
        <h3 className="text-2xl font-semibold text-gray-900">Why Choose Intellibase Chat?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-primary-100">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Privacy First</h4>
            <p className="text-sm text-gray-600">Your data stays private and secure. No sharing with third parties.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-green-100">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Lightning Fast</h4>
            <p className="text-sm text-gray-600">Get instant responses with our optimized AI processing.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-purple-100">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Easy to Use</h4>
            <p className="text-sm text-gray-600">Simple interface designed for everyone, from beginners to experts.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of users who are already transforming their documents into intelligent AI assistants.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" className="text-lg px-8 py-6 shadow-large">
            <Upload className="mr-3 h-6 w-6" />
            Start Building Your Knowledge Base
          </Button>
          <Button variant="outline" size="xl" className="text-lg px-8 py-6">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
