import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'studio-space-plankit',
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

  if (name === 'get_plan_spec') {
    const spec = `# PlanKit Specification

## 🗺️ Plan Rendering System
- **Input**: PDF/SVG floor plans with studio polygons
- **Output**: Interactive canvas with hover detection
- **Performance**: ≤50ms hover latency, 45fps+ rendering

## 🔍 Hit-Testing Architecture
- **Quadtree**: Spatial partitioning for efficient polygon queries
- **Ray-Casting**: Point-in-polygon detection for hover/tap
- **Caching**: Edge data and transform matrices for performance

## 📐 Coordinate System
- **Plan Coordinates**: Original PDF/SVG coordinate space
- **Screen Coordinates**: Device pixel coordinates
- **Transform**: Affine transformation matrix for zoom/pan
- **Inverse Transform**: Screen → Plan coordinate mapping

## 🎯 Hover System
- **Detection**: Apple Pencil hover + trackpad hover
- **Hover Chip**: Glass material with student/studio info
- **Performance**: ≤50ms initial, ≤80ms follow, 45fps+
- **Animation**: Spring-based reveal with glass effects

## 🔧 Polygon Management
- **Storage**: JSON array of [x, y] coordinate pairs
- **Validation**: Convex hull, minimum area, coordinate bounds
- **Editing**: Add/remove vertices, edge insertion, snapping
- **Optimization**: Douglas-Peucker simplification on save

## 📱 Platform Integration
- **iPad**: Large canvas with multi-touch gestures
- **iPhone**: Responsive canvas with touch gestures
- **Gestures**: Two-finger pan/zoom, double-tap zoom
- **Accessibility**: VoiceOver support for studio selection`;

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
    
    if (component === 'PlanRenderer') {
      code = `import SwiftUI
import PDFKit
import CoreGraphics

// MARK: - Plan Renderer
class PlanRenderer: ObservableObject {
    @Published var planImage: UIImage?
    @Published var transform: CGAffineTransform = .identity
    @Published var hoveredStudio: Studio?
    
    private var quadtree: QuadTree?
    private var studios: [Studio] = []
    private var planSize: CGSize = .zero
    
    // MARK: - Plan Loading
    func loadPlan(from url: URL) async throws {
        guard let document = PDFDocument(url: url) else {
            throw PlanError.invalidDocument
        }
        
        guard let page = document.page(at: 0) else {
            throw PlanError.noPages
        }
        
        let pageSize = page.bounds(for: .mediaBox)
        planSize = pageSize.size
        
        // Render PDF to image
        let renderer = UIGraphicsImageRenderer(size: pageSize.size)
        planImage = renderer.image { context in
            context.cgContext.setFillColor(UIColor.white.cgColor)
            context.cgContext.fill(pageSize)
            
            page.draw(with: .mediaBox, to: context.cgContext)
        }
        
        // Build quadtree for hit testing
        await buildQuadtree()
    }
    
    // MARK: - Quadtree Building
    private func buildQuadtree() async {
        let bounds = CGRect(origin: .zero, size: planSize)
        quadtree = QuadTree(bounds: bounds)
        
        for studio in studios {
            if let polygon = studio.polygonCoordinates {
                let studioBounds = polygonBounds(polygon)
                quadtree?.insert(studio: studio, bounds: studioBounds)
            }
        }
    }
    
    // MARK: - Hit Testing
    func hitTest(at screenPoint: CGPoint) -> Studio? {
        let planPoint = screenPoint.applying(transform.inverted())
        
        guard let quadtree = quadtree else { return nil }
        
        let candidates = quadtree.query(point: planPoint)
        
        for studio in candidates {
            if let polygon = studio.polygonCoordinates,
               isPointInPolygon(planPoint, polygon: polygon) {
                return studio
            }
        }
        
        return nil
    }
    
    // MARK: - Coordinate Conversion
    private func isPointInPolygon(_ point: CGPoint, polygon: [[Double]]) -> Bool {
        var inside = false
        let count = polygon.count
        
        for i in 0..<count {
            let j = (i + 1) % count
            let xi = polygon[i][0], yi = polygon[i][1]
            let xj = polygon[j][0], yj = polygon[j][1]
            
            if ((yi > point.y) != (yj > point.y)) &&
               (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) {
                inside = !inside
            }
        }
        
        return inside
    }
    
    private func polygonBounds(_ polygon: [[Double]]) -> CGRect {
        let xs = polygon.map { $0[0] }
        let ys = polygon.map { $0[1] }
        
        let minX = xs.min() ?? 0
        let maxX = xs.max() ?? 0
        let minY = ys.min() ?? 0
        let maxY = ys.max() ?? 0
        
        return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }
}

// MARK: - QuadTree
class QuadTree {
    private let bounds: CGRect
    private var studios: [Studio] = []
    private var children: [QuadTree] = []
    private let maxObjects = 10
    private let maxLevels = 5
    
    init(bounds: CGRect, level: Int = 0) {
        self.bounds = bounds
    }
    
    func insert(studio: Studio, bounds: CGRect) {
        if children.isEmpty {
            if studios.count < maxObjects {
                studios.append(studio)
                return
            }
            
            if level < maxLevels {
                subdivide()
            }
        }
        
        for child in children {
            if child.bounds.intersects(bounds) {
                child.insert(studio: studio, bounds: bounds)
            }
        }
    }
    
    func query(point: CGPoint) -> [Studio] {
        var result: [Studio] = []
        
        if !bounds.contains(point) {
            return result
        }
        
        result.append(contentsOf: studios)
        
        for child in children {
            result.append(contentsOf: child.query(point: point))
        }
        
        return result
    }
    
    private func subdivide() {
        let width = bounds.width / 2
        let height = bounds.height / 2
        let x = bounds.minX
        let y = bounds.minY
        
        children = [
            QuadTree(bounds: CGRect(x: x, y: y, width: width, height: height)),
            QuadTree(bounds: CGRect(x: x + width, y: y, width: width, height: height)),
            QuadTree(bounds: CGRect(x: x, y: y + height, width: width, height: height)),
            QuadTree(bounds: CGRect(x: x + width, y: y + height, width: width, height: height))
        ]
        
        // Redistribute existing studios
        for studio in studios {
            for child in children {
                if let polygon = studio.polygonCoordinates {
                    let studioBounds = polygonBounds(polygon)
                    if child.bounds.intersects(studioBounds) {
                        child.insert(studio: studio, bounds: studioBounds)
                    }
                }
            }
        }
        
        studios.removeAll()
    }
    
    private func polygonBounds(_ polygon: [[Double]]) -> CGRect {
        let xs = polygon.map { $0[0] }
        let ys = polygon.map { $0[1] }
        
        let minX = xs.min() ?? 0
        let maxX = xs.max() ?? 0
        let minY = ys.min() ?? 0
        let maxY = ys.max() ?? 0
        
        return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }
}

// MARK: - Errors
enum PlanError: Error {
    case invalidDocument
    case noPages
    case renderingFailed
}`;
    } else if (component === 'HoverChip') {
      code = `import SwiftUI

// MARK: - Hover Chip
struct HoverChip: View {
    let studio: Studio
    let assignment: Assignment?
    
    @State private var isVisible = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Student Name
            if let assignment = assignment {
                Text(assignment.student.displayName)
                    .font(.custom("ABCWhyte-Bold", size: 16, relativeTo: .body))
                    .foregroundColor(.primary)
            }
            
            // Level and Majors
            if let assignment = assignment {
                HStack(spacing: 8) {
                    Text(assignment.student.level)
                        .font(.custom("ABCWhyte-Book", size: 14, relativeTo: .caption))
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .font(.custom("ABCWhyte-Book", size: 14, relativeTo: .caption))
                        .foregroundColor(.secondary)
                    
                    Text(assignment.student.majors.joined(separator: ", "))
                        .font(.custom("ABCWhyte-Book", size: 14, relativeTo: .caption))
                        .foregroundColor(.secondary)
                }
            }
            
            // Studio Label
            Text(studio.studio_label)
                .font(.custom("SpaceMono-Regular", size: 12, relativeTo: .caption2))
                .foregroundColor(.secondary)
                .tracking(0.5)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Material.thinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(
                            BrandColors.color(for: studio.department).opacity(0.3),
                            lineWidth: 1
                        )
                )
        )
        .shadow(
            color: BrandColors.color(for: studio.department).opacity(0.2),
            radius: 8,
            x: 0,
            y: 4
        )
        .opacity(isVisible ? 1 : 0)
        .scaleEffect(isVisible ? 1 : 0.8)
        .animation(
            .spring(response: 0.55, dampingFraction: 0.9),
            value: isVisible
        )
        .onAppear {
            isVisible = true
        }
        .onDisappear {
            isVisible = false
        }
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
    const tasks = `# PlanKit Implementation Tasks

## 🗺️ Phase 1: Plan Loading (Week 1)
1. **PDF Loading**: Implement PDFKit integration for floor plans
2. **Image Rendering**: Convert PDF pages to UIImage for display
3. **Coordinate System**: Set up plan vs screen coordinate mapping
4. **Transform Matrix**: Implement zoom/pan transformation system

## 🔍 Phase 2: Hit Testing (Week 2)
5. **QuadTree**: Build spatial partitioning data structure
6. **Polygon Storage**: Handle JSON polygon coordinate arrays
7. **Ray Casting**: Implement point-in-polygon detection
8. **Performance**: Optimize for ≤50ms hover latency

## 🎯 Phase 3: Hover System (Week 3)
9. **Hover Detection**: Apple Pencil + trackpad hover support
10. **Hover Chip**: Glass material chip with student/studio info
11. **Animation**: Spring-based reveal with glass effects
12. **Performance**: Maintain 45fps+ during hover

## 🔧 Phase 4: Polygon Management (Week 4)
13. **Polygon Editor**: Add/remove vertices, edge insertion
14. **Snapping**: 0°/45°/90° angle snapping with ⌘ key
15. **Optimization**: Douglas-Peucker simplification
16. **Validation**: Coordinate bounds and convex hull checks

## 🔄 Handoff Requirements
- All components expose public protocols
- Performance benchmarks met (≤50ms hover)
- Hover chip integrates with DesignKit
- Polygon editor ready for AdminTools
- Unit tests for quadtree and hit testing
- Preview fixtures available`;

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
        text: 'Available tools: get_plan_spec, generate_swift_code, get_implementation_tasks'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
