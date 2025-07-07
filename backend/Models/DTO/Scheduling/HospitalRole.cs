namespace MedicalDemo.Models
{
    public class HospitalRole
    {
        public bool DoesShort { get; }
        public bool DoesLong { get; }
        public bool FlexShort { get; }
        public bool FlexLong { get; }

        private HospitalRole(bool doesShort, bool doesLong, bool flexShort, bool flexLong)
        {
            DoesShort = doesShort;
            DoesLong = doesLong;
            FlexShort = flexShort;
            FlexLong = flexLong;
        }

        public static readonly HospitalRole Inpatient = new(true, true, false, false);
        public static readonly HospitalRole Geriatric = new(true, true, false, false);
        public static readonly HospitalRole PHPandIOP = new(true, true, false, false);
        public static readonly HospitalRole PsychConsults = new(true, true, false, false);
        public static readonly HospitalRole CommP = new(false, true, false, false);
        public static readonly HospitalRole CAP = new(false, true, false, false);
        public static readonly HospitalRole Addiction = new(false, true, false, false);
        public static readonly HospitalRole Forensic = new(false, true, false, false);
        public static readonly HospitalRole Float = new(false, true, false, false);
        public static readonly HospitalRole Neurology = new(false, true, true, false);
        public static readonly HospitalRole IMOutpatient = new(false, true, true, false);
        public static readonly HospitalRole IMInpatient = new(false, false, false, true);
        public static readonly HospitalRole NightFloat = new(false, false, false, false);
        public static readonly HospitalRole EmergencyMed = new(false, false, false, true);
    }
}