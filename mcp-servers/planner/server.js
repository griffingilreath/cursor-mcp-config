import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'planner-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'break_down_work') {
    const { description, complexity } = args;
    
    // Simple task breakdown logic
    const tasks = [];
    const complexityLevel = complexity || 'medium';
    
    if (complexityLevel === 'simple') {
      tasks.push(
        'Analyze requirements',
        'Implement core functionality',
        'Test basic functionality',
        'Document changes'
      );
    } else if (complexityLevel === 'medium') {
      tasks.push(
        'Research and plan approach',
        'Set up project structure',
        'Implement core features',
        'Add error handling',
        'Write tests',
        'Refactor and optimize',
        'Create documentation',
        'Deploy and verify'
      );
    } else {
      tasks.push(
        'Deep research and architecture planning',
        'Create detailed technical specification',
        'Set up development environment',
        'Implement core architecture',
        'Build feature modules',
        'Integrate components',
        'Comprehensive testing suite',
        'Performance optimization',
        'Security review',
        'Documentation and user guides',
        'Deployment and monitoring setup',
        'Post-deployment validation'
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: `## Work Breakdown Plan\n\n**Description:** ${description}\n**Complexity:** ${complexityLevel}\n\n### Tasks:\n${tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}\n\n### Estimated Timeline:\n- Simple: 1-2 days\n- Medium: 1-2 weeks\n- Complex: 1-3 months`
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Unknown tool. Available tools: break_down_work'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
