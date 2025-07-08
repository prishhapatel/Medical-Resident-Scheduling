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
            
            // TrainingCalendar.cs
            public TrainingCalendar(int year)
            {
                dayOfWeekAmt = new int[7];
                shortCallDaysList = new ArrayList();
                saturdayCallDaysList = new ArrayList();
                sundayCallDaysList = new ArrayList();

                // Start from July 1st and find first Saturday
                DateTime startDate = new DateTime(year, 7, 1);
                DateTime currentDay = startDate;
                while (currentDay.Month == 7 && currentDay.DayOfWeek != DayOfWeek.Saturday)
                {
                    currentDay = currentDay.AddDays(1);
                }

                // Process through August
                while (currentDay.Month < 9)
                {
                    DayOfWeek dayOfWeek = currentDay.DayOfWeek;
                    if (dayOfWeek == DayOfWeek.Tuesday || 
                        dayOfWeek == DayOfWeek.Wednesday || 
                        dayOfWeek == DayOfWeek.Thursday)
                    {
                        shortCallDaysList.Add(currentDay);
                    }
                    else if (dayOfWeek == DayOfWeek.Saturday)
                    {
                        saturdayCallDaysList.Add(currentDay);
                    }
                    else if (dayOfWeek == DayOfWeek.Sunday)
                    {
                        sundayCallDaysList.Add(currentDay);
                    }
        
                    dayOfWeekAmt[(int)dayOfWeek]++;
                    currentDay = currentDay.AddDays(1);
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