# Studio Space Manager - MCP Agents

This directory contains specialized MCP agents for developing the Studio Space Manager iOS app. Each agent is designed to work autonomously while maintaining clear handoff contracts.

## 🎯 **Available Agents**

### 1. **Studio Orchestrator** (`studio-orchestrator`)
**Purpose**: Project coordination and milestone management
**Tools**:
- `get_project_plan` - Complete project overview and phases
- `get_agent_status` - Current status of all agents
- `create_milestone` - Create new development milestones

**Usage Example**:
```javascript
// Get the complete project plan
await callTool("studio-orchestrator", "get_project_plan", {})

// Check agent status
await callTool("studio-orchestrator", "get_agent_status", {})

// Create a milestone
await callTool("studio-orchestrator", "create_milestone", {
  phase: "Phase 1: Foundation",
  description: "Set up DesignKit and DataKit modules",
  tasks: [
    "Implement glass components and materials",
    "Create Core Data schema",
    "Set up API contracts"
  ]
})
```

### 2. **Studio DesignKit** (`studio-designkit`)
**Purpose**: Liquid Glass design system implementation
**Tools**:
- `get_design_spec` - Complete design system specification
- `generate_swift_code` - Generate Swift code for components
- `get_implementation_tasks` - Task breakdown for DesignKit

**Usage Example**:
```javascript
// Get design system specs
await callTool("studio-designkit", "get_design_spec", {})

// Generate GlassStyle component
await callTool("studio-designkit", "generate_swift_code", {
  component: "GlassStyle",
  features: ["materials", "shadows", "glass-effects"]
})

// Get implementation tasks
await callTool("studio-designkit", "get_implementation_tasks", {})
```

**Available Components**:
- `GlassStyle` - Core view modifier with glass effects
- `GlassChip` - Interactive chips with hover effects
- `BrandColors` - Major-based color system with hex support

### 3. **Studio DataKit** (`studio-datakit`)
**Purpose**: Core Data models, API contracts, and data management
**Tools**:
- `get_data_schema` - Complete data model specification
- `generate_swift_models` - Generate Swift models and API client
- `get_implementation_tasks` - Task breakdown for DataKit

**Usage Example**:
```javascript
// Get data schema
await callTool("studio-datakit", "get_data_schema", {})

// Generate Core Data models
await callTool("studio-datakit", "generate_swift_models", {
  model: "CoreDataModels",
  features: ["entities", "relationships", "extensions"]
})

// Generate API client
await callTool("studio-datakit", "generate_swift_models", {
  model: "APIClient",
  features: ["endpoints", "error-handling", "async-await"]
})
```

**Available Models**:
- `CoreDataModels` - Core Data stack and managed object extensions
- `APIClient` - HTTP client with all API endpoints

### 4. **Studio PlanKit** (`studio-plankit`)
**Purpose**: PDF rendering, quadtree, hit-testing, and polygon management
**Tools**:
- `get_plan_spec` - Plan rendering system specification
- `generate_swift_code` - Generate Swift code for plan components
- `get_implementation_tasks` - Task breakdown for PlanKit

**Usage Example**:
```javascript
// Get plan rendering specs
await callTool("studio-plankit", "get_plan_spec", {})

// Generate PlanRenderer
await callTool("studio-plankit", "generate_swift_code", {
  component: "PlanRenderer",
  features: ["pdf-loading", "quadtree", "hit-testing"]
})

// Generate HoverChip
await callTool("studio-plankit", "generate_swift_code", {
  component: "HoverChip",
  features: ["glass-material", "spring-animation", "accessibility"]
})
```

**Available Components**:
- `PlanRenderer` - PDF loading, quadtree, and hit testing
- `HoverChip` - Glass material hover chip with student info

## 🚀 **Getting Started**

### 1. **Agent Setup**
All agents are already configured in your MCP setup. They'll be available after restarting Cursor.

### 2. **Development Workflow**
1. **Start with Orchestrator**: Get project overview and current status
2. **Choose your agent**: Pick the agent for your current task
3. **Get specifications**: Use `get_*_spec` tools for requirements
4. **Generate code**: Use `generate_swift_code` for implementation
5. **Check tasks**: Use `get_implementation_tasks` for next steps

### 3. **Agent Collaboration**
- **DesignKit** provides glass components for other agents
- **DataKit** provides stable data contracts for all features
- **PlanKit** provides plan rendering for MajorWorkspace feature
- **Orchestrator** coordinates handoffs between phases

## 📱 **Project Architecture**

```
Studio Space Manager/
├─ AppCore/                 # App entry, navigation, auth
├─ DesignKit/               # Glass components, materials, typography
├─ DataKit/                 # Core Data, API client, models
├─ PlanKit/                 # PDF rendering, quadtree, hover
├─ TicketKit/               # Ticket management
├─ SearchKit/               # Global search
├─ PDFKitPlus/              # PDF composer
├─ AdminTools/              # Polygon editor
└─ Features/                # Major workspace, studio detail
```

## 🔄 **Handoff Contracts**

### **DesignKit → Other Agents**
- All components expose public protocols
- Preview fixtures available for testing
- Performance benchmarks met (≤50ms hover)

### **DataKit → Other Agents**
- Stable JSON contracts maintained
- Core Data schema finalized
- API client fully functional

### **PlanKit → MajorWorkspace Feature**
- Hover system integrated with DesignKit
- Performance benchmarks met
- Polygon editor ready for AdminTools

## 📊 **Performance Requirements**

- **Hover Latency**: ≤50ms initial, ≤80ms follow
- **Frame Rate**: 45fps+ on M2 iPad Pro
- **Quick Ticket**: ≤500ms creation
- **PDF Generation**: ≤2s for 11×17

## 🧪 **Testing Strategy**

Each agent includes:
- **Unit Tests**: Core functionality validation
- **Snapshot Tests**: UI component consistency
- **Performance Tests**: Benchmark validation
- **Accessibility Tests**: VoiceOver and Reduce Motion compliance

## 🔧 **Development Environment**

- **Xcode**: 16+
- **Swift**: 5.10+
- **iOS Target**: 18+ (iOS 26 design language)
- **Platforms**: iPad (primary), iPhone (secondary)

## 📚 **Next Steps**

1. **Restart Cursor** to load all agents
2. **Start with Orchestrator** to understand the project
3. **Choose your development phase** (DesignKit, DataKit, etc.)
4. **Use agent tools** to generate code and get specifications
5. **Follow handoff contracts** for smooth collaboration

## 🆘 **Need Help?**

Each agent provides detailed specifications and implementation tasks. Start with the Orchestrator to get the big picture, then dive into your specific agent for detailed requirements and code generation.

---

**Happy coding! 🎯✨**
