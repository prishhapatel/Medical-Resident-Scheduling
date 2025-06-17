using MedicalDemo.Data.Models;

public interface IMedicalRepository
{
    Task<List<Admins>> GetAllAdminsAsync();

}