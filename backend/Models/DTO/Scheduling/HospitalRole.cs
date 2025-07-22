namespace MedicalDemo.Models
{
    public class HospitalRole
    {
        public string name { get; set; }
        public bool DoesShort { get; }
        public bool DoesLong { get; }
        public bool FlexShort { get; }
        public bool FlexLong { get; }

        private HospitalRole(string name, bool doesShort, bool doesLong, bool flexShort, bool flexLong)
        {
            name = name;
            DoesShort = doesShort;
            DoesLong = doesLong;
            FlexShort = flexShort;
            FlexLong = flexLong;
        }

        public static HospitalRole Inpatient => new("Inpatient", true, true, false, false);
        public static HospitalRole Geriatric => new("Geriatric", true, true, false, false);
        public static HospitalRole PHPandIOP => new("PHPandIOP", true, true, false, false);
        public static HospitalRole PsychConsults => new("PsychConsults", true, true, false, false);
        public static HospitalRole CommP => new("CommP", false, true, false, false);
        public static HospitalRole CAP => new("CAP", false, true, false, false);
        public static HospitalRole Addiction => new("Addiction", false, true, false, false);
        public static HospitalRole Forensic => new("Forensic",false, true, false, false);
        public static HospitalRole Float => new("Float",false, true, false, false);
        public static HospitalRole Neurology => new("Neurology",false, true, true, false);
        public static HospitalRole IMOutpatient => new("IMOutpatient",false, true, true, false);
        public static HospitalRole IMInpatient => new("IMInpatient",false, false, false, true);
        public static HospitalRole NightFloat => new("NightFloat",false, false, false, false);
        public static HospitalRole EmergencyMed => new("EmergencyMed",false, false, false, true);
        
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
}