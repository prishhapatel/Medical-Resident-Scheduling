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

        public static HospitalRole Inpatient => new(true, true, false, false);
        public static HospitalRole Geriatric => new(true, true, false, false);
        public static HospitalRole PHPandIOP => new(true, true, false, false);
        public static HospitalRole PsychConsults => new(true, true, false, false);
        public static HospitalRole CommP => new(false, true, false, false);
        public static HospitalRole CAP => new(false, true, false, false);
        public static HospitalRole Addiction => new(false, true, false, false);
        public static HospitalRole Forensic => new(false, true, false, false);
        public static HospitalRole Float => new(false, true, false, false);
        public static HospitalRole Neurology => new(false, true, true, false);
        public static HospitalRole IMOutpatient => new(false, true, true, false);
        public static HospitalRole IMInpatient => new(false, false, false, true);
        public static HospitalRole NightFloat => new(false, false, false, false);
        public static HospitalRole EmergencyMed => new(false, false, false, true);
    }
}