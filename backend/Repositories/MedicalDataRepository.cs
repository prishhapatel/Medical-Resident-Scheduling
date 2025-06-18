using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;

public class MedicalDataRepository : IMedicalRepository
{
    private readonly MedicalContext _context;
    //global variable(s)
    private List<Admins> _admins;
    private List<Residents> _residents;
    private List<Rotations> _rotations;

    private List<PGY> _pgy1;


    public MedicalDataRepository(MedicalContext contextFactory)
    {
        _context = contextFactory;
    }

    public async Task<List<Admins>> GetAllAdminsAsync()
    {
        if (_admins == null)
        {
            _admins = await _context.admins.ToListAsync();
        }

        return _admins;
    }

    public async Task<List<Residents>> GetAllResidentsAsync()
    {
        if (_residents == null)
        {
            _residents = await _context.residents.ToListAsync();
        }

        return _residents;
    }

    public async Task<List<Rotations>> GetAllRotationsAsync()
    {
        if (_rotations == null)
        {
            _rotations = await _context.rotations.ToListAsync();
        }

        return _rotations;
    }








    //public async Task<List<Residents>> GetSortedSchedAsync()
    //{


    //}




}
