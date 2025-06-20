using MedicalDemo.Data.Models;

//connector functions
public interface IMedicalRepository
{
    Task<List<Admins>> GetAllAdminsAsync();

    Task<List<Residents>> GetAllResidentsAsync();

    Task<List<Rotations>> GetAllRotationsAsync();

    Task<List<Residents>> LoadPGYOne();

    Task<List<Residents>> LoadPGYTwo();

    Task<List<Residents>> LoadPGYThree();

    Task<Dictionary<string, List<Rotations>>> GetResidentRolesByMonthAsync();

}