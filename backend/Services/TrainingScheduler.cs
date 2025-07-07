using MedicalDemo.Models.Calendar;
using MedicalDemo.Utils;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using MedicalDemo.Models.DTO.Scheduling;

namespace MedicalDemo.Services
{
    public static class TrainingScheduler
    {
        public static void Training(
            int year,
            List<PGY1DTO> pgy1s,
            List<PGY2DTO> pgy2s,
            List<PGY3DTO> pgy3s)
        {
            var tCalendar = new TrainingCalendar(year);
            
            // Convert to arrays for compatibility
            PGY1DTO[] pgy1Array = pgy1s.ToArray();
            PGY2DTO[] pgy2Array = pgy2s.ToArray();
            PGY3DTO[] pgy3Array = pgy3s.ToArray();
            
            
            OriginalTraining(year, tCalendar, pgy1Array, pgy2Array, pgy3Array);
        }

        private static void OriginalTraining(
            int year,
            TrainingCalendar tCalendar,
            PGY1DTO[] pgy1s,
            PGY2DTO[] pgy2s,
            PGY3DTO[] pgy3s)
        {
            int pgy1Count = pgy1s.Length;
            int pgy2Count = pgy2s.Length;
            int pgy3Count = pgy3s.Length;
            
            int shortCallAmt = tCalendar.shortCallDaysList.Count;
            int satCallAmt = tCalendar.saturdayCallDaysList.Count;
            int sunCallAmt = tCalendar.sundayCallDaysList.Count;

            // 1. SHORT CALL SCHEDULING (PGY1 + PGY3)
            int nodeAmt = (shortCallAmt * 2) + pgy3Count + pgy1Count + 2;
            int sourceIndex = nodeAmt - 2;
            int sinkIndex = nodeAmt - 1;
            
            Graph shortCallGraph = new Graph(nodeAmt);
            
            // Source to PGY1s
            for (int i = 0; i < pgy1Count; i++)
            {
                shortCallGraph.AddEdge(sourceIndex, (shortCallAmt * 2 + pgy3Count + i), 3);
            }

            // PGY1s to days
            for (int i = 0; i < pgy1Count; i++)
            {
                for (int j = 0; j < shortCallAmt; j++)
                {
                    DateTime day = tCalendar.whatShortDayIsIt(j);
                    int month = day.Month;
                    int monthIndex = (month + 5) % 12; // Same as original logic
                    
                    // Check role constraints
                    if (pgy1s[i].RolePerMonth[monthIndex] == null) continue;
                    
                    bool canWork = month == 7 
                        ? (pgy1s[i].RolePerMonth[0].DoesShort || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[0].FlexShort))
                        : (pgy1s[i].RolePerMonth[1].DoesShort || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[1].FlexShort));
                    
                    if (canWork && pgy1s[i].CanWork(day))
                    {
                        shortCallGraph.AddEdge((shortCallAmt * 2 + pgy3Count + i), 2 * j, 1);
                    }
                }
            }

            // Split nodes
            for (int i = 0; i < shortCallAmt; i++)
            {
                shortCallGraph.AddEdge(2 * i, 2 * i + 1, 1);
            }

            // Days to PGY3s
            for (int i = 0; i < shortCallAmt; i++)
            {
                DateTime day = tCalendar.whatShortDayIsIt(i);
                for (int j = 0; j < pgy3Count; j++)
                {
                    if (pgy3s[j].CanWork(day))
                    {
                        shortCallGraph.AddEdge(2 * i + 1, (shortCallAmt * 2) + j, 1);
                    }
                }
            }

            // PGY3s to sink
            int pgy3Capacity = (3 * pgy1Count + pgy3Count - 1) / pgy3Count;
            for (int i = 0; i < pgy3Count; i++)
            {
                shortCallGraph.AddEdge((shortCallAmt * 2) + i, sinkIndex, pgy3Capacity);
            }

            // Run flow calculation
            int flow = shortCallGraph.GetFlow(sourceIndex, sinkIndex);
            if (flow != 3 * pgy1Count)
            {
                throw new Exception($"Short call scheduling failed. Expected {3 * pgy1Count}, got {flow}");
            }

            // Assign work days from graph results
            for (int i = 0; i < pgy1Count; i++)
            {
                ArrayList curList = (ArrayList)shortCallGraph.adjList[shortCallAmt * 2 + pgy3Count + i];
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)curList[j];
                    if (currEdge.Flow() > 0)
                    {
                        int dayIndex = currEdge.destination / 2;
                        DateTime workDay = tCalendar.whatShortDayIsIt(dayIndex);
                        pgy1s[i].AddWorkDay(workDay);
                    }
                }
            }

            // 2. SATURDAY SCHEDULING (PGY1 + PGY2)
            nodeAmt = (satCallAmt * 2) + pgy2Count + pgy1Count + 2;
            sourceIndex = nodeAmt - 2;
            sinkIndex = nodeAmt - 1;
            
            Graph saturdayGraph = new Graph(nodeAmt);
            
            // Source to PGY1s
            for (int i = 0; i < pgy1Count; i++)
            {
                saturdayGraph.AddEdge(sourceIndex, (satCallAmt * 2 + pgy2Count + i), 1);
            }

            // PGY1s to days
            for (int i = 0; i < pgy1Count; i++)
            {
                for (int j = 0; j < satCallAmt; j++)
                {
                    DateTime day = tCalendar.whatSaturdayIsIt(j);
                    int month = day.Month;
                    int monthIndex = (month + 5) % 12;
                    
                    if (pgy1s[i].RolePerMonth[monthIndex] == null) continue;
                    
                    bool canWork = month == 7
                        ? (pgy1s[i].RolePerMonth[0].DoesLong || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[0].FlexLong))
                        : (pgy1s[i].RolePerMonth[1].DoesLong || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[1].FlexLong));
                    
                    if (canWork && pgy1s[i].CanWork(day))
                    {
                        saturdayGraph.AddEdge((satCallAmt * 2 + pgy2Count + i), 2 * j, 1);
                    }
                }
            }

            // Split nodes
            for (int i = 0; i < satCallAmt; i++)
            {
                saturdayGraph.AddEdge(2 * i, 2 * i + 1, 1);
            }

            // Days to PGY2s
            for (int i = 0; i < satCallAmt; i++)
            {
                DateTime day = tCalendar.whatSaturdayIsIt(i);
                for (int j = 0; j < pgy2Count; j++)
                {
                    int month = day.Month;
                    int monthIndex = (month + 5) % 12;
                    
                    if (pgy2s[j].RolePerMonth[monthIndex] == null) continue;
                    
                    bool canWork = month == 7
                        ? (pgy2s[j].RolePerMonth[0].DoesLong || 
                           (pgy2s[j].InTraining && pgy2s[j].RolePerMonth[0].FlexLong))
                        : (pgy2s[j].RolePerMonth[1].DoesLong || 
                           (pgy2s[j].InTraining && pgy2s[j].RolePerMonth[1].FlexLong));
                    
                    if (canWork && pgy2s[j].CanWork(day))
                    {
                        saturdayGraph.AddEdge(2 * i + 1, (satCallAmt * 2) + j, 1);
                    }
                }
            }

            // PGY2s to sink
            int pgy2Capacity = (pgy1Count + pgy2Count - 1) / pgy2Count;
            for (int i = 0; i < pgy2Count; i++)
            {
                saturdayGraph.AddEdge((satCallAmt * 2) + i, sinkIndex, pgy2Capacity);
            }

            // Run flow calculation
            flow = saturdayGraph.GetFlow(sourceIndex, sinkIndex);
            if (flow != pgy1Count)
            {
                throw new Exception($"Saturday scheduling failed. Expected {pgy1Count}, got {flow}");
            }

            // Assign Saturday work days
            for (int i = 0; i < pgy1Count; i++)
            {
                ArrayList curList = (ArrayList)saturdayGraph.adjList[satCallAmt * 2 + pgy2Count + i];
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)curList[j];
                    if (currEdge.Flow() > 0)
                    {
                        int dayIndex = currEdge.destination / 2;
                        DateTime workDay = tCalendar.whatSaturdayIsIt(dayIndex);
                        pgy1s[i].AddWorkDay(workDay);
                        // Find which PGY2 was assigned
                        ArrayList dayList = (ArrayList)saturdayGraph.adjList[2 * dayIndex + 1];
                        foreach (Edge edge in dayList)
                        {
                            if (edge.Flow() < 0) // Negative flow indicates reverse edge
                            {
                                int pgy2Index = edge.destination - (satCallAmt * 2);
                                if (pgy2Index >= 0 && pgy2Index < pgy2Count)
                                {
                                    pgy2s[pgy2Index].AddWorkDay(workDay);
                                }
                            }
                        }
                    }
                }
            }

            // 3. SUNDAY SCHEDULING (PGY1 + PGY2)
            nodeAmt = (sunCallAmt * 2) + pgy2Count + pgy1Count + 2;
            sourceIndex = nodeAmt - 2;
            sinkIndex = nodeAmt - 1;
            
            Graph sundayGraph = new Graph(nodeAmt);
            
            // Source to PGY1s
            for (int i = 0; i < pgy1Count; i++)
            {
                sundayGraph.AddEdge(sourceIndex, (sunCallAmt * 2 + pgy2Count + i), 1);
            }

            // PGY1s to days
            for (int i = 0; i < pgy1Count; i++)
            {
                for (int j = 0; j < sunCallAmt; j++)
                {
                    DateTime day = tCalendar.whatSundayIsIt(j);
                    int month = day.Month;
                    int monthIndex = (month + 5) % 12;
                    
                    if (pgy1s[i].RolePerMonth[monthIndex] == null) continue;
                    
                    bool canWork = month == 7
                        ? (pgy1s[i].RolePerMonth[0].DoesLong || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[0].FlexLong))
                        : (pgy1s[i].RolePerMonth[1].DoesLong || 
                           (pgy1s[i].InTraining && pgy1s[i].RolePerMonth[1].FlexLong));
                    
                    if (canWork && pgy1s[i].CanWork(day))
                    {
                        sundayGraph.AddEdge((sunCallAmt * 2 + pgy2Count + i), 2 * j, 1);
                    }
                }
            }

            // Split nodes
            for (int i = 0; i < sunCallAmt; i++)
            {
                sundayGraph.AddEdge(2 * i, 2 * i + 1, 1);
            }

            // Days to PGY2s
            for (int i = 0; i < sunCallAmt; i++)
            {
                DateTime day = tCalendar.whatSundayIsIt(i);
                for (int j = 0; j < pgy2Count; j++)
                {
                    int month = day.Month;
                    int monthIndex = (month + 5) % 12;
                    
                    if (pgy2s[j].RolePerMonth[monthIndex] == null) continue;
                    
                    bool canWork = month == 7
                        ? (pgy2s[j].RolePerMonth[0].DoesLong || 
                           (pgy2s[j].InTraining && pgy2s[j].RolePerMonth[0].FlexLong))
                        : (pgy2s[j].RolePerMonth[1].DoesLong || 
                           (pgy2s[j].InTraining && pgy2s[j].RolePerMonth[1].FlexLong));
                    
                    if (canWork && pgy2s[j].CanWork(day))
                    {
                        sundayGraph.AddEdge(2 * i + 1, (sunCallAmt * 2) + j, 1);
                    }
                }
            }

            // PGY2s to sink
            pgy2Capacity = (pgy1Count + pgy2Count - 1) / pgy2Count;
            for (int i = 0; i < pgy2Count; i++)
            {
                sundayGraph.AddEdge((sunCallAmt * 2) + i, sinkIndex, pgy2Capacity);
            }

            // Run flow calculation
            flow = sundayGraph.GetFlow(sourceIndex, sinkIndex);
            if (flow != pgy1Count)
            {
                throw new Exception($"Sunday scheduling failed. Expected {pgy1Count}, got {flow}");
            }

            // Assign Sunday work days
            for (int i = 0; i < pgy1Count; i++)
            {
                ArrayList curList = (ArrayList)sundayGraph.adjList[sunCallAmt * 2 + pgy2Count + i];
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)curList[j];
                    if (currEdge.Flow() > 0)
                    {
                        int dayIndex = currEdge.destination / 2;
                        DateTime workDay = tCalendar.whatSundayIsIt(dayIndex);
                        pgy1s[i].AddWorkDay(workDay);
                        // Find which PGY2 was assigned
                        ArrayList dayList = (ArrayList)sundayGraph.adjList[2 * dayIndex + 1];
                        foreach (Edge edge in dayList)
                        {
                            if (edge.Flow() < 0) // Negative flow indicates reverse edge
                            {
                                int pgy2Index = edge.destination - (sunCallAmt * 2);
                                if (pgy2Index >= 0 && pgy2Index < pgy2Count)
                                {
                                    pgy2s[pgy2Index].AddWorkDay(workDay);
                                }
                            }
                        }
                    }
                }
            }

            // 4. POST-PROCESSING
            FixWeekends1(pgy1s);
            FixWeekends2(pgy2s);
            FixWeekends1and2(pgy1s, pgy2s);
        }

        private static void FixWeekends1(IList<PGY1DTO> pgy1s)
        {
            foreach (var res in pgy1s)
            {
                DateTime firstDay = res.FirstWorkDay();
                DateTime lastDay = res.LastWorkDay();
                
                for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
                {
                    if (res.IsWorking(curDay) && !res.CanWork(curDay) && !res.CommitedWorkDay(curDay))
                    {
                        bool foundSwap = false;
                        
                        // Try to swap with another PGY1
                        foreach (var otherRes in pgy1s)
                        {
                            if (otherRes == res) continue;
                            
                            if (!otherRes.CanWork(curDay)) continue;
                            
                            DateTime otherFirst = otherRes.FirstWorkDay();
                            DateTime otherLast = otherRes.LastWorkDay();
                            
                            for (DateTime otherDay = otherFirst; otherDay <= otherLast; otherDay = otherDay.AddDays(1))
                            {
                                // Check if same shift type and other resident can work on this day
                                if (otherRes.IsWorking(otherDay) && 
                                    GetShiftType(curDay) == GetShiftType(otherDay) &&
                                    res.CanWork(otherDay) && 
                                    otherRes.CanWork(curDay))
                                {
                                    // Perform swap
                                    res.RemoveWorkDay(curDay);
                                    res.AddWorkDay(otherDay);
                                    
                                    otherRes.RemoveWorkDay(otherDay);
                                    otherRes.AddWorkDay(curDay);
                                    
                                    foundSwap = true;
                                    break;
                                }
                            }
                            
                            if (foundSwap) break;
                        }
                        
                        if (!foundSwap)
                        {
                            throw new Exception($"Failed to fix weekend conflict for {res.Name} on {curDay}");
                        }
                    }
                }
            }
        }

        private static void FixWeekends2(IList<PGY2DTO> pgy2s)
        {
            foreach (var res in pgy2s)
            {
                DateTime firstDay = res.FirstWorkDay();
                DateTime lastDay = res.LastWorkDay();
                
                for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
                {
                    if (res.IsWorking(curDay) && !res.CanWork(curDay) && !res.CommitedWorkDay(curDay))
                    {
                        bool foundSwap = false;
                        
                        // Try to swap with another PGY2
                        foreach (var otherRes in pgy2s)
                        {
                            if (otherRes == res) continue;
                            
                            if (!otherRes.CanWork(curDay)) continue;
                            
                            DateTime otherFirst = otherRes.FirstWorkDay();
                            DateTime otherLast = otherRes.LastWorkDay();
                            
                            for (DateTime otherDay = otherFirst; otherDay <= otherLast; otherDay = otherDay.AddDays(1))
                            {
                                if (otherRes.IsWorking(otherDay) && 
                                    GetShiftType(curDay) == GetShiftType(otherDay) &&
                                    res.CanWork(otherDay) && 
                                    otherRes.CanWork(curDay))
                                {
                                    // Perform swap
                                    res.RemoveWorkDay(curDay);
                                    res.AddWorkDay(otherDay);
                                    
                                    otherRes.RemoveWorkDay(otherDay);
                                    otherRes.AddWorkDay(curDay);
                                    
                                    foundSwap = true;
                                    break;
                                }
                            }
                            
                            if (foundSwap) break;
                        }
                        
                        if (!foundSwap)
                        {
                            throw new Exception($"Failed to fix weekend conflict for {res.Name} on {curDay}");
                        }
                    }
                }
            }
        }

        private static void FixWeekends1and2(IList<PGY1DTO> pgy1s, IList<PGY2DTO> pgy2s)
        {
            // Cross-level swapping
            foreach (var pgy1 in pgy1s)
            {
                DateTime firstDay = pgy1.FirstWorkDay();
                DateTime lastDay = pgy1.LastWorkDay();
                
                for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
                {
                    if (pgy1.IsWorking(curDay) && !pgy1.CanWork(curDay))
                    {
                        bool foundSwap = false;
                        
                        // Try to swap with a PGY2
                        foreach (var pgy2 in pgy2s)
                        {
                            if (!pgy2.CanWork(curDay)) continue;
                            
                            DateTime otherFirst = pgy2.FirstWorkDay();
                            DateTime otherLast = pgy2.LastWorkDay();
                            
                            for (DateTime otherDay = otherFirst; otherDay <= otherLast; otherDay = otherDay.AddDays(1))
                            {
                                if (pgy2.IsWorking(otherDay) && 
                                    GetShiftType(curDay) == GetShiftType(otherDay) &&
                                    pgy1.CanWork(otherDay) && 
                                    pgy2.CanWork(curDay))
                                {
                                    // Perform swap
                                    pgy1.RemoveWorkDay(curDay);
                                    pgy1.AddWorkDay(otherDay);
                                    
                                    pgy2.RemoveWorkDay(otherDay);
                                    pgy2.AddWorkDay(curDay);
                                    
                                    foundSwap = true;
                                    break;
                                }
                            }
                            
                            if (foundSwap) break;
                        }
                    }
                }
            }
        }

        private static string GetShiftType(DateTime date)
        {
            return date.DayOfWeek switch
            {
                DayOfWeek.Saturday => "24h",
                DayOfWeek.Sunday => "12h",
                _ => "Short"
            };
        }
    }
}