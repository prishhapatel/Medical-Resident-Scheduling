PITCH
* Create a scheduling application for medical residents that auto-generates a call schedule:
* Residents schedule changes monthly
* Be able to enter schedule of residents in order for the application to know who to pick from
* Make Blackout days for days residents cannot be scheduled for call
* Medical residents are able to add their vacation days to the applications, that are than approved by chief residents prior to generating schedule
* Schedule can be reviewed prior to publishing
* Be able to have the ability to switch calls after the schedule has been made between residents
* Have an administrative side in order to:
* Add/remove residents
* Edit residents schedule manually if needed
* Keep a running total of amount worked for each reside

WHAT DOES OUR CALL SCHEDULE LOOK LIKE?
* Short calls:
  - M-F from 4:30pm-8pm
* Weekend Calls:
  - Saturday 24 hour call 8am-8am
  - Needs the ability for residents to split into two 12 hour shifts
  - Saturday 12 hour call 8am-8pm
  - Sunday 12 hour call 8am-8pm
WHO IS SCHEDULED FOR CALLS?
* Residents:
  - Post-graduate year 1 (PGY1)
  - Post-graduate year 2 (PGY2)
  - Post-graduate year 3 (PGY3)
* July and August
  - PGY1 need to complete three training calls with a PGY3
  - PGY1 need to complete one 24 hours Saturday training call with a PGY2
  - PGY1 need to complete one 12 hour Sunday training call with a PGY2
* September through June
  - PGY1 and PGY2 complete short calls and weekend call
* SPECIAL HOLIDAY CALLS
  - July 4th - 12 hour (PGY2)
  - Labor Day - 2 hour (PGY2)
  - Thanksgiving - 24 hour (PGY1)
  - Black Friday
      - 24 hour (PGY1)
      - 12 hour (PGY2)
  - Christmas Day - 24 hour (PGY1)
  - New Years Day - 24 hour (PGY1)
  - Memorial Day - 12 hour (PGY1)

BLACKOUT DAYS
* Night rotation (one month during PGY1, two weeks during PGY2)
* Day before and after night rotation
* Emergency Medicine rotation (one month)
* IM inpatient rotation (one month)

Codebase Structure

Project Layers
  frontend/
    (React)


  backend/
* 1. Models
    Located in: MedicalDemo.Data.Models

    Represents the database tables using C# classes (e.g., Admins, Residents, Rotations, etc.)

    Managed through Entity Framework Core

    Configured via MedicalContext.cs

* 2. Repositories
    Located in: Repositories/

    IMedicalRepository.cs – Interface that defines methods for accessing all major tables.

    MedicalDataRepository.cs – Implements the data access logic using EF Core (e.g., fetch all residents, update admins).

    Serves as a bridge between the database and higher-level application logic (controllers/services).

* 3. API Controllers
    Located in: Controllers/

    Handles HTTP requests from the React frontend

    Uses MedicalRepository to access data

    Example: AdminController exposes /api/admin/all to get all admins


Frontend (React) → API Controller → Repository → Database


* Please Note:
    Our project currently does not use parameterized queries, which poses potential security risks such as SQL injection. To ensure a safe applitcation, the next development team should update all database interactions to use parameterized queries. Fortunately, ASP.NET makes this transition pretty straightforward through libraries like Entity Framework and ADO.NET.
