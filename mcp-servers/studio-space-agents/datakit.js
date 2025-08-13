import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'studio-space-datakit',
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

  if (name === 'get_data_schema') {
    const schema = `# DataKit Schema Specification

## 🗄️ Core Data Entities

### Floor
- floor_id: String (primary key)
- building: String
- floor_name: String
- plan_file_url: String
- plan_width_pt: Double
- plan_height_pt: Double
- plan_version: String
- active: Bool
- studios: [Studio] (to-many)

### Studio
- studio_id: String (primary key)
- floor_id: String (foreign key)
- studio_label: String
- department: String
- capacity: Int16
- polygon_json: String (JSON array of coordinates)
- notes: String
- active: Bool
- floor: Floor (to-one)
- assignments: [Assignment] (to-many)
- tickets: [Ticket] (to-many)

### Student
- student_id: String (primary key)
- first_name: String
- last_name: String
- preferred_first: String?
- preferred_last: String?
- level: String (FR, SO, JR, SR, GR)
- status: String (Active, Inactive, Graduated)
- major_1: String
- major_2: String?
- minor_1: String?
- minor_2: String?
- assignments: [Assignment] (to-many)

### Assignment
- assignment_id: String (primary key)
- semester: String (FA25, SP26, etc.)
- studio_id: String (foreign key)
- student_id: String (foreign key)
- start_date: Date
- end_date: Date
- active: Bool
- source: String
- studio: Studio (to-one)
- student: Student (to-one)

### Ticket
- ticket_id: String (primary key)
- studio_id: String (foreign key)
- type: String (Maintenance, Safety, Request, Other)
- priority: String (Low, Medium, High, Urgent)
- status: String (Open, In-Progress, Waiting, Closed)
- submitted_by: String
- submitted_at: Date
- title: String
- body: String
- assignee: String?
- last_update_at: Date
- closed_at: Date?
- studio: Studio (to-one)
- notes: [Note] (to-many)

### Note
- note_id: String (primary key)
- entity_type: String (Ticket, Studio, Student)
- entity_id: String (foreign key)
- author: String
- created_at: Date
- text: String

## 🔌 API Contracts

### GET /v1/majors
Response: [{ "code": "NSP", "name": "New Studio Practice", "color": "#8046C2" }]

### GET /v1/floors?major=NSP
Response: [{ "floor_id": "F-3N", "floor_name": "3 North", "plan_file_url": "...", "plan_width_pt": 842, "plan_height_pt": 595, "plan_version": "v3" }]

### GET /v1/studios?major=NSP&floor_id=F-3N&active=true
Response: [{ "studio_id": "S-3N-045", "studio_label": "3N-045", "floor_id": "F-3N", "department": "NSP", "capacity": 1, "polygon": [[123.4,56.7],[...]], "active": true }]

### GET /v1/assignments?major=NSP&semester=FA25&active=true
Response: [{ "assignment_id": "ASG-0001", "studio_id": "S-3N-045", "semester": "FA25", "active": true, "student": {"id": "A12345", "display_name": "Sam Lee", "level": "SR", "majors": ["NSP"], "minors": []} }]

### GET /v1/tickets?major=NSP&status=Open
Response: [{ "ticket_id": "T-0001", "studio_id": "S-3N-045", "type": "Maint", "priority": "High", "status": "Open", "title": "Outlet broken", "submitted_by": "Griffin", "submitted_at": "2025-09-01T09:13:00Z", "assignee": "Facilities", "last_update_at": "2025-09-02T08:01:00Z", "closed_at": null }]

### POST /v1/tickets
Request: { "studio_id": "S-3N-045", "type": "Maint", "priority": "Medium", "status": "Open", "title": "Loose chair", "body": "Wobbly leg", "assignee": "Facilities" }

### POST /v1/studios/polygon
Request: { "studio_id": "S-3N-045", "polygon": [[10,10],[120,10],[120,80],[10,80]] }

## 🔒 Business Rules
- No two active assignments per studio_id
- Enum validation for type, priority, status fields
- Automatic trimming of string inputs
- Server-side validation of polygon coordinates
- Plan version increment on polygon updates`;

    return {
      content: [
        {
          type: 'text',
          text: schema
        }
      ]
    };
  }

  if (name === 'generate_swift_models') {
    const { model, features } = args;
    
    let code = '';
    
    if (model === 'CoreDataModels') {
      code = `import Foundation
import CoreData

// MARK: - Core Data Stack
class CoreDataStack {
    static let shared = CoreDataStack()
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "StudioSpaceManager")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data error: \\(error)")
            }
        }
        return container
    }()
    
    var context: NSManagedObjectContext {
        persistentContainer.viewContext
    }
    
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Save error: \\(error)")
            }
        }
    }
}

// MARK: - Managed Object Extensions
extension Floor {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Floor> {
        return NSFetchRequest<Floor>(entityName: "Floor")
    }
    
    var activeStudios: [Studio] {
        return (studios?.allObjects as? [Studio] ?? [])
            .filter { $0.active }
            .sorted { $0.studio_label < $1.studio_label }
    }
}

extension Studio {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Studio> {
        return NSFetchRequest<Studio>(entityName: "Studio")
    }
    
    var currentAssignment: Assignment? {
        return (assignments?.allObjects as? [Assignment] ?? [])
            .first { $0.active }
    }
    
    var openTickets: [Ticket] {
        return (tickets?.allObjects as? [Ticket] ?? [])
            .filter { $0.status != "Closed" }
            .sorted { $0.submitted_at > $1.submitted_at }
    }
    
    var polygonCoordinates: [[Double]] {
        guard let json = polygon_json else { return [] }
        return (try? JSONDecoder().decode([[Double]].self, from: Data(json.utf8))) ?? []
    }
}

extension Student {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Student> {
        return NSFetchRequest<Student>(entityName: "Student")
    }
    
    var displayName: String {
        if let preferred = preferred_first, !preferred.isEmpty {
            return "\\(preferred) \\(last_name)"
        }
        return "\\(first_name) \\(last_name)"
    }
    
    var majors: [String] {
        var result = [major_1]
        if let major2 = major_2, !major2.isEmpty { result.append(major2) }
        return result
    }
    
    var minors: [String] {
        var result: [String] = []
        if let minor1 = minor_1, !minor1.isEmpty { result.append(minor1) }
        if let minor2 = minor_2, !minor2.isEmpty { result.append(minor2) }
        return result
    }}`;
    } else if (model === 'APIClient') {
      code = `import Foundation

// MARK: - API Client
class APIClient: ObservableObject {
    static let shared = APIClient()
    private let baseURL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
    
    private init() {}
    
    // MARK: - Majors
    func fetchMajors() async throws -> [Major] {
        let url = URL(string: "\\(baseURL)/v1/majors")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Major].self, from: data)
    }
    
    // MARK: - Floors
    func fetchFloors(for major: String) async throws -> [Floor] {
        let url = URL(string: "\\(baseURL)/v1/floors?major=\\(major)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Floor].self, from: data)
    }
    
    // MARK: - Studios
    func fetchStudios(major: String, floorId: String, active: Bool = true) async throws -> [Studio] {
        let url = URL(string: "\\(baseURL)/v1/studios?major=\\(major)&floor_id=\\(floorId)&active=\\(active)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Studio].self, from: data)
    }
    
    // MARK: - Assignments
    func fetchAssignments(major: String, semester: String, active: Bool = true) async throws -> [Assignment] {
        let url = URL(string: "\\(baseURL)/v1/assignments?major=\\(major)&semester=\\(semester)&active=\\(active)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Assignment].self, from: data)
    }
    
    // MARK: - Tickets
    func fetchTickets(major: String, status: String? = nil) async throws -> [Ticket] {
        var urlString = "\\(baseURL)/v1/tickets?major=\\(major)"
        if let status = status {
            urlString += "&status=\\(status)"
        }
        let url = URL(string: urlString)!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([Ticket].self, from: data)
    }
    
    func createTicket(_ ticket: TicketCreate) async throws -> Ticket {
        let url = URL(string: "\\(baseURL)/v1/tickets")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(ticket)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(Ticket.self, from: data)
    }
    
    // MARK: - Polygon Updates
    func updateStudioPolygon(studioId: String, polygon: [[Double]]) async throws {
        let url = URL(string: "\\(baseURL)/v1/studios/polygon")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = ["studio_id": studioId, "polygon": polygon]
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
    }
}

// MARK: - API Models
struct Major: Codable {
    let code: String
    let name: String
    let color: String
}

struct Floor: Codable {
    let floor_id: String
    let floor_name: String
    let plan_file_url: String
    let plan_width_pt: Double
    let plan_height_pt: Double
    let plan_version: String
}

struct Studio: Codable {
    let studio_id: String
    let studio_label: String
    let floor_id: String
    let department: String
    let capacity: Int
    let polygon: [[Double]]
    let active: Bool
}

struct Assignment: Codable {
    let assignment_id: String
    let studio_id: String
    let semester: String
    let active: Bool
    let student: StudentInfo
}

struct StudentInfo: Codable {
    let id: String
    let display_name: String
    let level: String
    let majors: [String]
    let minors: [String]
}

struct Ticket: Codable {
    let ticket_id: String
    let studio_id: String
    let type: String
    let priority: String
    let status: String
    let title: String
    let submitted_by: String
    let submitted_at: String
    let assignee: String?
    let last_update_at: String
    let closed_at: String?
}

struct TicketCreate: Codable {
    let studio_id: String
    let type: String
    let priority: String
    let status: String
    let title: String
    let body: String
    let assignee: String
}

// MARK: - Errors
enum APIError: Error {
    case invalidResponse
    case decodingError
    case networkError
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
    const tasks = `# DataKit Implementation Tasks

## 🗄️ Phase 1: Core Data Setup (Week 1)
1. **Data Model**: Create .xcdatamodeld with all entities
2. **Relationships**: Set up to-one and to-many relationships
3. **Attributes**: Configure all properties with correct types
4. **Validation**: Add business rules and constraints

## 🔌 Phase 2: API Contracts (Week 2)
5. **API Models**: Implement Codable structs for all endpoints
6. **API Client**: Create HTTP client with async/await
7. **Error Handling**: Define APIError enum and error handling
8. **Response Parsing**: Handle JSON responses and edge cases

## 🔄 Phase 3: Data Sync (Week 3)
9. **Core Data Integration**: Connect API responses to Core Data
10. **Sync Engine**: Implement data synchronization logic
11. **Caching Strategy**: Add intelligent caching for offline support
12. **Conflict Resolution**: Handle data conflicts and updates

## 📱 Phase 4: UI Integration (Week 4)
13. **Observable Objects**: Make models work with SwiftUI
14. **Preview Fixtures**: Create sample data for SwiftUI previews
15. **Performance**: Optimize Core Data queries and relationships
16. **Testing**: Unit tests for all data operations

## 🔄 Handoff Requirements
- All models expose public protocols
- Stable JSON contracts maintained
- Core Data schema finalized
- API client fully functional
- Preview fixtures available
- Unit tests passing`;

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
        text: 'Available tools: get_data_schema, generate_swift_models, get_implementation_tasks'
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
