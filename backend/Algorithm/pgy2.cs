
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Collections;
using MedicalDemo.Models;

public class PGY2
{
    // name, vacation, hours DO THEY HAVE HOSPITAL ROLES?
    public string name; // public to be accessible outside the class
    public string id;
    public HospitalRole[] rolePerMonth; // the PGY2's role per month
    private HashSet<DateTime> vacationRequests;
    private HashSet<DateTime> commitedWorkDays; // days that have been committed to work by some prior schedule (don't change past)
    private HashSet<DateTime> allWorkDates; // every single day they are supposed to work

    int hoursWorked6months;
    int hoursWorkedTotal;

    
    public bool inTraining { get; set; }

    public PGY2(string name)
    {
        this.name = name;
        rolePerMonth = new HospitalRole[12]; //dynamic memory allocation in c#
        vacationRequests = new HashSet<DateTime>();
        allWorkDates = new HashSet<DateTime>(); // initialize the hashset
        commitedWorkDays = new HashSet<DateTime>(); // initialize the hashset
        hoursWorked6months = 0; hoursWorkedTotal = 0;
        inTraining = true;
        commitedWorkDays = new HashSet<DateTime>();
        
        // TODO: remove this assigned random roles for testing
        for (int i = 0; i < 12; i++)
        {
            rolePerMonth[i] = HospitalRole.random();
        }
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

        // role check : check that the role allows for working this type of shift
        if (rolePerMonth[(curDay.Month + 5) % 12] == null)
        {
            Console.WriteLine("warning: you have no role assigned for this month.");
            return false;
        }

        // check if curday is long call (saturday/sunday)
        if (curDay.DayOfWeek == DayOfWeek.Saturday || curDay.DayOfWeek == DayOfWeek.Sunday)
        {
            // check if the role allows for long call
            if (!rolePerMonth[(curDay.Month + 5) % 12].DoesLong &&
                (!inTraining || !rolePerMonth[(curDay.Month + 5) % 12].FlexLong))
            {
                return false;
            }

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
            // check if the role allows for short call
            if (!rolePerMonth[(curDay.Month + 5) % 12].DoesShort &&
                (!inTraining || !rolePerMonth[(curDay.Month + 5) % 12].FlexShort))
            {
                return false;
            }

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
            return new DateTime(2, 2, 2); // or throw an exception
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

    public bool commitedWorkDay(DateTime curDay)
    {
        // TODO: when integrating consider database look up
        // check if this day has been committed to work by some prior schedule
        if (commitedWorkDays.Contains(curDay))
        {
            return true;
        }

        return false;
    }

    public void saveWorkDays()
    {
        foreach (DateTime curDay in allWorkDates)
        {
            // TODO: save the work day to a file or database
            // this is a placeholder for the actual implementation
            commitedWorkDays.Add(curDay);
        }
        Console.WriteLine("SAVE WORK DAYS NOT FULLY IMPLEMENTED");
    }
}