// Models/Calendar/TrainingCalendar.cs
using System;
using System.Collections;
using System.Globalization;

namespace MedicalDemo.Models.Calendar
{
        public class TrainingCalendar: PSYCallCalendar
        {
            public int[] dayOfWeekAmt;
            public ArrayList shortCallDaysList;
            public ArrayList saturdayCallDaysList;
            public ArrayList sundayCallDaysList;
            //public HashMap dayToShortCallIndex;

        public TrainingCalendar(int year)
        {
            // training happens in july and august!
            int trainingDays = 31 + 31; // days in july and days in august

            dayOfWeekAmt = new int[7]; // array of 7 days

            System.Globalization.Calendar calendar = new GregorianCalendar();
            DateTime currentDay = new DateTime(year, 7, 7); // second week of july of whatever year passed in

            shortCallDaysList = new ArrayList();
            saturdayCallDaysList = new ArrayList();
            sundayCallDaysList = new ArrayList();

            while(currentDay.Month < 9)
            {
                DayOfWeek dayOfWeek = calendar.GetDayOfWeek(currentDay);
                if(dayOfWeek == DayOfWeek.Tuesday || dayOfWeek == DayOfWeek.Wednesday || dayOfWeek == DayOfWeek.Thursday) // if it is tues, wed, or thurs TODODODODODODO
                {
                    // TO DO, DO NOT HARD CODE THIS^ IN CASE WE WANT MONDAY AND FRIDAY TO BE OPTIONAL
                    shortCallDaysList.Add(currentDay); 
                }
                if(dayOfWeek == DayOfWeek.Saturday)
                {
                    saturdayCallDaysList.Add(currentDay);
                }
                if(dayOfWeek == DayOfWeek.Sunday)
                {
                    sundayCallDaysList.Add(currentDay);
                }
                dayOfWeekAmt[(int)dayOfWeek]++; // amount of mon, tues, wed, etc that are available in a training period
                currentDay = currentDay.AddDays(1); // move to the next day of the week
            }
        }

        // Input: a day as an integer (0-indexed)
        // Output: DateTime for the day index
        public DateTime whatShortDayIsIt(int day) // short call training day that cooresponds with an actual calendar day
        {
            return (DateTime)(shortCallDaysList[day]); // returns a day month year
        }
       public DateTime whatSaturdayIsIt(int day) 
        {
            return (DateTime)(saturdayCallDaysList[day]); // returns a day month year
        }
        public DateTime whatSundayIsIt(int day) 
        {
            return (DateTime)(sundayCallDaysList[day]); // returns a day month year
        }
        // Input: a day as month, day, year
        // Ouput: the day as an integer (0-indexed)
        //public 

        //* DEBUGGING IF NEEDED
        public void printDayAmounts()
        {
            Console.WriteLine($"Sunday AMT is: {dayOfWeekAmt[0]}");
            Console.WriteLine($"Monday AMT is: {dayOfWeekAmt[1]}");
            Console.WriteLine($"Tuesday AMT is: {dayOfWeekAmt[2]}");
            Console.WriteLine($"Wednesday AMT is: {dayOfWeekAmt[3]}");
            Console.WriteLine($"Thursday AMT is: {dayOfWeekAmt[4]}");
            Console.WriteLine($"Friday AMT is: {dayOfWeekAmt[5]}");
            Console.WriteLine($"Saturday AMT is: {dayOfWeekAmt[6]}");
        }
        //*/

        }
}