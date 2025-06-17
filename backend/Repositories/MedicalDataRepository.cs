using MedicalDemo.Data.Models;
using Microsoft.EntityFrameworkCore;

public class MedicalDataRepository : IMedicalRepository
{
	private readonly MedicalContext _context;
    //global variable(s)
    private List<Admins> _admins;

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

}
