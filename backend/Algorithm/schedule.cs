using System;
using System.Collections.Generic;
using System.Globalization;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using MedicalDemo.Algorithm;
using MedicalDemo.Data.Models;
using MedicalDemo.Models;
using MedicalDemo.Models.DTO.Scheduling; //for array min/max


class Schedule
{
    // === NEW OVERLOAD METHODS FOR BACKEND INTEGRATION ===
    public static void Training(int year, List<PGY1> pgy1s, List<PGY2> pgy2s, List<PGY3> pgy3s)
    {
        ArrayList pgys1 = new ArrayList(pgy1s);
        ArrayList pgys2 = new ArrayList(pgy2s);
        ArrayList pgys3 = new ArrayList(pgy3s);
        Training(year, pgys1, pgys2, pgys3);
    }

    public static void Part1(int year, List<PGY1> pgy1s, List<PGY2> pgy2s)
    {
        ArrayList pgys1 = new ArrayList(pgy1s);
        ArrayList pgys2 = new ArrayList(pgy2s);
        Part1(year, pgys1, pgys2);
    }

    public static void Part2(int year, List<PGY1> pgy1s, List<PGY2> pgy2s)
    {
        ArrayList pgys1 = new ArrayList(pgy1s);
        ArrayList pgys2 = new ArrayList(pgy2s);
        Part2(year, pgys1, pgys2);
    }
    
    public static void Training(int year, ArrayList pgy1s, ArrayList pgy2s, ArrayList pgy3s)
    {
        int pgy1 = 8;
        int pgy2 = 8;
        int pgy3 = 8;
        ArrayList AllPgy1s = pgy1s;
        ArrayList AllPgy2s = pgy2s;
        ArrayList AllPgy3s = pgy3s;
        TrainingCalendar tCalendar = new TrainingCalendar(year);

        int Sat24hCallAmt = tCalendar.dayOfWeekAmt[6]; // how many saturday calls for training
        int Sun12hCallAmt = tCalendar.dayOfWeekAmt[0]; // how many sunday calls
        int shortCallAmt = tCalendar.dayOfWeekAmt[2] + tCalendar.dayOfWeekAmt[3] + tCalendar.dayOfWeekAmt[4]; // t + w + th

        // make sure a pgy1 is with a pgy3 3 times for a short call
        int nodeAmt = (shortCallAmt * 2) /* split node */ + pgy3 + pgy1 + 2 /*source & sink*/; // !!!!node id order!!!!
        int sourceIndex = nodeAmt - 2; // -2 for 0 indexing
        int sinkIndex = nodeAmt - 1;

        Graph shortCallGraph = new Graph(nodeAmt);
        for (int i = 0; i < pgy1; i++)
        {
            shortCallGraph.addEdge(sourceIndex, (shortCallAmt * 2 + pgy3 + i), 3); //source node, pgy1 index, days pgy1s need to work
        }

        for (int i = 0; i < pgy1; i++)
        {
            for (int j = 0; j < shortCallAmt; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                // what month are we in
                int month = (int)(tCalendar.whatShortDayIsIt(j).Month);
                // DEBUG Console.WriteLine(month);

                //are we in july?
                if (month == 7)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].DoesShort == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].FlexShort == false) // if their role doesnt do short calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].DoesShort == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].FlexShort == false)
                    {
                        continue; // same as above
                    }
                }
                shortCallGraph.addEdge((shortCallAmt * 2 + pgy3 + i), 2 * j, 1); //each pgy1 has an edge between them and a training day
            }
        }

        for (int i = 0; i < shortCallAmt; i++)
        {
            shortCallGraph.addEdge(i * 2, (i * 2 + 1), 1); // connecting split nodes.
        }

        for (int i = 0; i < shortCallAmt; i++)
        {
            for (int j = 0; j < pgy3; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                shortCallGraph.addEdge((i * 2 + 1), (shortCallAmt * 2) + j, 1); //each pgy3 can only train once per day
            }
        }

        int estPgy3Training = ((3 * pgy1 + pgy3 - 1) / pgy3); // ceiling division to get capacity amount for sink
        for (int i = 0; i < pgy3; i++)
        {
            shortCallGraph.addEdge((shortCallAmt * 2) + i, sinkIndex, estPgy3Training);
        }

        if (shortCallGraph.getFlow(sourceIndex, sinkIndex) != 3 * pgy1)
        {
            Console.WriteLine("[ERROR] Not able to make valid assignment based on parameters");
        }
        else
        {
            Console.WriteLine("Succesfully created pgy3 weekday training assignment");
            //Console.WriteLine("PGY1 Assignments:");
            for (int i = 0; i < pgy1; i++)
            {
                //Console.WriteLine($" PGY1 #{((PGY1)(AllPgy1s[i])).name}:");
                ArrayList curList = (ArrayList)(shortCallGraph.adjList[(shortCallAmt * 2) + pgy3 + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if flow is leaving the current edge
                    if (currEdge.flow() > 0)
                    {
                        //Console.WriteLine($"  Day {tCalendar.whatShortDayIsIt(currEdge.destination / 2)}");
                        ((PGY1)AllPgy1s[i]).addWorkDay(tCalendar.whatShortDayIsIt(currEdge.destination / 2));
                    }
                }
            }

            //Console.WriteLine("PGY3 Assignments:");
            for (int i = 0; i < pgy3; i++)
            {
                //Console.WriteLine($" PGY3 #{((PGY3)(AllPgy3s[i])).name}");
                ArrayList curList = (ArrayList)(shortCallGraph.adjList[(shortCallAmt * 2) + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if the flow is negative
                    if (currEdge.flow() < 0)
                    {
                        //Console.WriteLine($"  Day {tCalendar.whatShortDayIsIt(currEdge.destination / 2)}");
                        ((PGY3)AllPgy3s[i]).addWorkDay(tCalendar.whatShortDayIsIt(currEdge.destination / 2));
                    }
                }
            }
        }

        // make sure a pgy1 is with a pgy2 on a 24h saturday 
        nodeAmt = (Sat24hCallAmt * 2) /* split node */ + pgy2 + pgy1 + 2 /*source & sink*/; // !!!!node id order!!!!
        sourceIndex = nodeAmt - 2; // -2 for 0 indexing
        sinkIndex = nodeAmt - 1;
        Graph saturdayCallGraph = new Graph(nodeAmt);
        for (int i = 0; i < pgy1; i++)
        {
            saturdayCallGraph.addEdge(sourceIndex, (Sat24hCallAmt * 2 + pgy2 + i), 1); //source node, pgy1 index, days pgy1s need to work
        }

        for (int i = 0; i < pgy1; i++)
        {
            for (int j = 0; j < Sat24hCallAmt; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                // what month are we in
                int month = (int)(tCalendar.whatSaturdayIsIt(j).Month);
                // DEBUG Console.WriteLine(month);

                //are we in july?
                if (month == 7)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].DoesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].FlexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].DoesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].FlexLong == false)
                    {
                        continue; // same as above
                    }
                }
                saturdayCallGraph.addEdge((Sat24hCallAmt * 2 + pgy2 + i), 2 * j, 1); //each pgy1 has an edge between them and a training day
            }
        }

        for (int i = 0; i < Sat24hCallAmt; i++)
        {
            saturdayCallGraph.addEdge(i * 2, (i * 2 + 1), 1); // connecting split nodes.
        }

        for (int i = 0; i < pgy2; i++)
        {
            for (int j = 0; j < Sat24hCallAmt; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                // what month are we in
                int month = (int)(tCalendar.whatSaturdayIsIt(j).Month);
                // DEBUG Console.WriteLine(month);

                //are we in july?
                if (month == 7)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[0].DoesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[0].FlexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[1].DoesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[1].FlexLong == false)
                    {
                        continue; // same as above
                    }
                }
                saturdayCallGraph.addEdge(2 * i + 1, (Sat24hCallAmt * 2) + j, 1); //each pgy2 can only train once per day
                //source node, pgy2 index, days pgy1s need to work
            }
        }
        int estPgy2Training = ((pgy1 + pgy2 - 1) / pgy2); // ceiling division to get capacity amount for sink
        for (int i = 0; i < pgy2; i++)
        {
            saturdayCallGraph.addEdge((Sat24hCallAmt * 2) + i, sinkIndex, estPgy2Training);
        }
        int flow = saturdayCallGraph.getFlow(sourceIndex, sinkIndex);
        //Console.WriteLine($"The flow is {flow}");
        //Console.WriteLine($"The number of pgy1 is {pgy1}");
        if (flow != 1 * pgy1)
        {
            Console.WriteLine("[ERROR] Not able to make valid assignment based on parameters");
        }
        else
        {
            Console.WriteLine("Succesfully created PGY2 saturday training assignment");
            //Console.WriteLine("PGY1 Assignments:");
            for (int i = 0; i < pgy1; i++)
            {
                //Console.WriteLine($" PGY1 #{((PGY1)(AllPgy1s[i])).name}:");
                ArrayList curList = (ArrayList)(saturdayCallGraph.adjList[(Sat24hCallAmt * 2) + pgy2 + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if flow is leaving the current edge
                    if (currEdge.flow() > 0)
                    {
                        ((PGY1)AllPgy1s[i]).addWorkDay(tCalendar.whatSaturdayIsIt(currEdge.destination / 2));
                        //Console.WriteLine($"  Day {tCalendar.whatSaturdayIsIt(currEdge.destination / 2)}");
                    }
                }
            }

            //Console.WriteLine("PGY2 Assignments:");
            for (int i = 0; i < pgy2; i++)
            {
                //Console.WriteLine($" PGY2 #{((PGY2)(AllPgy2s[i])).name}");
                ArrayList curList = (ArrayList)(saturdayCallGraph.adjList[(Sat24hCallAmt * 2) + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if the flow is negative
                    if (currEdge.flow() < 0)
                    {
                        ((PGY2)AllPgy2s[i]).addWorkDay(tCalendar.whatSaturdayIsIt(currEdge.destination / 2));
                        //Console.WriteLine($"  Day {tCalendar.whatSaturdayIsIt(currEdge.destination / 2)}");
                    }
                }
            }

        }

        // make sure a pgy1 is with a pgy2 on a 12h sunday
        nodeAmt = (Sun12hCallAmt * 2) /* split node */ + pgy2 + pgy1 + 2 /*source & sink*/; // !!!!node id order!!!!
        sourceIndex = nodeAmt - 2; // -2 for 0 indexing
        sinkIndex = nodeAmt - 1;
        Graph sundaysCallGraph = new Graph(nodeAmt);

        for (int i = 0; i < pgy1; i++)
        {
            sundaysCallGraph.addEdge(sourceIndex, (Sun12hCallAmt * 2 + pgy2 + i), 1); //source node, pgy1 index, days pgy1s need to work
        }

        for (int i = 0; i < pgy1; i++)
        {
            for (int j = 0; j < Sun12hCallAmt; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                // what month are we in
                int month = (int)(tCalendar.whatSundayIsIt(j).Month);
                // DEBUG Console.WriteLine(month);

                //are we in july?
                if (month == 7)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].DoesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].FlexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].DoesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].FlexLong == false)
                    {
                        continue; // same as above
                    }
                }
                sundaysCallGraph.addEdge((Sun12hCallAmt * 2 + pgy2 + i), 2 * j, 1); //each pgy1 has an edge between them and a training day
            }
        }

        for (int i = 0; i < Sun12hCallAmt; i++)
        {
            sundaysCallGraph.addEdge(i * 2, (i * 2 + 1), 1); // connecting split nodes. OTHERWISE THERE WOULD BE 0 FLOW IN THE GRAPH
        }

        for (int i = 0; i < pgy2; i++)
        {
            for (int j = 0; j < Sun12hCallAmt; j++) // TO DO: THIS IS WHERE VACATION TIME WILL GO!!!!
            {
                // what month are we in
                int month = (int)(tCalendar.whatSundayIsIt(j).Month);
                // DEBUG Console.WriteLine(month);

                //are we in july?
                if (month == 7)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[0].DoesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[0].FlexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[1].DoesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[1].FlexLong == false)
                    {
                        continue; // same as above
                    }
                }
                sundaysCallGraph.addEdge(2 * i + 1, (Sun12hCallAmt * 2) + j, 1); //each pgy2 can only train once per day
                //source node, pgy2 index, days pgy1s need to work
            }
        }
        //int estPgy2Training = ((pgy1+pgy2-1)/pgy2); // ceiling division to get capacity amount (estimated amount of time pgy2 must train someone) for sink
        for (int i = 0; i < pgy2; i++)
        {
            sundaysCallGraph.addEdge((Sun12hCallAmt * 2) + i, sinkIndex, estPgy2Training);
        }

        if (sundaysCallGraph.getFlow(sourceIndex, sinkIndex) != 1 * pgy1)
        {
            Console.WriteLine("[ERROR] Not able to make valid assignment based on parameters");
        }
        else
        {
            Console.WriteLine("Succesfully created PGY2 sunday training assignment");
            for (int i = 0; i < pgy1; i++)
            {
                ArrayList curList = (ArrayList)(sundaysCallGraph.adjList[(Sun12hCallAmt * 2) + pgy2 + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if flow is leaving the current edge
                    if (currEdge.flow() > 0)
                    {
                        ((PGY1)AllPgy1s[i]).addWorkDay(tCalendar.whatSundayIsIt(currEdge.destination / 2));
                    }
                }
            }
            for (int i = 0; i < pgy2; i++)
            {
                ArrayList curList = (ArrayList)(sundaysCallGraph.adjList[(Sun12hCallAmt * 2) + i]);
                for (int j = 0; j < curList.Count; j++)
                {
                    Edge currEdge = (Edge)(curList[j]);
                    // check if the flow is negative
                    if (currEdge.flow() < 0)
                    {
                        ((PGY2)AllPgy2s[i]).addWorkDay(tCalendar.whatSundayIsIt(currEdge.destination / 2));
                    }
                }
            }

        }

        // fix the weekends post schedule generation
        FixWeekends1(AllPgy1s);
        FixWeekends2(AllPgy2s);

        // debug print for verification
        print(AllPgy1s, AllPgy2s, AllPgy3s);

        // save content
        save(AllPgy1s, AllPgy2s, AllPgy3s);
    }

    public static void save(ArrayList pgy1s, ArrayList pgy2s, ArrayList pgy3s)
    {
        // save the work days of each resident to a file
        foreach (PGY1 res in pgy1s)
        {
            res.saveWorkDays();
        }
        foreach (PGY2 res in pgy2s)
        {
            res.saveWorkDays();
        }
        foreach (PGY3 res in pgy3s)
        {
            res.saveWorkDays();
        }
    }

    public static void print(ArrayList pgy1s, ArrayList pgy2s, ArrayList pgy3s)
    {
        foreach (PGY1 res in pgy1s)
        {
            Console.WriteLine($"PGY1 {res.name} works:");
            // print all their work days in sorted order
            ArrayList workedDays = new ArrayList();
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }

            // sort the worked days array list
            workedDays.Sort();

            foreach (DateTime curDay in workedDays)
            {
                Console.WriteLine($"  {curDay} {curDay.DayOfWeek}");
            }
        }
        foreach (PGY2 res in pgy2s)
        {
            Console.WriteLine($"PGY2 {res.name} works:");
            // print all their work days in sorted order
            ArrayList workedDays = new ArrayList();
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }

            // sort the worked days array list
            workedDays.Sort();

            foreach (DateTime curDay in workedDays)
            {
                Console.WriteLine($"  {curDay} {curDay.DayOfWeek}");
            }
        }
        foreach (PGY3 res in pgy3s)
        {
            Console.WriteLine($"PGY3 {res.name} works:");
            // print all their work days in sorted order
            ArrayList workedDays = new ArrayList();
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }

            // sort the worked days array list
            workedDays.Sort();

            foreach (DateTime curDay in workedDays)
            {
                Console.WriteLine($"  {curDay} {curDay.DayOfWeek}");
            }
        }
    }

    public static void Part2(int year, ArrayList pgy1s, ArrayList pgy2s)
    {
        Console.WriteLine("part 2: normal schedule (january through june)");
        int pgy1 = 8;
        int pgy2 = 8;
        ArrayList AllPgy1s = pgy1s;
        ArrayList AllPgy2s = pgy2s;

        // store days currently worked by anyone
        HashSet<DateTime> workedDays = new HashSet<DateTime>();
        foreach (PGY1 res in AllPgy1s)
        {
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }
        }
        foreach (PGY2 res in AllPgy2s)
        {
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }
        }

        DateTime startDay = new DateTime(year+1, 1, 1);
        DateTime endDay = new DateTime(year+1, 6, 30);

        // compute how many days of each shift type there are
        Dictionary<int, int> shiftTypeCount = new Dictionary<int, int>();
        for (DateTime curDay = startDay; curDay <= endDay; curDay = curDay.AddDays(1))
        {
            // check that no one works that day
            if (workedDays.Contains(curDay))
            {
                continue; // skip this day if someone already works it
            }

            int shiftTypeValue = shiftType(curDay);
            if (!shiftTypeCount.ContainsKey(shiftTypeValue))
            {
                shiftTypeCount[shiftTypeValue] = 0; // initialize the count for this shift
            }
            shiftTypeCount[shiftTypeValue]++; // increment the count for this shift type
        }

        // randomly assign shifts until one works
        while (!randomAssignment(AllPgy1s, AllPgy2s, startDay, endDay, shiftTypeCount, workedDays)) ;

        // save (and commit)
        save(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
        Console.WriteLine("Part 2 completed successfully.");

        // Print
        print(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
    }

    public static void Part1(int year, ArrayList pgy1s, ArrayList pgy2s)
    {
        Console.WriteLine("part 1: normal schedule (july through december)");
        int pgy1 = 8;
        int pgy2 = 8;
        ArrayList AllPgy1s = pgy1s;
        ArrayList AllPgy2s = pgy2s;

        // store days currently worked by anyone
        HashSet<DateTime> workedDays = new HashSet<DateTime>();
        foreach (PGY1 res in AllPgy1s)
        {
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }
        }
        foreach (PGY2 res in AllPgy2s)
        {
            foreach (DateTime curDay in res.workDaySet())
            {
                workedDays.Add(curDay);
            }
        }

        DateTime startDay = new DateTime(year, 7, 7);
        DateTime endDay = new DateTime(year, 12, 31);

        // compute how many days of each shift type there are
        Dictionary<int, int> shiftTypeCount = new Dictionary<int, int>();
        for (DateTime curDay = startDay; curDay <= endDay; curDay = curDay.AddDays(1))
        {
            // check that no one works that day
            if (workedDays.Contains(curDay))
            {
                continue; // skip this day if someone already works it
            }

            int shiftTypeValue = shiftType(curDay);
            if (!shiftTypeCount.ContainsKey(shiftTypeValue))
            {
                shiftTypeCount[shiftTypeValue] = 0; // initialize the count for this shift
            }
            shiftTypeCount[shiftTypeValue]++; // increment the count for this shift type
        }

        // randomly assign shifts until one works
        while (!randomAssignment(AllPgy1s, AllPgy2s, startDay, endDay, shiftTypeCount, workedDays)) ;

        // save (and commit)
        save(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
        Console.WriteLine("Part 1 completed successfully.");

        // Print
        print(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
    }
    
    public static void computeWorkTime(ArrayList pgy1s, ArrayList pgy2s, int[] pgy1WorkTime, int[] pgy2WorkTime, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount)
    {
        for (int i = 0; i < pgy1s.Count; i++)
        {
            pgy1WorkTime[i] = 0;
            PGY1 res = (PGY1)pgy1s[i];
            foreach (DateTime workDay in res.workDaySet())
            {
                pgy1WorkTime[i] += shiftType(workDay); // add the shift type time to the work time
            }
            foreach (int shift in pgy1ShiftCount[i].Keys)
            {
                pgy1WorkTime[i] += shift * pgy1ShiftCount[i][shift]; // add the assigned shifts to the work time
            }
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            pgy2WorkTime[i] = 0;
            PGY2 res = (PGY2)pgy2s[i];
            foreach (DateTime workDay in res.workDaySet())
            {
                pgy2WorkTime[i] += shiftType(workDay); // add the shift type time to the work time
            }
            foreach (int shift in pgy2ShiftCount[i].Keys)
            {
                pgy2WorkTime[i] += shift * pgy2ShiftCount[i][shift]; // add the assigned shifts to the work time
            }
        }
    }

    public static void initialShiftAssignment(ArrayList pgy1s, ArrayList pgy2s, DateTime startDay, DateTime endDay, Dictionary<int, int> shiftTypeCount, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount, Random rand)
    {
        foreach (int shift in shiftTypeCount.Keys)
        {
            for (int i = 0; i < shiftTypeCount[shift]; i++)
            {
                // randomly select a pgy1 or pgy2 to assign the shift to
                if (rand.NextDouble() < 0.5) // 50% chance to assign to pgy1
                {
                    int pgy1Index = rand.Next(pgy1s.Count);
                    if (!pgy1ShiftCount[pgy1Index].ContainsKey(shift))
                    {
                        pgy1ShiftCount[pgy1Index][shift] = 0; // initialize the count for this shift type
                    }
                    pgy1ShiftCount[pgy1Index][shift] += 1; // increment the count for this shift type
                }
                else // assign to pgy2
                {
                    int pgy2Index = rand.Next(pgy2s.Count);
                    if (!pgy2ShiftCount[pgy2Index].ContainsKey(shift))
                    {
                        pgy2ShiftCount[pgy2Index][shift] = 0; // initialize the count for this shift type
                    }
                    pgy2ShiftCount[pgy2Index][shift] += 1;
                }
            }
        }
    }

    public static void swapSomeShiftCount(ArrayList pgy1s, ArrayList pgy2s, Dictionary<int, int>[] pgy1ShiftCount, Dictionary<int, int>[] pgy2ShiftCount, Random rand, int[] pgy1WorkTime, int[] pgy2WorkTime)
    {
        // Find the person who worked the most
        int giverIndex = 0;
        int giveHour = -1;
        for (int i = 0; i < pgy1s.Count; i++)
        {
            if (giveHour < pgy1WorkTime[i])
            {
                giveHour = pgy1WorkTime[i];
                giverIndex = i;
            }
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            if (giveHour < pgy2WorkTime[i])
            {
                giveHour = pgy2WorkTime[i];
                giverIndex = i + pgy1s.Count;
            }
        }

        // choose a random giving resident and a random receiving resident
        int receiverIndex = rand.Next(pgy1s.Count + pgy2s.Count);

        // check that giver and receiver are not the same AND that giver works more than receiver
        int receiveHour = (receiverIndex < pgy1s.Count) ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];
        while (giveHour <= receiveHour + 24)
        {
            receiverIndex = rand.Next(pgy1s.Count + pgy2s.Count);
            
            
            receiveHour = (receiverIndex < pgy1s.Count) ? pgy1WorkTime[receiverIndex] : pgy2WorkTime[receiverIndex - pgy1s.Count];
        }

        
        // iterate until we a shift to give
        while (true)
        {
            // determine a shift type to give
            int shiftType = rand.Next(0, 3); // shift types are 3, 12, and 24 hours
            shiftType = (shiftType == 0) ? 3 : (shiftType == 1) ? 12 : 24; // convert to actual shift type
                                                                           // check if the giver has this shift type
                                                                           // determine if giver has this shift type
            if (giverIndex < pgy1s.Count) // giver is a pgy1
            {
                if (pgy1ShiftCount[giverIndex].ContainsKey(shiftType) && pgy1ShiftCount[giverIndex][shiftType] > 0)
                {
                    // Give it
                    pgy1ShiftCount[giverIndex][shiftType]--;

                    // Receive it
                    if (receiverIndex < pgy1s.Count) // receiver is a pgy1
                    {
                        if (pgy1ShiftCount[receiverIndex].ContainsKey(shiftType))
                        {
                            pgy1ShiftCount[receiverIndex][shiftType]++;
                        }
                        else
                        {
                            pgy1ShiftCount[receiverIndex][shiftType] = 1; // initialize the count for this shift type
                        }
                    }
                    else // receiver is a pgy2
                    {
                        if (pgy2ShiftCount[receiverIndex - pgy1s.Count].ContainsKey(shiftType))
                        {
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType]++;
                        }
                        else
                        {
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType] = 1; // initialize the count for this shift type
                        }
                    }
                    return; // exit the loop after a successful swap
                }
            }
            else // giver is a pgy2
            {
                if (pgy2ShiftCount[giverIndex - pgy1s.Count].ContainsKey(shiftType) && pgy2ShiftCount[giverIndex - pgy1s.Count][shiftType] > 0)
                {
                    // Give it
                    pgy2ShiftCount[giverIndex - pgy1s.Count][shiftType]--;

                    // Receive it
                    if (receiverIndex < pgy1s.Count) // receiver is a pgy1
                    {
                        if (pgy1ShiftCount[receiverIndex].ContainsKey(shiftType))
                        {
                            pgy1ShiftCount[receiverIndex][shiftType]++;
                        }
                        else
                        {
                            pgy1ShiftCount[receiverIndex][shiftType] = 1; // initialize the count for this shift type
                        }
                    }
                    else // receiver is a pgy2
                    {
                        if (pgy2ShiftCount[receiverIndex - pgy1s.Count].ContainsKey(shiftType))
                        {
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType]++;
                        }
                        else
                        {
                            pgy2ShiftCount[receiverIndex - pgy1s.Count][shiftType] = 1; // initialize the count for this shift type
                        }
                    }
                    return; // exit the loop after a successful swap
                }
            }
        }
    }

    public static bool randomAssignment(ArrayList pgy1s, ArrayList pgy2s, DateTime startDay, DateTime endDay, Dictionary<int, int> shiftTypeCount, HashSet<DateTime> workedDays)
    {
        Console.WriteLine("Attempting random assignment of shifts...");

        // create an random number generator
        int seed = (int)DateTime.Now.Ticks;
        Random rand = new Random(seed);

        // track how many shifts of each type are given to each resident
        Dictionary<int, int>[] pgy1ShiftCount = new Dictionary<int, int>[pgy1s.Count];
        Dictionary<int, int>[] pgy2ShiftCount = new Dictionary<int, int>[pgy2s.Count];
        for (int i = 0; i < pgy1s.Count; i++)
        {
            pgy1ShiftCount[i] = new Dictionary<int, int>();
            pgy1ShiftCount[i][3] = 0;
            pgy1ShiftCount[i][12] = 0;
            pgy1ShiftCount[i][24] = 0;
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            pgy2ShiftCount[i] = new Dictionary<int, int>();
            pgy2ShiftCount[i][3] = 0;
            pgy2ShiftCount[i][12] = 0;
            pgy2ShiftCount[i][24] = 0;
        }

        // iterate through all the shift types and assign them to residents randomly
        initialShiftAssignment(pgy1s, pgy2s, startDay, endDay, shiftTypeCount, pgy1ShiftCount, pgy2ShiftCount, rand);

        // compute work time for each resident
        int[] pgy1WorkTime = new int[pgy1s.Count];
        int[] pgy2WorkTime = new int[pgy2s.Count];
        computeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);

        // loop until within 24-hour window
        bool inWindow = false;
        while (!inWindow)
        {
            // determine maximum and minimum work time for pgy1 and pgy2
            int max = Math.Max(pgy1WorkTime.Max(), pgy2WorkTime.Max());
            int min = Math.Min(pgy1WorkTime.Min(), pgy2WorkTime.Min());

            // check if the difference is within 24 hours
            if (max - min <= 24)
            {
                inWindow = true; // if so, we are done
            }
            else
            {
                // swap a shift count between two residents
                swapSomeShiftCount(pgy1s, pgy2s, pgy1ShiftCount, pgy2ShiftCount, rand, pgy1WorkTime, pgy2WorkTime);

                // recompute work time for each resident
                computeWorkTime(pgy1s, pgy2s, pgy1WorkTime, pgy2WorkTime, pgy1ShiftCount, pgy2ShiftCount);
            }
        }

        Console.WriteLine("Found a valid assignment within 24-hour window.");

        // use flow to see if the assignment is possible

        // only need nodes for each resident(pgy1+pgy2) for each shit type(3) and for each day (#days in range)
        Graph g = new Graph(3*(pgy1s.Count + pgy2s.Count) + 200 + 2);
        int srcIndex = 3 * (pgy1s.Count + pgy2s.Count) + 200;
        int snkIndex = srcIndex + 1;

        // make an edge from the source to each residents shift type with capacity based on the chosen shifts to work
        for (int i = 0; i < pgy1s.Count; i++)
        {
            for (int type = 0; type < 3; type++)
            {
                int shiftDuration = (type == 0) ? 3 : (type == 1) ? 12 : 24;
                g.addEdge(srcIndex, i * 3 + type, pgy1ShiftCount[i][shiftDuration]);
            }
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            for (int type = 0; type < 3; type++)
            {
                int shiftDuration = (type == 0) ? 3 : (type == 1) ? 12 : 24;
                g.addEdge(srcIndex, (pgy1s.Count + i) * 3 + type, pgy2ShiftCount[i][shiftDuration]);
            }
        }

        ArrayList dayList = new ArrayList();

        // iterate through each day
        for (DateTime curDay = startDay; curDay <= endDay; curDay = curDay.AddDays(1))
        {
            // skip if worked already
            if (workedDays.Contains(curDay))
            {
                continue; // skip this day if someone already works it
            }
            dayList.Add(curDay);

            // check the shift type and connect accordingly
            int shiftTypeValue = shiftType(curDay);

            // get the node index offset based on the shift type
            int nodeIndexOffset = (shiftTypeValue == 3) ? 0 : (shiftTypeValue == 12) ? 1 : 2;

            // add edges from each resident's shift type to the day's node
            for (int i = 0; i < pgy1s.Count; i++)
            {
                if (((PGY1)pgy1s[i]).canWork(curDay))
                {
                    g.addEdge(i * 3 + nodeIndexOffset, (pgy1s.Count + pgy2s.Count) * 3 + dayList.Count - 1, 1);
                }
            }
            for (int i = 0; i < pgy2s.Count; i++)
            {
                if (((PGY2)pgy2s[i]).canWork(curDay))
                {
                    g.addEdge((i + pgy1s.Count) * 3 + nodeIndexOffset, (pgy1s.Count + pgy2s.Count) * 3 + dayList.Count - 1, 1);
                }
            }

            // Connect the day to the sink
            g.addEdge((pgy1s.Count + pgy2s.Count) * 3 + dayList.Count - 1, snkIndex, 1);
        }

        // run flow
        int flow = g.getFlow(srcIndex, snkIndex);
        Console.WriteLine($"[DEBUG] flow is {flow} out of {dayList.Count}");
        if (flow != dayList.Count)
        {
            Console.WriteLine("[ERROR] Not able to make valid assignment based on parameters");
            return false; // assignment failed
        }


        Console.WriteLine($"[DEBUG] adding worked days");
        // add worked days
        for (int i = 0; i < pgy1s.Count; i++)
        {
            for (int type = 0; type < 3; type++)
            {
                int shiftDuration = (type == 0) ? 3 : (type == 1) ? 12 : 24;
                ArrayList curList = (ArrayList)(g.adjList[i * 3 + type]);
                foreach (Edge edge in curList)
                {
                    if (edge.flow() > 0) // if the flow is positive, this resident works this day
                    {
                        DateTime workDay = (DateTime)dayList[edge.destination - ((pgy1s.Count + pgy2s.Count) * 3)];
                        ((PGY1)pgy1s[i]).addWorkDay(workDay);
                    }
                }
            }
        }
        for (int i = 0; i < pgy2s.Count; i++)
        {
            for (int type = 0; type < 3; type++)
            {
                int shiftDuration = (type == 0) ? 3 : (type == 1) ? 12 : 24;
                ArrayList curList = (ArrayList)(g.adjList[(pgy1s.Count + i) * 3 + type]);
                foreach (Edge edge in curList)
                {
                    if(edge.flow() > 0) // if the flow is positive, this resident works this day
                    {
                        DateTime workDay = (DateTime)dayList[edge.destination - ((pgy1s.Count + pgy2s.Count) * 3)];
                        ((PGY2)pgy2s[i]).addWorkDay(workDay);
                    }
                }
            }
        }


        Console.WriteLine($"[DEBUG] fixing weekends");
        // fix weekends
        FixWeekends1and2(pgy1s, pgy2s);

        return true; // all shifts were assigned correctly
    }

    // swap 2 residents work days (avoid back to back long calls)
    public static void SwapWorkDays1(PGY1 res1, PGY1 res2, DateTime day1, DateTime day2)
    {
        res1.removeWorkDay(day1);
        res2.removeWorkDay(day2);

        res1.addWorkDay(day2);
        res2.addWorkDay(day1);
    }

    public static void SwapWorkDays12(PGY1 res1, PGY2 res2, DateTime day1, DateTime day2)
    {
        res1.removeWorkDay(day1);
        res2.removeWorkDay(day2);

        res1.addWorkDay(day2);
        res2.addWorkDay(day1);
    }
    
    
    // swap 2 residents work days (avoid back to back long calls)
    public static void SwapWorkDays2(PGY2 res1, PGY2 res2, DateTime day1, DateTime day2)
    {
        res1.removeWorkDay(day1);
        res2.removeWorkDay(day2);

        res1.addWorkDay(day2);
        res2.addWorkDay(day1);
    }

    public static void FixWeekends1(ArrayList pgy1s) // function to fix pgy1 weekends
    {
        foreach (PGY1 res in pgy1s)
        {
            // get the first and last day the resident works
            DateTime firstDay = res.firstWorkDay();
            DateTime lastDay = res.lastWorkDay();

            // iterate through all the days
            for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
            {
                // check if the day is a conflict
                if (res.isWorking(curDay) && !res.canWork(curDay) && !res.commitedWorkDay(curDay))
                {
                    bool found = false;
                    foreach (PGY1 res2 in pgy1s)
                    {
                        if (res == res2) continue;
                        if (!res2.canWork(curDay)) continue;

                        // Iterate through all the days for resident 2
                        DateTime firstDay2 = res2.firstWorkDay();
                        DateTime lastDay2 = res2.lastWorkDay();

                        for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                        {
                            if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay) && !res2.commitedWorkDay(otherDay))
                            {
                                found = true;
                                SwapWorkDays1(res, res2, curDay, otherDay);
                                break;
                            }
                        }

                        if (found)
                        {
                            break;
                        }
                    }
                    if (!found)
                    {
                        Console.WriteLine("Unable to fix weekends for pgy1 :[");
                    }
                }
            }
        }
    }


    public static void FixWeekends1and2(ArrayList pgy1s, ArrayList pgy2s) // function to fix resident weekends
    {
        foreach (PGY1 res in pgy1s)
        {
            // get the first and last day the resident works
            DateTime firstDay = res.firstWorkDay();
            DateTime lastDay = res.lastWorkDay();

            // iterate through all the days
            for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
            {
                // check if the day is a conflict
                if (res.isWorking(curDay) && !res.canWork(curDay) && !res.commitedWorkDay(curDay))
                {
                    bool found = false;
                    foreach (PGY1 res2 in pgy1s)
                    {
                        if (res == res2) continue;
                        if (!res2.canWork(curDay)) continue;

                        // Iterate through all the days for resident 2
                        DateTime firstDay2 = res2.firstWorkDay();
                        DateTime lastDay2 = res2.lastWorkDay();

                        for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                        {
                            if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay) && !res2.commitedWorkDay(otherDay))
                            {
                                found = true;
                                SwapWorkDays1(res, res2, curDay, otherDay);
                                break;
                            }
                        }

                        if (found)
                        {
                            break;
                        }
                    }
                    if (!found)
                    {
                        foreach (PGY2 res2 in pgy2s)
                        {
                            if (!res2.canWork(curDay)) continue;

                            // Iterate through all the days for resident 2
                            DateTime firstDay2 = res2.firstWorkDay();
                            DateTime lastDay2 = res2.lastWorkDay();

                            for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                            {
                                if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay) && !res2.commitedWorkDay(otherDay))
                                {
                                    found = true;
                                    SwapWorkDays12(res, res2, curDay, otherDay);
                                    break;
                                }
                            }

                            if (found)
                            {
                                break;
                            }
                        }
                    }
                }
            }
        }
        foreach (PGY2 res in pgy2s)
        {
            // get the first and last day the resident works
            DateTime firstDay = res.firstWorkDay();
            DateTime lastDay = res.lastWorkDay();

            // iterate through all the days
            for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
            {
                // check if the day is a conflict
                if (res.isWorking(curDay) && !res.canWork(curDay) && !res.commitedWorkDay(curDay))
                {
                    bool found = false;
                    foreach (PGY2 res2 in pgy2s)
                    {
                        if (res == res2) continue;
                        if (!res2.canWork(curDay)) continue;

                        // Iterate through all the days for resident 2
                        DateTime firstDay2 = res2.firstWorkDay();
                        DateTime lastDay2 = res2.lastWorkDay();

                        for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                        {
                            if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay) && !res2.commitedWorkDay(otherDay))
                            {
                                found = true;
                                SwapWorkDays2(res, res2, curDay, otherDay);
                                break;
                            }
                        }

                        if (found)
                        {
                            break;
                        }
                    }
                    if (!found)
                    {
                        foreach (PGY1 res2 in pgy1s)
                        {
                            if (!res2.canWork(curDay)) continue;

                            // Iterate through all the days for resident 2
                            DateTime firstDay2 = res2.firstWorkDay();
                            DateTime lastDay2 = res2.lastWorkDay();

                            for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                            {
                                if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay) && !res2.commitedWorkDay(otherDay))
                                {
                                    found = true;
                                    SwapWorkDays12(res2, res, otherDay, curDay);
                                    break;
                                }
                            }

                            if (found)
                            {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    public static int shiftType(DateTime curDate)
    {
        if (curDate.DayOfWeek == DayOfWeek.Saturday) return 24;
        if (curDate.DayOfWeek == DayOfWeek.Sunday) return 12;
        return 3;
    }

    public static void FixWeekends2(ArrayList pgy2s) // function to fix pgy2 weekens
    {

        foreach (PGY2 res in pgy2s)
        {
            // get the first and last day the resident works
            DateTime firstDay = res.firstWorkDay();
            DateTime lastDay = res.lastWorkDay();

            // iterate through all the days
            for (DateTime curDay = firstDay; curDay <= lastDay; curDay = curDay.AddDays(1))
            {
                // check if the day is a conflict
                if (res.isWorking(curDay) && !res.canWork(curDay))
                {
                    bool found = false;
                    foreach (PGY2 res2 in pgy2s)
                    {
                        if (res == res2) continue;
                        if (!res2.canWork(curDay)) continue;

                        // Iterate through all the days for resident 2
                        DateTime firstDay2 = res2.firstWorkDay();
                        DateTime lastDay2 = res2.lastWorkDay();

                        for (DateTime otherDay = firstDay2; otherDay <= lastDay2; otherDay = otherDay.AddDays(1))
                        {
                            if (res2.isWorking(otherDay) && shiftType(curDay) == shiftType(otherDay) && res.canWork(otherDay))
                            {
                                found = true;
                                SwapWorkDays2(res, res2, curDay, otherDay);
                                break;
                            }
                        }

                        if (found)
                        {
                            break;
                        }
                    }
                    if (!found)
                    {
                        Console.WriteLine("Unable to fix weekends for pgy2 :[");
                    }
                }
            }
        }
    }

    public static List<DatesDTO> GenerateDateRecords(Guid scheduleId, List<PGY1> pgy1s, List<PGY2> pgy2s, List<PGY3> pgy3s)
    {
        var dateRecords = new List<DatesDTO>();

        foreach (var res in pgy1s)
        {
            foreach (var day in res.workDaySet())
            {
                dateRecords.Add(new DatesDTO
                {
                    DateId = Guid.NewGuid(),
                    ScheduleId = scheduleId,
                    ResidentId = res.id, // Assuming `id` exists in PGY1 class and maps to the backend
                    Date = day,
                    CallType = GetCallType(day),
                    IsCommitted = true
                });
            }
        }

        foreach (var res in pgy2s)
        {
            foreach (var day in res.workDaySet())
            {
                dateRecords.Add(new DatesDTO
                {
                    DateId = Guid.NewGuid(),
                    ScheduleId = scheduleId,
                    ResidentId = res.id,
                    Date = day,
                    CallType = GetCallType(day),
                    IsCommitted = true
                });
            }
        }

        foreach (var res in pgy3s)
        {
            foreach (var day in res.workDaySet())
            {
                dateRecords.Add(new DatesDTO
                {
                    DateId = Guid.NewGuid(),
                    ScheduleId = scheduleId,
                    ResidentId = res.id,
                    Date = day,
                    CallType = GetCallType(day),
                    IsCommitted = true
                });
            }
        }

        return dateRecords;
    }

    private static string GetCallType(DateTime date)
    {
        return date.DayOfWeek switch
        {
            DayOfWeek.Saturday => "24h",
            DayOfWeek.Sunday => "12h",
            _ => "Short"
        };
    }
}


// example
/*
    
*/

// other things to consider : pgy year and where in hospital they work 
// month by month, positions in hospital change. which means that we will probably have to schedule month by month (at least in the back end)
