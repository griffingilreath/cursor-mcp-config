import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'qa-docs-server',
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

  if (name === 'create_documentation') {
    const { task_results, project_name, output_type } = args;
    
    let output = '';
    
    if (output_type === 'checklist') {
      output = `# ${project_name} - Implementation Checklist\n\n`;
      output += `## Completed Tasks\n`;
      output += task_results.map((result, i) => `- [x] ${result.task}: ${result.status}`).join('\n');
      output += `\n\n## Next Steps\n`;
      output += `- [ ] Code review\n`;
      output += `- [ ] Testing validation\n`;
      [ ] Documentation review\n`;
      output += `- [ ] Deployment preparation`;
    } else {
      output = `# ${project_name} - Implementation Summary\n\n`;
      output += `## Overview\n`;
      output += `This document summarizes the implementation of ${project_name}.\n\n`;
      output += `## Task Results\n\n`;
      output += task_results.map((result, i) => `### ${i + 1}. ${result.task}\n\n**Status:** ${result.status}\n\n**Details:** ${result.details || 'No additional details provided'}\n`).join('\n\n');
      output += `\n## Summary\n`;
      output += `Total tasks completed: ${task_results.length}\n`;
      output += `Overall status: ${task_results.every(r => r.status === 'completed') ? 'Complete' : 'In Progress'}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: output
        }
      ]
    };
  }

  if (name === 'create_qa_checklist') {
    const { features, test_scenarios } = args;
    
    const output = `# QA Testing Checklist\n\n`;
    output += `## Features to Test\n`;
    output += features.map(f => `- [ ] ${f}`).join('\n');
    output += `\n\n## Test Scenarios\n`;
    output += test_scenarios.map((scenario, i) => `${i + 1}. **${scenario.title}**\n   - [ ] Test case: ${scenario.description}\n   - [ ] Expected result: ${scenario.expected}\n   - [ ] Actual result: \n   - [ ] Pass/Fail: `).join('\n\n');
    output += `\n\n## Test Results Summary\n`;
    output += `- [ ] All critical features tested\n`;
    output += `- [ ] Edge cases covered\n`;
    output += `- [ ] Performance benchmarks met\n`;
    output += `- [ ] Security considerations addressed\n`;
    output += `- [ ] Documentation updated`;

    return {
      content: [
        {
          type: 'text',
          text: output
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Unknown tool. Available tools: create_documentation, create_qa_checklist'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
