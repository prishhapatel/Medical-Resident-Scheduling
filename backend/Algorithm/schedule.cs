using System.Collections;
using MedicalDemo.Data.Models;
using MedicalDemo.Models.DTO.Scheduling;

namespace MedicalDemo.Algorithm;

public static class Schedule
{
    public static void Training(int year, List<PGY1DTO> AllPgy1s, List<PGY2DTO> AllPgy2s, List<PGY3DTO> AllPgy3s)
    {
        int pgy1 = AllPgy1s.Count;
        int pgy2 = AllPgy2s.Count;
        int pgy3 = AllPgy3s.Count;

        TrainingCalendar tCalendar = new TrainingCalendar(year);
        int shortCallAmt = tCalendar.dayOfWeekAmt[2] + tCalendar.dayOfWeekAmt[3] + tCalendar.dayOfWeekAmt[4];
        int Sat24hCallAmt = tCalendar.dayOfWeekAmt[6];
        int Sun12hCallAmt = tCalendar.dayOfWeekAmt[0];

        int nodeAmt = shortCallAmt * 2 + pgy3 + pgy1 + 2;
        int source = nodeAmt - 2;
        int sink = nodeAmt - 1;
        Graph graph = new Graph(nodeAmt);

        for (int i = 0; i < pgy1; i++)
            graph.addEdge(source, shortCallAmt * 2 + pgy3 + i, 3);

        for (int i = 0; i < pgy1; i++)
        {
            for (int j = 0; j < shortCallAmt; j++)
            {
                var day = tCalendar.whatShortDayIsIt(j);
                int monthIndex = (day.Month + 5) % 12;
                var role = AllPgy1s[i].RolePerMonth[monthIndex];
                if (role == null || (!role.DoesShort && !role.FlexShort)) continue;
                graph.addEdge(shortCallAmt * 2 + pgy3 + i, j * 2, 1);
            }
        }

        for (int i = 0; i < shortCallAmt; i++)
            graph.addEdge(i * 2, i * 2 + 1, 1);

        for (int i = 0; i < shortCallAmt; i++)
        for (int j = 0; j < pgy3; j++)
            graph.addEdge(i * 2 + 1, shortCallAmt * 2 + j, 1);

        int cap = (3 * pgy1 + pgy3 - 1) / pgy3;
        for (int i = 0; i < pgy3; i++)
            graph.addEdge(shortCallAmt * 2 + i, sink, cap);

        if (graph.getFlow(source, sink) != 3 * pgy1)
            Console.WriteLine("[ERROR] Short call training schedule failed");
        else
            AssignWorkDays(AllPgy1s, AllPgy3s, shortCallAmt, graph, tCalendar.whatShortDayIsIt);

        BuildWeekendTrainingGraph(Sat24hCallAmt, pgy1, pgy2, AllPgy1s, AllPgy2s, tCalendar.whatSaturdayIsIt, true);
        BuildWeekendTrainingGraph(Sun12hCallAmt, pgy1, pgy2, AllPgy1s, AllPgy2s, tCalendar.whatSundayIsIt, false);

        FixWeekendConflicts(AllPgy1s, AllPgy2s);
        Print(AllPgy1s, AllPgy2s, AllPgy3s);
        Save(AllPgy1s, AllPgy2s, AllPgy3s);
    }
    
    public static void Part1(int year, List<PGY1DTO> AllPgy1s, List<PGY2DTO> AllPgy2s)
    {
        Console.WriteLine("Running Part 1 (July–December)...");
        foreach (var r in AllPgy1s) r.InTraining = false;
        foreach (var r in AllPgy2s) r.InTraining = false;

        foreach (var r in AllPgy1s)
            r.LastTrainingDate = r.WorkDays.Any() ? r.WorkDays.Max() : new DateTime(1, 1, 1);
        
        // ✅ Enable PGY2 training only if their July role allows flex call
        foreach (var pgy2 in AllPgy2s)
        {
            var julyRole = pgy2.RolePerMonth[0]; // July is index 0
            if ((julyRole?.FlexShort ?? false) || (julyRole?.FlexLong ?? false))
            {
                pgy2.InTraining = true;
            }
            
            var augustRole = pgy2.RolePerMonth[1]; // August is index 0
            if ((augustRole?.FlexShort ?? false) || (augustRole?.FlexLong ?? false))
            {
                pgy2.InTraining = true;
            }
        }

        var workedDays = new HashSet<DateTime>(AllPgy1s.SelectMany(r => r.WorkDays).Concat(AllPgy2s.SelectMany(r => r.WorkDays)));
        DateTime start = new DateTime(year, 7, 7);
        DateTime end = new DateTime(year, 12, 31);

        var shiftCounts = CountShiftTypes(start, end, workedDays);
        TryRandomAssignment(AllPgy1s.Cast<ResidentDTO>().ToList(), AllPgy2s.Cast<ResidentDTO>().ToList(), start, end,
            shiftCounts, workedDays);

        // ✅ Reset PGY2 training flag
        foreach (var r in AllPgy2s)
            r.InTraining = false;
        
        Save(AllPgy1s, AllPgy2s, new List<PGY3DTO>());
        Print(AllPgy1s, AllPgy2s, new List<PGY3DTO>());
    }

    public static void Part2(int year, List<PGY1DTO> AllPgy1s, List<PGY2DTO> AllPgy2s)
    {
        Console.WriteLine("Running Part 2 (January–June)...");
        foreach (var r in AllPgy1s) r.InTraining = false;
        foreach (var r in AllPgy2s) r.InTraining = false;

        var workedDays = new HashSet<DateTime>(AllPgy1s.SelectMany(r => r.WorkDays).Concat(AllPgy2s.SelectMany(r => r.WorkDays)));
        DateTime start = new DateTime(year + 1, 1, 1);
        DateTime end = new DateTime(year + 1, 6, 30);

        var shiftCounts = CountShiftTypes(start, end, workedDays);
        TryRandomAssignment(AllPgy1s.Cast<ResidentDTO>().ToList(), AllPgy2s.Cast<ResidentDTO>().ToList(), start, end,
            shiftCounts, workedDays);

        Save(AllPgy1s, AllPgy2s, new List<PGY3DTO>());
        Print(AllPgy1s, AllPgy2s, new List<PGY3DTO>());
    }
    
    
    public static bool TryRandomAssignment(List<ResidentDTO> pgy1s, List<ResidentDTO> pgy2s, DateTime startDay, DateTime endDay, Dictionary<int, int> shiftTypeCount, HashSet<DateTime> workedDays, int maxAttempts = 100)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            Console.WriteLine($"[INFO] Attempt {attempt} to generate a valid random schedule...");
            if (RandomAssignment(pgy1s, pgy2s, startDay, endDay, shiftTypeCount, workedDays))
            {
                Console.WriteLine("[SUCCESS] Valid schedule generated.");
                return true;
            }
        }

        Console.WriteLine("[ERROR] Too many attempts — unable to generate a valid random schedule.");
        return false;
    }

    public static bool RandomAssignment(List<ResidentDTO> pgy1s, List<ResidentDTO> pgy2s, DateTime startDay, DateTime endDay, Dictionary<int, int> shiftTypeCount, HashSet<DateTime> workedDays)
    {
        Console.WriteLine("Attempting random assignment of shifts...");
        Random rand = new();

        Dictionary<int, int>[] pgy1ShiftCount = pgy1s.Select(_ => new Dictionary<int, int> { [3] = 0, [12] = 0, [24] = 0 }).ToArray();
        Dictionary<int, int>[] pgy2ShiftCount = pgy2s.Select(_ => new Dictionary<int, int> { [3] = 0, [12] = 0, [24] = 0 }).ToArray();

        InitialShiftAssignment(pgy1s, pgy2s, shiftTypeCount, pgy1ShiftCount, pgy2ShiftCount, rand);

        int[] pgy1WorkTime = new int[pgy1s.Count];
        int[] pgy2WorkTime = new int[pgy2s.Count];
        ComputeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);

        while (pgy1WorkTime.Max().CompareTo(pgy1WorkTime.Min()) >= 24 || pgy2WorkTime.Max().CompareTo(pgy2WorkTime.Min()) >= 24)
        {
            SwapSomeShiftCount(pgy1s, pgy2s, pgy1ShiftCount, pgy2ShiftCount, rand, pgy1WorkTime, pgy2WorkTime);
            ComputeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);
        }

        Graph g = new Graph(3 * (pgy1s.Count + pgy2s.Count) + 200 + 2);
        int srcIndex = 3 * (pgy1s.Count + pgy2s.Count) + 200;
        int snkIndex = srcIndex + 1;

        for (int i = 0; i < pgy1s.Count; i++)
            for (int t = 0; t < 3; t++)
                g.addEdge(srcIndex, i * 3 + t, pgy1ShiftCount[i][(t == 0 ? 3 : t == 1 ? 12 : 24)]);

        for (int i = 0; i < pgy2s.Count; i++)
            for (int t = 0; t < 3; t++)
                g.addEdge(srcIndex, (pgy1s.Count + i) * 3 + t, pgy2ShiftCount[i][(t == 0 ? 3 : t == 1 ? 12 : 24)]);

        List<DateTime> dayList = new();
        Dictionary<DateTime, int> shiftCache = new();

        for (DateTime day = startDay; day <= endDay; day = day.AddDays(1))
        {
            if (workedDays.Contains(day)) continue;
            int shift = GetShiftType(day);
            shiftCache[day] = shift;
            int offset = shift == 3 ? 0 : shift == 12 ? 1 : 2;
            int dayIndex = dayList.Count;
            dayList.Add(day);

            var eligiblePgy1 = pgy1s.Select((r, i) => (r, i)).Where(pair => pair.r.CanWork(day) && !WouldCauseBackToBackLongShift(pair.r, day)).ToList();
            var eligiblePgy2 = pgy2s.Select((r, i) => (r, i)).Where(pair => pair.r.CanWork(day) && !WouldCauseBackToBackLongShift(pair.r, day)).ToList();

            if (eligiblePgy1.Count + eligiblePgy2.Count == 0)
            {
                Console.WriteLine($"[FAILURE] No eligible residents for {day:yyyy-MM-dd} ({shift}h)");
            }

            foreach (var (res, i) in eligiblePgy1)
                g.addEdge(i * 3 + offset, (pgy1s.Count + pgy2s.Count) * 3 + dayIndex, 1);

            foreach (var (res, i) in eligiblePgy2)
                g.addEdge((pgy1s.Count + i) * 3 + offset, (pgy1s.Count + pgy2s.Count) * 3 + dayIndex, 1);

            g.addEdge((pgy1s.Count + pgy2s.Count) * 3 + dayIndex, snkIndex, 1);
        }
        
        // REMOVE BEFORE PUSHING
        foreach (var r in pgy2s)
        {
            if (!r.CanWork(new DateTime(2025, 7, 11)))
                Console.WriteLine($"[DEBUG] {r.Name} cannot work 7/11: role={r.RolePerMonth[6]}, inTraining={r.InTraining}");
        }
        
        int flow = g.getFlow(srcIndex, snkIndex);
        Console.WriteLine($"[DEBUG] flow is {flow} out of {dayList.Count}");
        if (flow != dayList.Count)
        {
            Console.WriteLine("[ERROR] Flow failed to cover all required shifts. Schedule invalid.");
            return false;
        }

        for (int i = 0; i < pgy1s.Count; i++)
            for (int t = 0; t < 3; t++)
            {
                var list = (ArrayList)g.adjList[i * 3 + t];
                foreach (Edge edge in list)
                    if (edge.flow() > 0)
                        pgy1s[i].AddWorkDay(dayList[edge.destination - ((pgy1s.Count + pgy2s.Count) * 3)]);
            }

        for (int i = 0; i < pgy2s.Count; i++)
            for (int t = 0; t < 3; t++)
            {
                var list = (ArrayList)g.adjList[(pgy1s.Count + i) * 3 + t];
                foreach (Edge edge in list)
                    if (edge.flow() > 0)
                        pgy2s[i].AddWorkDay(dayList[edge.destination - ((pgy1s.Count + pgy2s.Count) * 3)]);
            }

        FixWeekendConflicts(pgy1s.Cast<PGY1DTO>().ToList(), pgy2s.Cast<PGY2DTO>().ToList());
        return true;
    }
    
    private static bool WouldCauseBackToBackLongShift(ResidentDTO resident, DateTime newDay)
    {
        int newShift = GetShiftType(newDay);
        if (newShift < 12) return false;

        foreach (var day in resident.WorkDays)
        {
            if (Math.Abs((day - newDay).TotalDays) < 2 && GetShiftType(day) >= 12)
            {
                return true;
            }
        }
        return false;
    }
    
    private static void SwapSomeShiftCount(List<ResidentDTO> pgy1s, List<ResidentDTO> pgy2s, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount, Random rand, int[] pgy1WorkTime, int[] pgy2WorkTime)
    {
        int total = pgy1s.Count + pgy2s.Count;
        int giverIndex = 0;
        int giveHour = -1;

        for (int i = 0; i < pgy1s.Count; i++)
        {
            if (pgy1WorkTime[i] > giveHour)
            {
                giveHour = pgy1WorkTime[i];
                giverIndex = i;
            }
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            if (pgy2WorkTime[i] > giveHour)
            {
                giveHour = pgy2WorkTime[i];
                giverIndex = i + pgy1s.Count;
            }
        }

        int receiverIndex = rand.Next(total);
        int receiveHour = receiverIndex < pgy1s.Count ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];
        while (giveHour <= receiveHour + 24)
        {
            receiverIndex = rand.Next(total);
            receiveHour = receiverIndex < pgy1s.Count ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];
        }

        int shiftType = new[] { 3, 12, 24 }[rand.Next(3)];
        var giverArray = giverIndex < pgy1s.Count ? pgy1ShiftCount : pgy2ShiftCount;
        var receiverArray = receiverIndex < pgy1s.Count ? pgy1ShiftCount : pgy2ShiftCount;
        int gIdx = giverIndex < pgy1s.Count ? giverIndex : giverIndex - pgy1s.Count;
        int rIdx = receiverIndex < pgy1s.Count ? receiverIndex : receiverIndex - pgy1s.Count;

        if (giverArray[gIdx].TryGetValue(shiftType, out var amount) && amount > 0)
        {
            giverArray[gIdx][shiftType]--;
            if (!receiverArray[rIdx].ContainsKey(shiftType))
                receiverArray[rIdx][shiftType] = 0;
            receiverArray[rIdx][shiftType]++;
        }
    }


    private static void InitialShiftAssignment(List<ResidentDTO> pgy1s, List<ResidentDTO> pgy2s, Dictionary<int, int> shiftTypeCount, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount, Random rand)
    {
        foreach (var (shift, count) in shiftTypeCount)
        {
            for (int i = 0; i < count; i++)
            {
                if (rand.NextDouble() < 0.5)
                {
                    int idx = rand.Next(pgy1s.Count);
                    pgy1ShiftCount[idx][shift]++;
                }
                else
                {
                    int idx = rand.Next(pgy2s.Count);
                    pgy2ShiftCount[idx][shift]++;
                }
            }
        }
    }
    
    private static void ComputeWorkTime(List<ResidentDTO> pgy1s, List<ResidentDTO> pgy2s, int[] pgy1WorkTime, int[] pgy2WorkTime, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount)
    {
        for (int i = 0; i < pgy1s.Count; i++)
        {
            pgy1WorkTime[i] = pgy1s[i].WorkDays.Sum(d => GetShiftType(d)) + pgy1ShiftCount[i].Sum(kv => kv.Key * kv.Value);
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            pgy2WorkTime[i] = pgy2s[i].WorkDays.Sum(d => GetShiftType(d)) + pgy2ShiftCount[i].Sum(kv => kv.Key * kv.Value);
        }
    }
    
    private static Dictionary<int, int> CountShiftTypes(DateTime start, DateTime end, HashSet<DateTime> excludeDays)
    {
        Dictionary<int, int> shiftTypeCount = new();
        for (DateTime cur = start; cur <= end; cur = cur.AddDays(1))
        {
            if (excludeDays.Contains(cur)) continue;
            int shift = GetShiftType(cur);
            if (!shiftTypeCount.ContainsKey(shift))
                shiftTypeCount[shift] = 0;
            shiftTypeCount[shift]++;
        }
        return shiftTypeCount;
    }

    private static void BuildWeekendTrainingGraph(
        int callAmt,
        int pgy1,
        int pgy2,
        List<PGY1DTO> AllPgy1s,
        List<PGY2DTO> AllPgy2s,
        Func<int, DateTime> getDay,
        bool isSaturday)
    {
        int nodeAmt = callAmt * 2 + pgy2 + pgy1 + 2;
        int source = nodeAmt - 2;
        int sink = nodeAmt - 1;
        Graph graph = new Graph(nodeAmt);

        for (int i = 0; i < pgy1; i++)
            graph.addEdge(source, callAmt * 2 + pgy2 + i, 1);

        for (int i = 0; i < pgy1; i++)
        {
            for (int j = 0; j < callAmt; j++)
            {
                var day = getDay(j);
                int monthIndex = (day.Month + 5) % 12;
                var role = AllPgy1s[i].RolePerMonth[monthIndex];
                if (role == null || (!role.DoesLong && !role.FlexLong)) continue;
                graph.addEdge(callAmt * 2 + pgy2 + i, j * 2, 1);
            }
        }

        for (int i = 0; i < callAmt; i++)
            graph.addEdge(i * 2, i * 2 + 1, 1);

        for (int i = 0; i < pgy2; i++)
        {
            for (int j = 0; j < callAmt; j++)
            {
                var day = getDay(j);
                int monthIndex = (day.Month + 5) % 12;
                var role = AllPgy2s[i].RolePerMonth[monthIndex];
                if (role == null || (!role.DoesLong && !role.FlexLong)) continue;
                graph.addEdge(j * 2 + 1, callAmt * 2 + i, 1);
            }
        }

        int cap = (pgy1 + pgy2 - 1) / pgy2;
        for (int i = 0; i < pgy2; i++)
            graph.addEdge(callAmt * 2 + i, sink, cap);

        if (graph.getFlow(source, sink) != pgy1)
            Console.WriteLine($"[ERROR] {(isSaturday ? "Saturday" : "Sunday")} call training failed");
        else
            AssignWorkDays(AllPgy1s, AllPgy2s, callAmt, graph, getDay);
    }

    private static void AssignWorkDays<T1, T2>(List<T1> groupA, List<T2> groupB, int callAmt, Graph graph, Func<int, DateTime> getDay)
        where T1 : ResidentDTO
        where T2 : ResidentDTO
    {
        for (int i = 0; i < groupA.Count; i++)
        {
            var list = (ArrayList)graph.adjList[callAmt * 2 + groupB.Count + i];
            foreach (Edge edge in list)
                if (edge.flow() > 0)
                    groupA[i].AddWorkDay(getDay(edge.destination / 2));
        }

        for (int i = 0; i < groupB.Count; i++)
        {
            var list = (ArrayList)graph.adjList[callAmt * 2 + i];
            foreach (Edge edge in list)
                if (edge.flow() < 0)
                    groupB[i].AddWorkDay(getDay(edge.destination / 2));
        }
    }

    public static List<Dates> GenerateDateRecords(Guid scheduleId, List<PGY1DTO> pgy1s, List<PGY2DTO> pgy2s, List<PGY3DTO> pgy3s)
    {
        var result = new List<Dates>();
        foreach (var res in pgy1s.Cast<ResidentDTO>().Concat(pgy2s).Concat(pgy3s))
        {
            foreach (var date in res.WorkDays)
            {
                result.Add(new Dates
                {
                    DateId = Guid.NewGuid(),
                    ResidentId = res.ResidentId,
                    Date = date,
                    CallType = GetShiftType(date) switch
                    {
                        24 => "Saturday",
                        12 => "Sunday",
                        _ => "ShortCall"
                    },
                    ScheduleId = scheduleId
                });
            }
        }
        return result;
    }
    
    private static void FixWeekendConflicts(List<PGY1DTO> pgy1s, List<PGY2DTO> pgy2s)
    {
        
        var allResidents = pgy1s.Cast<ResidentDTO>().Concat(pgy2s).ToList();

        foreach (var res in allResidents)
        {
            DateTime firstDay = res.FirstWorkDay();
            DateTime lastDay = res.LastWorkDay();

            for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
            {
                if (res.IsWorking(curDay) && !res.CanWork(curDay) && !res.CommitedWorkDay(curDay))
                {
                    bool swapped = false;

                    foreach (var peer in allResidents)
                    {
                        if (peer == res) continue;
                        if (!peer.CanWork(curDay)) continue;

                        DateTime peerStart = peer.FirstWorkDay();
                        DateTime peerEnd = peer.LastWorkDay();

                        for (DateTime otherDay = peerStart; otherDay <= peerEnd; otherDay = otherDay.AddDays(1))
                        {
                            if (peer.IsWorking(otherDay) && !peer.CommitedWorkDay(otherDay) &&
                                res.CanWork(otherDay) && GetShiftType(curDay) == GetShiftType(otherDay))
                            {
                                res.RemoveWorkDay(curDay);
                                peer.RemoveWorkDay(otherDay);
                                res.AddWorkDay(otherDay);
                                peer.AddWorkDay(curDay);
                                swapped = true;
                                break;
                            }
                        }

                        if (swapped) break;
                    }

                    if (!swapped)
                    {
                        Console.WriteLine($"[WARNING] Could not resolve weekend conflict for {res.Name} on {curDay:MM/dd/yyyy}");
                    }
                }
            }
        }
    }
    
    public static int GetShiftType(DateTime date)
    {
        return date.DayOfWeek switch
        {
            DayOfWeek.Saturday => 24,
            DayOfWeek.Sunday => 12,
            _ => 3
        };
    }

    private static void Save(List<PGY1DTO> pgy1s, List<PGY2DTO> pgy2s, List<PGY3DTO> pgy3s)
    {
        pgy1s.ForEach(r => r.SaveWorkDays());
        pgy2s.ForEach(r => r.SaveWorkDays());
        pgy3s.ForEach(r => r.SaveWorkDays());
    }

    private static void Print(List<PGY1DTO> pgy1s, List<PGY2DTO> pgy2s, List<PGY3DTO> pgy3s)
    {
        void PrintGroup<T>(List<T> group, string label) where T : ResidentDTO
        {
            foreach (var res in group)
            {
                Console.WriteLine($"{label} {res.Name} works:");
                foreach (var day in res.WorkDays.OrderBy(d => d))
                    Console.WriteLine($"  {day:d} {day.DayOfWeek}");
            }
        }

        PrintGroup(pgy1s, "PGY1");
        PrintGroup(pgy2s, "PGY2");
        PrintGroup(pgy3s, "PGY3");
    }
    
    
}