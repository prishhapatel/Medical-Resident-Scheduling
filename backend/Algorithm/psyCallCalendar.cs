using System.Collections;
using System.Globalization;

namespace MedicalDemo.Algorithm;

public class PSYCallCalendar
{
    // default constructor
    public PSYCallCalendar() {}

    // constructor that takes in a year
    public PSYCallCalendar(int year) //constructor
    {

    }

    //determine year
    //determine what the first day of the first month is
    //if july1 then training schedule
    //store what type each day is
    //what days are saturday, sunday, or weekdays 
}

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

        Calendar calendar = new GregorianCalendar();
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



/* public class CalendarExample
    {
        public static void Main(string[] args)
        {
            // Get the current date and time
            DateTime currentDate = DateTime.Now;

            // Display the date and time
            Console.WriteLine("Current Date and Time: " + currentDate);

            // Get the current year
            int currentYear = currentDate.Year;
            Console.WriteLine("Current Year: " + currentYear);

            // Get the current month
            int currentMonth = currentDate.Month;
            Console.WriteLine("Current Month: " + currentMonth);

            // Get the current day of the week
            DayOfWeek currentDayOfWeek = currentDate.DayOfWeek;
            Console.WriteLine("Current Day of the Week: " + currentDayOfWeek);

            // Create a DateTime object for a specific date
            DateTime specificDate = new DateTime(2025, 3, 22);

            // Display the specific date
            Console.WriteLine("Specific Date: " + specificDate);

            // Get the day of the week for the specific date
            DayOfWeek specificDayOfWeek = specificDate.DayOfWeek;
            Console.WriteLine("Day of the Week for Specific Date: " + specificDayOfWeek);

            // Get the calendar instance for the Gregorian calendar
            Calendar gregorianCalendar = CultureInfo.InvariantCulture.Calendar;

            // Get the era for the specific date
            int era = gregorianCalendar.GetEra(specificDate);
            Console.WriteLine("Era for Specific Date: " + era);
        }
    }
*/