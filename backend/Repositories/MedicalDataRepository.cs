using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;
using MedicalDemo.Models;
using MedicalDemo.Repositories;

namespace MedicalDemo.Repositories
{
    public class MedicalDataRepository : IMedicalRepository
    {
        private readonly MedicalContext _context;
        //global variable(s)
        private List<Admins> _admins;
        private List<Residents> _residents;
        private List<Rotations> _rotations;
        private List<ResidentData> _residentData;
        private List<Vacations> _vacations;


        public MedicalDataRepository(MedicalContext contextFactory)
        {
            _context = contextFactory;
        }

        public async Task<List<Admins>> GetAllAdminsAsync()
        {
            if (_admins == null)
            {
                _admins = await _context.admins.ToListAsync();
            }

            return _admins;
        }

        public async Task<List<Residents>> GetAllResidentsAsync()
        {
            if (_residents == null)
            {
                _residents = await _context.residents.ToListAsync();
            }

            return _residents;
        }



        public async Task<List<Rotations>> GetAllRotationsAsync()
        {
            if (_rotations == null)
            {
                _rotations = await _context.rotations.ToListAsync();
            }

            return _rotations;
        }


        public async Task<List<Vacations>> GetAllVacationsAsync()
        {
            if (_vacations == null)
            {
                _vacations = await _context.vacations.ToListAsync();
            }

            return _vacations;
        }

        //PGY 1
        public async Task<List<Residents>> LoadPGYOne()
        {
            if(_residents == null)
            {
               _residents = await _context.residents.ToListAsync();
            }
            return _residents.Where(r => r.graduate_yr == 1).ToList();

        }

        //PGY 2
        public async Task<List<Residents>> LoadPGYTwo()
        {
            if (_residents == null)
            {
                _residents = await _context.residents.ToListAsync();
            }
            return _residents.Where(r => r.graduate_yr == 2).ToList();

        }

        //PGY 3
        public async Task<List<Residents>> LoadPGYThree()
        {
            if (_residents == null)
            {
                _residents = await _context.residents.ToListAsync();
            }
            return _residents.Where(r => r.graduate_yr == 3).ToList();

        }




        //ResidentData
        public async Task LoadResidentDataAsync()
        {
            if (_residentData != null) return;

            _residentData = await (from r in _context.residents
                                   join rot in _context.rotations on r.resident_id.ToString() equals rot.ResidentId
                                   select new ResidentData
                                   {
                                       resident_id = r.resident_id.ToString(),
                                       first_name = r.first_name,
                                       last_name = r.last_name,
                                       graduate_yr = r.graduate_yr,
                                       email = r.email,
                                       password = r.password,
                                       phone_num = r.phone_num,
                                       weekly_hours = r.weekly_hours,
                                       total_hours = r.total_hours,
                                       bi_yearly_hours = r.bi_yearly_hours,
                                       RotationId = rot.RotationId,
                                       Month = rot.Month,
                                       Rotation = rot.Rotation
                                   }).ToListAsync();
        }


        //REISDENTS ROTATIONS ByIDByMonths i dont think we use this
        public async Task<Dictionary<string, List<Rotations>>> GetResidentRolesByMonthAsync()
        {

            if(_rotations == null) 
            {
                _rotations = await _context.rotations.ToListAsync();
            }

            return _rotations
           .GroupBy(r => r.ResidentId)
           .ToDictionary(g => g.Key, g => g.OrderBy(r => r.Month).ToList());
        }

        public async Task<List<Dates>> GenerateTrainingDatesAsync()
        {
            Guid scheduleId = Guid.NewGuid(); // New schedule session
            List<Dates> trainingDates = new List<Dates>();

            DateTime currentDay = new DateTime(DateTime.Now.Year, 7, 5);
            DateTime endDay = new DateTime(DateTime.Now.Year, 8, 31);

            while (currentDay <= endDay)
            {
                string callType = null;
                DayOfWeek dow = currentDay.DayOfWeek;

                if (dow == DayOfWeek.Tuesday || dow == DayOfWeek.Wednesday || dow == DayOfWeek.Thursday)
                    callType = "Short";
                else if (dow == DayOfWeek.Saturday)
                    callType = "Saturday";
                else if (dow == DayOfWeek.Sunday)
                    callType = "Sunday";

                if (callType != null)
                {
                    trainingDates.Add(new Dates
                    {
                        DateId = Guid.NewGuid(),
                        ScheduleId = scheduleId,
                        ResidentId = null, // to be filled by scheduling later
                        Date = currentDay,
                        CallType = callType
                    });
                }

                currentDay = currentDay.AddDays(1);
            }

            //await _context.dates.AddRangeAsync(trainingDates);
            //await _context.SaveChangesAsync();

            return trainingDates;
        }




        public async Task<List<Dates>> GenerateTrainingScheduleAsync()
        {
            var pgy1s = await LoadPGYOne();
            var pgy2s = await LoadPGYTwo();
            var pgy3s = await LoadPGYThree();
            var allRotations = await GetAllRotationsAsync();

            var trainingDates = await GenerateTrainingDatesAsync();
            var shortCalls = trainingDates.Where(d => d.CallType == "Short").ToList();
            var saturdays = trainingDates.Where(d => d.CallType == "Saturday").ToList();
            var sundays = trainingDates.Where(d => d.CallType == "Sunday").ToList();

            int shortCallAmt = shortCalls.Count;
            int satCallAmt = saturdays.Count;
            int sunCallAmt = sundays.Count;
            int pgy1 = pgy1s.Count;
            int pgy2 = pgy2s.Count;
            int pgy3 = pgy3s.Count;

            // SHORT CALLS (PGY1 + PGY3)
            int shortCallNodes = shortCallAmt * 2 + pgy3 + pgy1 + 2;
            int shortSource = shortCallNodes - 2;
            int shortSink = shortCallNodes - 1;
            Graph shortCallGraph = new Graph(shortCallNodes);

            for (int i = 0; i < pgy1; i++)
                shortCallGraph.addEdge(shortSource, shortCallAmt * 2 + pgy3 + i, 3);

            for (int i = 0; i < pgy1; i++)
            {
                for (int j = 0; j < shortCallAmt; j++)
                {
                    var shortDay = shortCalls[j].Date;
                    string shortMonth = shortDay.ToString("MMMM");
                    if (IsEligibleForShortCall(pgy1s[i].resident_id, shortMonth, allRotations))
                        shortCallGraph.addEdge(shortCallAmt * 2 + pgy3 + i, 2 * j, 1);
                }
            }

            for (int i = 0; i < shortCallAmt; i++)
                shortCallGraph.addEdge(i * 2, i * 2 + 1, 1);

            for (int i = 0; i < shortCallAmt; i++)
                for (int j = 0; j < pgy3; j++)
                    shortCallGraph.addEdge(i * 2 + 1, shortCallAmt * 2 + j, 1);

            int estPgy3Training = (3 * pgy1 + pgy3 - 1) / pgy3;
            for (int i = 0; i < pgy3; i++)
                shortCallGraph.addEdge(shortCallAmt * 2 + i, shortSink, estPgy3Training);

            shortCallGraph.getFlow(shortSource, shortSink);

            // SATURDAY CALLS (PGY1 + PGY2)
            int satNodes = satCallAmt * 2 + pgy2 + pgy1 + 2;
            int satSource = satNodes - 2;
            int satSink = satNodes - 1;
            Graph satGraph = new Graph(satNodes);

            for (int i = 0; i < pgy1; i++)
                satGraph.addEdge(satSource, satCallAmt * 2 + pgy2 + i, 1);

            for (int i = 0; i < pgy1; i++)
            {
                for (int j = 0; j < satCallAmt; j++)
                {
                    var satDay = saturdays[j].Date;
                    string satMonth = satDay.ToString("MMMM");
                    if (IsEligibleForLongCall(pgy1s[i].resident_id, satMonth, allRotations))
                        satGraph.addEdge(satCallAmt * 2 + pgy2 + i, 2 * j, 1);
                }
            }

            for (int i = 0; i < satCallAmt; i++)
                satGraph.addEdge(i * 2, i * 2 + 1, 1);

            for (int i = 0; i < pgy2; i++)
            {
                for (int j = 0; j < satCallAmt; j++)
                {
                    var satDay = saturdays[j].Date;
                    string satMonth = satDay.ToString("MMMM");
                    if (IsEligibleForLongCall(pgy2s[i].resident_id, satMonth, allRotations))
                        satGraph.addEdge(2 * j + 1, satCallAmt * 2 + i, 1);
                }
            }

            int estPgy2Sat = (pgy1 + pgy2 - 1) / pgy2;
            for (int i = 0; i < pgy2; i++)
                satGraph.addEdge(satCallAmt * 2 + i, satSink, estPgy2Sat);

            satGraph.getFlow(satSource, satSink);

            // SUNDAY CALLS (PGY1 + PGY2)
            int sunNodes = sunCallAmt * 2 + pgy2 + pgy1 + 2;
            int sunSource = sunNodes - 2;
            int sunSink = sunNodes - 1;
            Graph sunGraph = new Graph(sunNodes);

            for (int i = 0; i < pgy1; i++)
                sunGraph.addEdge(sunSource, sunCallAmt * 2 + pgy2 + i, 1);

            for (int i = 0; i < pgy1; i++)
            {
                for (int j = 0; j < sunCallAmt; j++)
                {
                    var sunDay = sundays[j].Date;
                    string sunMonth = sunDay.ToString("MMMM");
                    if (IsEligibleForLongCall(pgy1s[i].resident_id, sunMonth, allRotations))
                        sunGraph.addEdge(sunCallAmt * 2 + pgy2 + i, 2 * j, 1);
                }
            }

            for (int i = 0; i < sunCallAmt; i++)
                sunGraph.addEdge(i * 2, i * 2 + 1, 1);

            for (int i = 0; i < pgy2; i++)
            {
                for (int j = 0; j < sunCallAmt; j++)
                {
                    var sunDay = sundays[j].Date;
                    string sunMonth = sunDay.ToString("MMMM");
                    if (IsEligibleForLongCall(pgy2s[i].resident_id, sunMonth, allRotations))
                        sunGraph.addEdge(2 * j + 1, sunCallAmt * 2 + i, 1);
                }
            }

            int estPgy2Sun = (pgy1 + pgy2 - 1) / pgy2;
            for (int i = 0; i < pgy2; i++)
                sunGraph.addEdge(sunCallAmt * 2 + i, sunSink, estPgy2Sun);

            sunGraph.getFlow(sunSource, sunSink);

            // MAP FLOW RESULTS
            var pgy1Map = shortCallGraph.MapIndexToResidentIds(pgy1s.Select(r => r.resident_id).ToList(), shortCallAmt * 2 + pgy3);
            shortCallGraph.AssignResidentIdsToDates(shortCalls, pgy1Map, true);
            var pgy3Map = shortCallGraph.MapIndexToResidentIds(pgy3s.Select(r => r.resident_id).ToList(), shortCallAmt * 2);
            shortCallGraph.AssignResidentIdsToDates(shortCalls, pgy3Map, false);

            var pgy1SatMap = satGraph.MapIndexToResidentIds(pgy1s.Select(r => r.resident_id).ToList(), satCallAmt * 2 + pgy2);
            satGraph.AssignResidentIdsToDates(saturdays, pgy1SatMap, true);
            var pgy2SatMap = satGraph.MapIndexToResidentIds(pgy2s.Select(r => r.resident_id).ToList(), satCallAmt * 2);
            satGraph.AssignResidentIdsToDates(saturdays, pgy2SatMap, false);

            var pgy1SunMap = sunGraph.MapIndexToResidentIds(pgy1s.Select(r => r.resident_id).ToList(), sunCallAmt * 2 + pgy2);
            sunGraph.AssignResidentIdsToDates(sundays, pgy1SunMap, true);
            var pgy2SunMap = sunGraph.MapIndexToResidentIds(pgy2s.Select(r => r.resident_id).ToList(), sunCallAmt * 2);
            sunGraph.AssignResidentIdsToDates(sundays, pgy2SunMap, false);

            await FixPGY1WeekendConflicts(trainingDates, pgy1s.Select(r => r.resident_id).ToList());
            await FixPGY2WeekendConflicts(trainingDates, pgy2s.Select(r => r.resident_id).ToList());

            return trainingDates;
        }



        private async Task FixPGY1WeekendConflicts(List<Dates> dates, List<string> pgy1Ids)
        {
            var saturdayDates = dates.Where(d => d.CallType == "Saturday").ToList();
            var sundayDates = dates.Where(d => d.CallType == "Sunday").ToList();

            foreach (var resId in pgy1Ids)
            {
                var weekendAssignments = dates.Where(d => d.ResidentId != null && d.ResidentId.Contains(resId) && (d.CallType == "Saturday" || d.CallType == "Sunday"));
                foreach (var conflictDay in weekendAssignments)
                {
                    var otherDay = (conflictDay.CallType == "Saturday") ? conflictDay.Date.AddDays(1) : conflictDay.Date.AddDays(-1);
                    var match = dates.FirstOrDefault(d => d.Date.Date == otherDay.Date && d.CallType == conflictDay.CallType);

                    if (match == null || !pgy1Ids.Contains(match.ResidentId)) continue;

                    string tmp = match.ResidentId;
                    match.ResidentId = conflictDay.ResidentId;
                    conflictDay.ResidentId = tmp;
                }
            }
        }

        private async Task FixPGY2WeekendConflicts(List<Dates> dates, List<string> pgy2Ids)
        {
            var saturdayDates = dates.Where(d => d.CallType == "Saturday").ToList();
            var sundayDates = dates.Where(d => d.CallType == "Sunday").ToList();

            foreach (var resId in pgy2Ids)
            {
                var weekendAssignments = dates.Where(d => d.ResidentId != null && d.ResidentId.Contains(resId) && (d.CallType == "Saturday" || d.CallType == "Sunday"));
                foreach (var conflictDay in weekendAssignments)
                {
                    var otherDay = (conflictDay.CallType == "Saturday") ? conflictDay.Date.AddDays(1) : conflictDay.Date.AddDays(-1);
                    var match = dates.FirstOrDefault(d => d.Date.Date == otherDay.Date && d.CallType == conflictDay.CallType);

                    if (match == null || !pgy2Ids.Contains(match.ResidentId)) continue;

                    string tmp = match.ResidentId;
                    match.ResidentId = conflictDay.ResidentId;
                    conflictDay.ResidentId = tmp;
                }
            }
        }

        private bool IsEligibleForShortCall(string residentId, string month, List<Rotations> allRotations)
        {
            return allRotations.Any(r =>
                r.ResidentId == residentId &&
                r.Month.Equals(month, StringComparison.OrdinalIgnoreCase));
        }

        private bool IsEligibleForLongCall(string residentId, string month, List<Rotations> allRotations)
        {
            return allRotations.Any(r =>
                r.ResidentId == residentId &&
                r.Month.Equals(month, StringComparison.OrdinalIgnoreCase));
        }




        private class Edge
        {
            public int destination, reverse;
            public int currentCap, originalCap;

            public Edge(int destination, int reverse, int cap)
            {
                this.destination = destination;
                this.reverse = reverse;
                currentCap = cap;
                originalCap = cap;
            }

            public int flow()
            {
                return originalCap - currentCap;
            }
        }

        private class Graph
        {
            int[] level, pointers, queue;
            public List<List<Edge>> adjList;
            private List<(int start, int end, int capacity)> edgeList;

            public Graph(int nodesAmt)
            {
                level = new int[nodesAmt];
                pointers = new int[nodesAmt];
                queue = new int[nodesAmt];

                edgeList = new List<(int, int, int)>();
                adjList = new List<List<Edge>>();

                for (int i = 0; i < nodesAmt; i++)
                {
                    adjList.Add(new List<Edge>());
                }
            }

            public void addEdge(int start, int end, int capacity)
            {
                edgeList.Add((start, end, capacity));
            }

            public void addEdgeToAdj(int start, int end, int capacity)
            {
                adjList[start].Add(new Edge(end, adjList[end].Count, capacity));
                adjList[end].Add(new Edge(start, adjList[start].Count - 1, 0));
            }

            int dfs(int currNode, int sink, int flow)
            {
                if (currNode == sink || flow == 0)
                    return flow;

                for (; pointers[currNode] < adjList[currNode].Count; pointers[currNode]++)
                {
                    Edge currEdge = adjList[currNode][pointers[currNode]];

                    if (level[currEdge.destination] == level[currNode] + 1)
                    {
                        int pushed = dfs(currEdge.destination, sink, Math.Min(flow, currEdge.currentCap));
                        if (pushed > 0)
                        {
                            currEdge.currentCap -= pushed;
                            adjList[currEdge.destination][currEdge.reverse].currentCap += pushed;
                            return pushed;
                        }
                    }
                }
                return 0;
            }

            public int getFlow(int source, int sink)
            {
                Random rand = new Random((int)DateTime.Now.Ticks);

                for (int i = 0; i < edgeList.Count; i++)
                {
                    int j = rand.Next(i, edgeList.Count);
                    if (i != j)
                    {
                        var tmp = edgeList[i];
                        edgeList[i] = edgeList[j];
                        edgeList[j] = tmp;
                    }

                    var edge = edgeList[i];
                    addEdgeToAdj(edge.start, edge.end, edge.capacity);
                }

                int totalFlow = 0;
                int currFlow;

                do
                {
                    Array.Fill(level, 0);
                    Array.Fill(pointers, 0);

                    int qStart = 0, qEnd = 1;
                    queue[0] = source;
                    level[source] = 1;

                    while (qStart < qEnd && level[sink] == 0)
                    {
                        int node = queue[qStart++];

                        foreach (Edge edge in adjList[node])
                        {
                            int dest = edge.destination;
                            if (level[dest] == 0 && edge.currentCap > 0)
                            {
                                level[dest] = level[node] + 1;
                                queue[qEnd++] = dest;
                            }
                        }
                    }

                    currFlow = 0;
                    int pushed;
                    do
                    {
                        pushed = dfs(source, sink, int.MaxValue);
                        currFlow += pushed;
                    } while (pushed != 0);

                    totalFlow += currFlow;

                } while (currFlow != 0);



                return totalFlow;
            }

            public List<int> GetAssignedDestinationsFrom(int nodeIndex)
            {
                List<int> assigned = new List<int>();
                foreach (var edge in adjList[nodeIndex])
                {
                    if (edge.flow() > 0)
                        assigned.Add(edge.destination);
                }
                return assigned;
            }

            public List<int> GetAssignedSourcesTo(int nodeIndex)
            {
                List<int> assigned = new List<int>();
                foreach (var edge in adjList[nodeIndex])
                {
                    if (edge.flow() < 0)
                        assigned.Add(edge.destination);
                }
                return assigned;
            }

            public Dictionary<int, string> MapIndexToResidentIds(List<string> residentIds, int startIndex)
            {
                var map = new Dictionary<int, string>();
                for (int i = 0; i < residentIds.Count; i++)
                {
                    map[startIndex + i] = residentIds[i];
                }
                return map;
            }

            public void AssignResidentIdsToDates(List<Dates> dates, Dictionary<int, string> nodeToResidentMap, bool outgoing)
            {


                foreach (var kvp in nodeToResidentMap)
                {
                    var node = kvp.Key;
                    var residentId = kvp.Value;
                    var linkedNodes = outgoing ? GetAssignedDestinationsFrom(node) : GetAssignedSourcesTo(node);
                    foreach (int dest in linkedNodes)
                    {
                        int dayIndex = dest / 2;
                        if (dayIndex >= 0 && dayIndex < dates.Count)
                        {
                            if (string.IsNullOrEmpty(dates[dayIndex].ResidentId))
                                dates[dayIndex].ResidentId = residentId;
                            else
                                dates[dayIndex].ResidentId += $",{residentId}"; // if multiple residents
                        }
                    }
                }

                //for (int i = 0; i < dates.Count; i++)
                //{
                //    if (string.IsNullOrEmpty(dates[i].ResidentId))
                //        Console.WriteLine($"Date at index {i} ({dates[i].Date}) was not assigned a resident.");
                //}
            }
        }

        // Method to store the output into our database
        public async Task InsertScheduleOutput(string inputText, Guid scheduleId, DbContext context)
        {
            var lines = inputText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                try
                {
                    // Parse out resident ID part and the rest
                    var resSplit = line.Split("Resident ID:")[1].Split(", Date:");
                    var residentIdsRaw = resSplit[0].Trim();

                    // Parse and clean individual resident IDs
                    var residentIds = residentIdsRaw
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => id.Trim())
                        .Where(id => !string.IsNullOrWhiteSpace(id))
                        .ToList();

                    // Skip lines with no valid resident IDs
                    if (!residentIds.Any())
                        continue;

                    // Parse date and call type
                    var dateSplit = resSplit[1].Split(", Call Type:");
                    if (!DateTime.TryParse(dateSplit[0].Trim(), out DateTime date))
                        continue;

                    var callType = dateSplit[1].Trim();

                    // Add each resident entry to the context
                    foreach (var residentId in residentIds)
                    {
                        var newEntry = new Dates
                        {
                            DateId = Guid.NewGuid(),
                            ScheduleId = scheduleId,
                            ResidentId = residentId,
                            Date = date,
                            CallType = callType
                        };

                        context.Add(newEntry);
                    }
                }
                catch (Exception ex)
                {
                    // Optional: handle or log malformed line
                    Console.WriteLine($"Error processing line: {line} - {ex.Message}");
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
