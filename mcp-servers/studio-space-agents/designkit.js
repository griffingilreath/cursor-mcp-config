import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'studio-space-designkit',
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

  if (name === 'get_design_spec') {
    const spec = `# DesignKit Specification

## 🎨 Brand Colors
- **NSP**: #8046C2 (Purple)
- **IL**: #FF6B35 (Orange)
- **CD**: #4ECDC4 (Teal)
- **IAD**: #45B7D1 (Blue)
- **FAD**: #96CEB4 (Green)
- **PD**: #FFEAA7 (Yellow)
- **IMAT**: #DDA0DD (Plum)

## 🥃 Liquid Glass Materials
- **Ultra-thin**: .ultraThinMaterial (chips, tooltips)
- **Thin**: .thinMaterial (hover chips, popovers)
- **Regular**: .regularMaterial (side drawers, panels)
- **Thick**: .thickMaterial (sheets, modals)
- **Ultra-thick**: .ultraThickMaterial (full overlays)

## 🔤 Typography System
- **Primary**: ABC Whyte Book (fallback: Helvetica)
- **Bold**: ABC Whyte Bold (headings, emphasis)
- **Mono**: Space Mono (studio labels, IDs)
- **Sizes**: 12pt, 14pt, 16pt, 18pt, 24pt, 32pt, 48pt

## ✨ Glass Style Components
- **GlassChip**: Rounded corners, glass material, hover effects
- **GlassPanel**: Sliding panels with parallax effects
- **GlassButton**: Interactive buttons with glass materials
- **GlassSheet**: Modal sheets with thick material
- **GlassDock**: Floating action button cluster

## 🎭 Motion & Animation
- **Hover Breathe**: scale 1.02×, shadow +2, 90-120ms ease-out
- **Chip Reveal**: spring(response: 0.55, dampingFraction: 0.9)
- **Panel Parallax**: content backdrop -2 to -4pts on present
- **Respect Settings**: Reduce Motion (crossfade), Reduce Transparency (opaque)

## 🎯 Implementation Priority
1. Brand color tokens and glass materials
2. Typography helpers and font registration
3. GlassStyle view modifier
4. Basic glass components (Chip, Panel, Button)
5. Motion helpers and animation system
6. Accessibility compliance (Reduce Motion/Transparency)`;

    return {
      content: [
        {
          type: 'text',
          text: spec
        }
      ]
    };
  }

  if (name === 'generate_swift_code') {
    const { component, features } = args;
    
    let code = '';
    
    if (component === 'GlassStyle') {
      code = `import SwiftUI

struct GlassStyle: ViewModifier {
    let material: Material
    let cornerRadius: CGFloat
    let shadowRadius: CGFloat
    let shadowColor: Color
    
    init(
        material: Material = .regularMaterial,
        cornerRadius: CGFloat = 16,
        shadowRadius: CGFloat = 8,
        shadowColor: Color = .black.opacity(0.1)
    ) {
        self.material = material
        self.cornerRadius = cornerRadius
        self.shadowRadius = shadowRadius
        self.shadowColor = shadowColor
    }
    
    func body(content: Content) -> some View {
        content
            .background(material)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .shadow(
                color: shadowColor,
                radius: shadowRadius,
                x: 0,
                y: 2
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(
                        LinearGradient(
                            colors: [
                                .white.opacity(0.3),
                                .clear,
                                .clear,
                                Color.accentColor.opacity(0.2)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
    }
}

extension View {
    func glassStyle(
        material: Material = .regularMaterial,
        cornerRadius: CGFloat = 16,
        shadowRadius: CGFloat = 8,
        shadowColor: Color = .black.opacity(0.1)
    ) -> some View {
        modifier(GlassStyle(
            material: material,
            cornerRadius: cornerRadius,
            shadowRadius: shadowRadius,
            shadowColor: shadowColor
        ))
    }
}`;
    } else if (component === 'GlassChip') {
      code = `import SwiftUI

struct GlassChip: View {
    let text: String
    let color: Color
    let isSelected: Bool
    
    @State private var isHovered = false
    
    var body: some View {
        Text(text)
            .font(.system(.caption, design: .rounded, weight: .medium))
            .foregroundColor(isSelected ? .white : .primary)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? color : Material.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(color.opacity(0.3), lineWidth: 1)
                    )
            )
            .scaleEffect(isHovered ? 1.02 : 1.0)
            .shadow(
                color: isHovered ? color.opacity(0.3) : .clear,
                radius: isHovered ? 4 : 0,
                x: 0,
                y: isHovered ? 2 : 0
            )
            .animation(.easeOut(duration: 0.12), value: isHovered)
            .onHover { hovering in
                isHovered = hovering
            }
    }
}`;
    } else if (component === 'BrandColors') {
      code = `import SwiftUI

enum BrandColors {
    static let nsp = Color(hex: "8046C2")
    static let il = Color(hex: "FF6B35")
    static let cd = Color(hex: "4ECDC4")
    static let iad = Color(hex: "45B7D1")
    static let fad = Color(hex: "96CEB4")
    static let pd = Color(hex: "FFEAA7")
    static let imat = Color(hex: "DDA0DD")
    
    static func color(for major: String) -> Color {
        switch major.uppercased() {
        case "NSP": return nsp
        case "IL": return il
        case "CD": return cd
        case "IAD": return iad
        case "FAD": return fad
        case "PD": return pd
        case "IMAT": return imat
        default: return .gray
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: code
        }
      ]
    };
  }

  if (name === 'get_implementation_tasks') {
    const tasks = `# DesignKit Implementation Tasks

## 🎨 Phase 1: Foundation (Week 1)
1. **Brand Colors**: Implement BrandColors enum with hex support
2. **Glass Materials**: Create Material extensions for Liquid Glass
3. **Typography**: Set up ABC Whyte and Space Mono font registration
4. **GlassStyle**: Core view modifier with glass effects

## 🔧 Phase 2: Components (Week 2)
5. **GlassChip**: Interactive chips with hover effects
6. **GlassPanel**: Sliding panels with parallax
7. **GlassButton**: Interactive buttons with glass materials
8. **GlassSheet**: Modal sheets with thick material

## ✨ Phase 3: Motion & Polish (Week 3)
9. **Animation System**: Hover breathing, chip reveal, panel parallax
10. **Accessibility**: Reduce Motion/Transparency compliance
11. **Performance**: Optimize glass effects for 45fps+
12. **Testing**: Snapshot tests for all components

## 📱 Phase 4: Platform Integration (Week 4)
13. **iPad Layout**: NavigationSplitView integration
14. **iPhone Layout**: TabView and glass menu integration
15. **Responsive Design**: Adaptive layouts for different screen sizes
16. **Preview Fixtures**: Sample data for SwiftUI previews

## 🔄 Handoff Requirements
- All components expose public protocols
- Preview fixtures for other agents
- Performance benchmarks met (≤50ms hover)
- Accessibility compliance verified
- Snapshot tests passing`;

    return {
      content: [
        {
          type: 'text',
          text: tasks
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Available tools: get_design_spec, generate_swift_code, get_implementation_tasks'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
