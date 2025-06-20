using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;

public class MedicalDataRepository : IMedicalRepository
{
    private readonly MedicalContext _context;
    //global variable(s)
    private List<Admins> _admins;
    private List<Residents> _residents;
    private List<Rotations> _rotations;



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


    //PGY 1
    public async Task<List<Residents>> LoadPGYOne()
    {
        if(_residents == null)
        {
           _residents = await _context.residents.ToListAsync();
        }
        return _residents.Where(r => r.graduate_yr == 1).ToList();

    }

    //PGY 2
    public async Task<List<Residents>> LoadPGYTwo()
    {
        if (_residents == null)
        {
            _residents = await _context.residents.ToListAsync();
        }
        return _residents.Where(r => r.graduate_yr == 2).ToList();

    }

    //PGY 3
    public async Task<List<Residents>> LoadPGYThree()
    {
        if (_residents == null)
        {
            _residents = await _context.residents.ToListAsync();
        }
        return _residents.Where(r => r.graduate_yr == 3).ToList();

    }


    //REISDENTS ROTATIONS ByIDByMonths
    public async Task<Dictionary<string, List<Rotations>>> GetResidentRolesByMonthAsync()
    {

        if(_rotations == null) 
        {
            _rotations = await _context.rotations.ToListAsync();
        }

        return _rotations
             .OrderBy(r => r.ResidentId)
             .ThenBy(r => r.Month)
             .GroupBy(r => r.ResidentId)
             .ToDictionary(g => g.Key, g => g.ToList());
    }









}
