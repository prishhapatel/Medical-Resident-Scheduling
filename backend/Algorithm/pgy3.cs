
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Collections;

public class PGY3
{
    // name, vacation, hours DO THEY HAVE HOSPITAL ROLES?
    public string name; // public to be accessible outside the class
    public string id;
    private HashSet<DateTime> vacationRequests;
    private HashSet<DateTime> allWorkDates; // every single day they are supposed to work

    int hoursWorked6months;
    int hoursWorkedTotal;
    public PGY3(string name)
    {
        this.name = name;
        vacationRequests = new HashSet<DateTime>();
        allWorkDates = new HashSet<DateTime>(); // initialize the hashset
        hoursWorked6months = 0; hoursWorkedTotal = 0;
    }


    // check if the pgy1 is requesting vacation on curDay
    public bool isVacation(DateTime curDay)
    {
        return vacationRequests.Contains(curDay);
    }

    // add a vacation request
    public void requestVacation(DateTime curDay)
    {
        if (isVacation(curDay))
        {
            Console.WriteLine("warning: you already requested vacation for this day.");
            return;
        }
        vacationRequests.Add(curDay);
    }

    // return if the pgy1 is working on curDay
    public bool isWorking(DateTime curDay)
    {
        return allWorkDates.Contains(curDay);
    }

    public void removeWorkDay(DateTime curDay)
    {
        allWorkDates.Remove(curDay);
    }
    
    public bool addWorkDay(DateTime curDay)
    {
        if (allWorkDates.Contains(curDay))
        {
            Console.WriteLine("error: the resident already works this day?");
            return false;
        }
        allWorkDates.Add(curDay);
        return true;
    }

    // return true if the pgy1 can work on curDay
    public bool canWork(DateTime curDay)
    {
        // check if the PGY1 is in training and not on vacation
        if (isVacation(curDay))
        {
            return false;
        }

        // check if curday is long call (saturday/sunday)
        if (curDay.DayOfWeek == DayOfWeek.Saturday || curDay.DayOfWeek == DayOfWeek.Sunday)
        {
            // check that we don't work consecutive weekend days
            DateTime previousDay = curDay.AddDays(-1);
            DateTime nextDay = curDay.AddDays(1);
            if (isWorking(previousDay) || isWorking(nextDay))
            {
                return false;
            }
        }

        // check for short call (any weekday)
        if (curDay.DayOfWeek == DayOfWeek.Monday || curDay.DayOfWeek == DayOfWeek.Tuesday ||
            curDay.DayOfWeek == DayOfWeek.Wednesday || curDay.DayOfWeek == DayOfWeek.Thursday ||
            curDay.DayOfWeek == DayOfWeek.Friday)
        {
            // check that we don't work consecutive to a weekend (long call)
            DateTime previousDay = curDay.AddDays(-1);
            DateTime nextDay = curDay.AddDays(1);
            if (isWorking(nextDay) && nextDay.DayOfWeek == DayOfWeek.Saturday)
            {
                return false;
            }
            if (isWorking(previousDay) && previousDay.DayOfWeek == DayOfWeek.Sunday)
            {
                return false;
            }
        }

        // we can work that day
        return true;
    }
    
    public DateTime lastWorkDay()
    {
        // check if the hashset of allworkdays is empty
        if (allWorkDates.Count == 0)
        {
            return new DateTime(1,1,1); // or throw an exception
        }
        
        DateTime ret = new DateTime(1, 1, 1); // initialize to a far past date
        foreach (DateTime cur in allWorkDates)
        {
            if (ret < cur)
            {
                ret = cur;
            }
        }
        return ret;
    }
    public DateTime firstWorkDay()
    {
        // check if the hashset of allworkdays is empty
        if (allWorkDates.Count == 0)
        {
            return new DateTime(2,2,2); // or throw an exception
        }
        DateTime ret = new DateTime(9999, 12, 31); // initialize to a far future date
        foreach (DateTime cur in allWorkDates)
        {
            if (ret > cur)
            {
                ret = cur;
            }
        }
        return ret;
    }
    public HashSet<DateTime> workDaySet()
    {
        // return a copy of the work days
        return new HashSet<DateTime>(allWorkDates);
    }

    public void saveWorkDays()
    {
        Console.WriteLine("SAVE WORK DAYS NOT IMPLEMENTED");
    }
}