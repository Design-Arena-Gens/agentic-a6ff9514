import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Generate n8n workflow structure
    const workflow: any = {
      name: 'Twitter Automation Workflow',
      nodes: [
        {
          id: '1',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          parameters: {
            rule: {
              interval: [
                {
                  field: config.scheduleFrequency === 'hourly' ? 'hours' : 'days',
                  hoursInterval: config.scheduleFrequency === 'hourly' ? 1 : undefined,
                  daysInterval: config.scheduleFrequency === 'daily' ? 1 : undefined
                }
              ]
            }
          },
          position: [250, 300]
        },
        {
          id: '2',
          name: 'Generate Tweet',
          type: 'n8n-nodes-base.httpRequest',
          parameters: {
            url: '={{$env.APP_URL}}/api/generate-tweet',
            method: 'POST',
            bodyParameters: {
              topic: config.topic,
              niche: config.niche,
              tone: config.tone
            }
          },
          position: [450, 300]
        }
      ],
      connections: {
        'Schedule Trigger': {
          main: [[{ node: 'Generate Tweet', type: 'main', index: 0 }]]
        }
      }
    }

    // Add image generation node if enabled
    if (config.includeImage) {
      workflow.nodes.push({
        id: '3',
        name: 'Generate AI Image',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$env.APP_URL}}/api/generate-image',
          method: 'POST',
          bodyParameters: {
            topic: config.topic,
            niche: config.niche,
            tone: config.tone
          }
        } as any,
        position: [650, 300]
      })

      workflow.connections['Generate Tweet'] = {
        main: [[{ node: 'Generate AI Image', type: 'main', index: 0 }]]
      }

      workflow.nodes.push({
        id: '4',
        name: 'Post Tweet with Image',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'tweet',
          text: '={{$json.tweet}}',
          attachments: '={{$json.imageUrl}}'
        },
        position: [850, 300]
      })

      workflow.connections['Generate AI Image'] = {
        main: [[{ node: 'Post Tweet with Image', type: 'main', index: 0 }]]
      }
    } else {
      workflow.nodes.push({
        id: '4',
        name: 'Post Tweet',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'tweet',
          text: '={{$json.tweet}}'
        },
        position: [650, 300]
      })

      workflow.connections['Generate Tweet'] = {
        main: [[{ node: 'Post Tweet', type: 'main', index: 0 }]]
      }
    }

    // Add engagement automation nodes
    if (config.enableEngagement) {
      const lastNodeId = workflow.nodes.length + 1
      workflow.nodes.push({
        id: lastNodeId.toString(),
        name: 'Search Relevant Tweets',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'search',
          searchText: config.topic,
          maxResults: 10
        },
        position: [1050, 200]
      })

      workflow.nodes.push({
        id: (lastNodeId + 1).toString(),
        name: 'Like Tweet',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'like',
          tweetId: '={{$json.id}}'
        },
        position: [1250, 150]
      })

      workflow.nodes.push({
        id: (lastNodeId + 2).toString(),
        name: 'Generate Comment',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$env.APP_URL}}/api/generate-comment',
          method: 'POST',
          bodyParameters: {
            tweet: '={{$json.text}}',
            tone: config.tone
          }
        },
        position: [1250, 250]
      })

      workflow.nodes.push({
        id: (lastNodeId + 3).toString(),
        name: 'Reply to Tweet',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'tweet',
          text: '={{$json.comment}}',
          inReplyToStatusId: '={{$json.id}}'
        },
        position: [1450, 250]
      })

      workflow.nodes.push({
        id: (lastNodeId + 4).toString(),
        name: 'Retweet',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'retweet',
          tweetId: '={{$json.id}}'
        },
        position: [1250, 350]
      })
    }

    // Add DM automation nodes
    if (config.enableDMs && config.targetAccounts) {
      const lastNodeId = workflow.nodes.length + 1
      const accounts = config.targetAccounts.split(',').map((a: string) => a.trim())

      workflow.nodes.push({
        id: lastNodeId.toString(),
        name: 'Target Accounts',
        type: 'n8n-nodes-base.function',
        parameters: {
          functionCode: `return ${JSON.stringify(accounts)}.map(account => ({ username: account }))`
        },
        position: [1050, 450]
      })

      workflow.nodes.push({
        id: (lastNodeId + 1).toString(),
        name: 'Personalize DM',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$env.APP_URL}}/api/personalize-dm',
          method: 'POST',
          bodyParameters: {
            username: '={{$json.username}}',
            template: config.dmMessage,
            niche: config.niche
          }
        },
        position: [1250, 450]
      })

      workflow.nodes.push({
        id: (lastNodeId + 2).toString(),
        name: 'Send DM',
        type: 'n8n-nodes-base.twitter',
        parameters: {
          operation: 'directMessage',
          user: '={{$json.username}}',
          text: '={{$json.message}}'
        },
        position: [1450, 450]
      })
    }

    return NextResponse.json({ workflow, success: true })
  } catch (error: any) {
    console.error('Error generating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to generate workflow', details: error.message },
      { status: 500 }
    )
  }
}
