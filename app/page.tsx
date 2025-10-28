'use client'

import { useState } from 'react'
import { Sparkles, Image as ImageIcon, Heart, MessageCircle, Repeat2, Send } from 'lucide-react'

interface WorkflowConfig {
  topic: string
  niche: string
  tone: string
  includeImage: boolean
  enableEngagement: boolean
  enableDMs: boolean
  targetAccounts: string
  dmMessage: string
  scheduleFrequency: string
}

export default function Home() {
  const [config, setConfig] = useState<WorkflowConfig>({
    topic: '',
    niche: '',
    tone: 'professional',
    includeImage: false,
    enableEngagement: false,
    enableDMs: false,
    targetAccounts: '',
    dmMessage: '',
    scheduleFrequency: 'daily'
  })

  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Generating workflow...')

    try {
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      setWorkflow(data.workflow)
      setStatus('Workflow generated successfully!')
    } catch (error) {
      setStatus('Error generating workflow')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async () => {
    setLoading(true)
    setStatus('Executing workflow...')

    try {
      const response = await fetch('/api/execute-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, config })
      })

      const data = await response.json()
      setStatus(data.message || 'Workflow executed successfully!')
    } catch (error) {
      setStatus('Error executing workflow')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-blue-600" size={48} />
            Twitter Automation Workflow
          </h1>
          <p className="text-xl text-gray-600">AI-powered Twitter automation with n8n</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic / Subject
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AI technology, marketing tips, productivity"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niche
              </label>
              <input
                type="text"
                value={config.niche}
                onChange={(e) => setConfig({ ...config, niche: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tech startups, SaaS, E-commerce"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={config.tone}
                onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="humorous">Humorous</option>
                <option value="inspirational">Inspirational</option>
                <option value="educational">Educational</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Schedule Frequency
              </label>
              <select
                value={config.scheduleFrequency}
                onChange={(e) => setConfig({ ...config, scheduleFrequency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="twice-daily">Twice Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon size={24} className="text-purple-600" />
                AI Image Generation
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeImage}
                  onChange={(e) => setConfig({ ...config, includeImage: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Include AI-generated images with tweets</span>
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart size={24} className="text-red-600" />
                Engagement Automation
              </h3>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={config.enableEngagement}
                  onChange={(e) => setConfig({ ...config, enableEngagement: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Enable likes, comments, and retweets</span>
              </label>
              {config.enableEngagement && (
                <div className="ml-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <Heart className="inline mr-1" size={16} /> Like relevant tweets<br/>
                    <MessageCircle className="inline mr-1" size={16} /> Comment on trending posts<br/>
                    <Repeat2 className="inline mr-1" size={16} /> Retweet valuable content
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Send size={24} className="text-green-600" />
                Direct Message Automation
              </h3>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={config.enableDMs}
                  onChange={(e) => setConfig({ ...config, enableDMs: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Enable automated DMs to brands/businesses</span>
              </label>

              {config.enableDMs && (
                <div className="ml-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Accounts (comma-separated usernames)
                    </label>
                    <input
                      type="text"
                      value={config.targetAccounts}
                      onChange={(e) => setConfig({ ...config, targetAccounts: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="@brand1, @brand2, @business3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DM Template
                    </label>
                    <textarea
                      value={config.dmMessage}
                      onChange={(e) => setConfig({ ...config, dmMessage: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Hi, I noticed your work in [industry]. I offer [service]..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? 'Generating...' : 'Generate n8n Workflow'}
          </button>
        </form>

        {workflow && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Workflow</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(workflow, null, 2)}
              </pre>
            </div>
            <button
              onClick={executeWorkflow}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Executing...' : 'Execute Workflow Now'}
            </button>
          </div>
        )}

        {status && (
          <div className={`p-4 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {status}
          </div>
        )}
      </div>
    </main>
  )
}
