using System;
using System.Collections.Generic;

class HospitalRole
{
    public bool doesShort { get; }
    public bool doesLong { get; }
    public bool flexShort { get; } // flexible short, this role will allow exceptions to be made during trainings or anywhere else necessary
    public bool flexLong { get; } // flexible long

    private HospitalRole(bool doesShort, bool doesLong, bool flexShort, bool flexLong)
    {
        this.doesShort = doesShort;
        this.doesLong = doesLong;
        this.flexShort = flexShort;
        this.flexLong = flexLong;
    }
    public static readonly HospitalRole Inpatient = new HospitalRole(true, true, false, false);
    public static readonly HospitalRole Geriatric = new HospitalRole(true, true, false, false);
    public static readonly HospitalRole PHPandIOP = new HospitalRole(true, true, false, false);
    public static readonly HospitalRole PsychConsults = new HospitalRole(true, true, false, false);

    // come back to this bc wtf NightFloatandCL
    public static readonly HospitalRole CommP = new HospitalRole(false, true, false, false);
    public static readonly HospitalRole CAP = new HospitalRole(false, true, false, false);
    public static readonly HospitalRole Addiction = new HospitalRole(false, true, false, false);
    public static readonly HospitalRole Forensic = new HospitalRole(false, true, false, false);
    public static readonly HospitalRole Float = new HospitalRole(false, true, false, false);
    public static readonly HospitalRole Neurology = new HospitalRole(false, true, true, false);
    public static readonly HospitalRole IMOutpatient = new HospitalRole(false, true, true, false);
    public static readonly HospitalRole IMInpatient = new HospitalRole(false, false, false, true);
    public static readonly HospitalRole NightFloat = new HospitalRole(false, false, false, false); // is this really separate from night float/cl
    public static readonly HospitalRole EmergencyMed = new HospitalRole(false, false, false, true);

    public static HospitalRole random() // THIS IS PURELY FOR TESTING I NED TO REMOVE IT
    {
        int seed = (int)DateTime.Now.Ticks;
        Random rnd = new Random();
        int index = rnd.Next(0, 8);
        switch (index)
        {
            case 0:
                return Inpatient;
            case 1:
                return Geriatric;
            case 2:
                return PHPandIOP;
            case 3:
                return PsychConsults;
            case 4:
                return CommP;
            case 5:
                return CAP;
            case 6:
                return Addiction;
            case 7:
                return Forensic;
            case 8:
                return Float;
            case 9:
                return Neurology;
            case 10:
                return IMOutpatient;
            case 11:
                return IMInpatient;
            case 12:
                return NightFloat;
            case 13:
                return EmergencyMed;
            default:
                throw new ArgumentOutOfRangeException("Invalid index for HospitalRole random selection.");
        }
        
        return null;
    }
}
