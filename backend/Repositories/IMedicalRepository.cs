using MedicalDemo.Data.Models;

//connector functions
public interface IMedicalRepository
{
    Task<List<Admins>> GetAllAdminsAsync();

    Task<List<Residents>> GetAllResidentsAsync();

    Task<List<Rotations>> GetAllRotationsAsync();



}