public class VacationWithResidentDto
{
    public Guid VacationId { get; set; }
    public string ResidentId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime Date { get; set; }
    public string Reason { get; set; }
    public string Status { get; set; }
    public string? Details { get; set; }
    public string GroupId { get; set; } = string.Empty;
}
