//
//
//
//

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Collections;
using System.Collections.Generic;
using System.Linq; //for array min/max


class Scheduler
{

        public static void Main()
    {
        int year = 2025;
        Training(2025);
    }

    // TODO: for testing part 1 and 2 of normal schedule (should be replaced with database look ups)
    static ArrayList old_pgy1 = null;
    static ArrayList old_pgy2 = null;

    // inputs
    static PGY1 LoadPGY1(int id)
    {
        // TODO: remove this when integrating, obviously
        if (old_pgy1 != null) return (PGY1)old_pgy1[id];

        // get name, role, vacation days 
        if (id == 0)
        {
            PGY1 resident = new PGY1("Samantha Berner-Cronin");
            resident.rolePerMonth[0] = HospitalRole.EmergencyMed; // july they are psych consult
            resident.rolePerMonth[1] = HospitalRole.Neurology; // august they are inpatient psych
            return resident;
        }
        if (id == 1)
        {
            PGY1 resident = new PGY1("Carolyn Lara Coles");
            resident.rolePerMonth[0] = HospitalRole.Inpatient;
            resident.rolePerMonth[1] = HospitalRole.Inpatient;
            return resident;
        }
        if (id == 2)
        {
            PGY1 resident = new PGY1("Ninoshka Rosalyn Hidalgo Martinez");
            resident.rolePerMonth[0] = HospitalRole.Inpatient;
            resident.rolePerMonth[1] = HospitalRole.PsychConsults;
            return resident;
        }
        if (id == 3)
        {
            PGY1 resident = new PGY1("Cody James Holland");
            resident.rolePerMonth[0] = HospitalRole.Inpatient;
            resident.rolePerMonth[1] = HospitalRole.Inpatient;
            return resident;
        }
        if (id == 4)
        {
            PGY1 resident = new PGY1("Lawrence Chun To Ku");
            resident.rolePerMonth[0] = HospitalRole.Neurology;
            resident.rolePerMonth[1] = HospitalRole.IMOutpatient;
            return resident;
        }
        if (id == 5)
        {
            PGY1 resident = new PGY1("Pooja Sanat Patel");
            resident.rolePerMonth[0] = HospitalRole.IMOutpatient;
            resident.rolePerMonth[1] = HospitalRole.IMInpatient;
            return resident;
        }
        if (id == 6)
        {
            PGY1 resident = new PGY1("Roshni Patel");
            resident.rolePerMonth[0] = HospitalRole.PsychConsults;
            resident.rolePerMonth[1] = HospitalRole.Inpatient;
            return resident;
        }
        if (id == 7)
        {
            PGY1 resident = new PGY1("Lauren Maria Rafanan");
            resident.rolePerMonth[0] = HospitalRole.Neurology;
            resident.rolePerMonth[1] = HospitalRole.EmergencyMed;
            return resident;
        }
        return null;
    }
    static PGY2 LoadPGY2(int id)
    {
        // TODO: remove this when integrating
        if (old_pgy2 != null) return (PGY2)old_pgy2[id];

        // get name, role, vacation days 
        if (id == 0)
        {
            PGY2 resident = new PGY2("Melissa Chen");
            resident.rolePerMonth[0] = HospitalRole.Addiction; // july they are psych consult
            resident.rolePerMonth[1] = HospitalRole.CAP; // august they are inpatient psych
            return resident;
        }
        if (id == 1)
        {
            PGY2 resident = new PGY2("Malissa Descalzo");
            resident.rolePerMonth[0] = HospitalRole.NightFloat;
            resident.rolePerMonth[1] = HospitalRole.Inpatient;
            return resident;
        }
        if (id == 2)
        {
            PGY2 resident = new PGY2("Haley Danielle Gallaher");
            resident.rolePerMonth[0] = HospitalRole.Inpatient;
            resident.rolePerMonth[1] = HospitalRole.NightFloat;
            return resident;
        }
        if (id == 3)
        {
            PGY2 resident = new PGY2("Felix Adrian Hernandez Perez");
            resident.rolePerMonth[0] = HospitalRole.CAP;
            resident.rolePerMonth[1] = HospitalRole.CAP;
            return resident;
        }
        if (id == 4)
        {
            PGY2 resident = new PGY2("Haider Khan");
            resident.rolePerMonth[0] = HospitalRole.NightFloat;
            resident.rolePerMonth[1] = HospitalRole.Geriatric;
            return resident;
        }
        if (id == 5)
        {
            PGY2 resident = new PGY2("Rachel Penumudi");
            resident.rolePerMonth[0] = HospitalRole.Geriatric;
            resident.rolePerMonth[1] = HospitalRole.NightFloat;
            return resident;
        }
        if (id == 6)
        {
            PGY2 resident = new PGY2("Alexis Mitra Shahidi");
            resident.rolePerMonth[0] = HospitalRole.CommP;
            resident.rolePerMonth[1] = HospitalRole.Forensic;
            return resident;
        }
        if (id == 7)
        {
            PGY2 resident = new PGY2("Insherah Sughayer");
            resident.rolePerMonth[0] = HospitalRole.Forensic;
            resident.rolePerMonth[1] = HospitalRole.Addiction;
            return resident;
        }
        return null;
    }
    static PGY3 LoadPGY3(int id)
    {
        // get name, vacation days 
        if (id == 0)
        {
            PGY3 resident = new PGY3("Anne-Sophie Attoungbre");
            return resident;
        }
        if (id == 1)
        {
            PGY3 resident = new PGY3("Kendall Kelsey Beltran");
            return resident;
        }
        if (id == 2)
        {
            PGY3 resident = new PGY3("Hanna Castano");
            return resident;
        }
        if (id == 3)
        {
            PGY3 resident = new PGY3("Tyler Michael Halbig");
            return resident;
        }
        if (id == 4)
        {
            PGY3 resident = new PGY3("Gautam Kanakamedala");
            return resident;
        }
        if (id == 5)
        {
            PGY3 resident = new PGY3("Lekhya Kintada");
            return resident;
        }
        if (id == 6)
        {
            PGY3 resident = new PGY3("Stephany Mejias Urrutia");
            return resident;
        }
        if (id == 7)
        {
            PGY3 resident = new PGY3("Reema Shailesh Patel");
            return resident;
        }
        return null;
    }

    static void Training(int year)
    {
        int pgy1 = 8;
        int pgy2 = 8;
        int pgy3 = 8;
        ArrayList AllPgy1s = new ArrayList();
        ArrayList AllPgy2s = new ArrayList();
        ArrayList AllPgy3s = new ArrayList();
        for (int i = 0; i < pgy1; i++)
        {
            AllPgy1s.Add(LoadPGY1(i));
            AllPgy2s.Add(LoadPGY2(i));
            AllPgy3s.Add(LoadPGY3(i));
        }
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
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].doesShort == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].flexShort == false) // if their role doesnt do short calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].doesShort == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].flexShort == false)
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
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].doesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].flexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].doesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].flexLong == false)
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
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[0].doesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[0].flexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[1].doesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[1].flexLong == false)
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
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[0].doesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[0].flexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY1)(AllPgy1s[i])).rolePerMonth[1].doesLong == false && ((PGY1)(AllPgy1s[i])).rolePerMonth[1].flexLong == false)
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
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[0].doesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[0].flexLong == false) // if their role doesnt do long calls this month
                    {
                        continue; // then skip over them and dont add the edge because they cant be used
                    }
                }
                // are we in august?
                if (month == 8)
                {
                    if (((PGY2)(AllPgy2s[i])).rolePerMonth[1].doesLong == false && ((PGY2)(AllPgy2s[i])).rolePerMonth[1].flexLong == false)
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

        // TODO: remove when integrating
        old_pgy1 = pgy1s;
        old_pgy2 = pgy2s;
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

    public static void Part2(int year) // "normal" scheduling from january to june
    {
        Console.WriteLine("part 2: normal schedule (january through june)");
        int pgy1 = 8;
        int pgy2 = 8;
        ArrayList AllPgy1s = new ArrayList();
        ArrayList AllPgy2s = new ArrayList();

        for (int i = 0; i < pgy1; i++)
        {
            AllPgy1s.Add(LoadPGY1(i));
            ((PGY1)AllPgy1s[i]).inTraining = false;
        }
        for (int i = 0; i < pgy2; i++)
        {
            AllPgy2s.Add(LoadPGY2(i));
            ((PGY2)AllPgy2s[i]).inTraining = false;
        }

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
        // while (!randomAssignment(AllPgy1s, AllPgy2s, startDay, endDay, shiftTypeCount, workedDays)) ;

        // save (and commit)
        save(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
        Console.WriteLine("Part 2 completed successfully.");

        // Print
        print(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
    }

    public static void Part1(int year)
    {
        Console.WriteLine("part 1: normal schedule (july through december)");
        int pgy1 = 8;
        int pgy2 = 8;
        ArrayList AllPgy1s = new ArrayList();
        ArrayList AllPgy2s = new ArrayList();

        for (int i = 0; i < pgy1; i++)
        {
            AllPgy1s.Add(LoadPGY1(i));
            ((PGY1)AllPgy1s[i]).inTraining = false;

            // assign the training date of the pgy1s based on their last worked day
            ((PGY1)AllPgy1s[i]).lastTrainingDate = ((PGY1)AllPgy1s[i]).workDaySet().Max();
        }
        for (int i = 0; i < pgy2; i++)
        {
            AllPgy2s.Add(LoadPGY2(i));
            ((PGY2)AllPgy2s[i]).inTraining = false;
        }

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
        // while (!randomAssignment(AllPgy1s, AllPgy2s, startDay, endDay, shiftTypeCount, workedDays)) ;

        // save (and commit)
        save(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
        Console.WriteLine("Part 1 completed successfully.");

        // Print
        print(AllPgy1s, AllPgy2s, new ArrayList()); // PGY3s are not used in part 1
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
//SwapWorkDays1(res, res2, curDay, otherDay);
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
//SwapWorkDays1(res, res2, curDay, otherDay);
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
//SwapWorkDays12(res, res2, curDay, otherDay);
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
//SwapWorkDays2(res, res2, curDay, otherDay);
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
//SwapWorkDays12(res2, res, otherDay, curDay);
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
//SwapWorkDays2(res, res2, curDay, otherDay);
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
}


// example
/*
    
*/

// other things to consider : pgy year and where in hospital they work 
// month by month, positions in hospital change. which means that we will probably have to schedule month by month (at least in the back end)
