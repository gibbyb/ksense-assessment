import type { Patient } from '../api/patients'
import { scorePatient } from '../lib/scoring'

const RiskBadge = ({ score }: { score: number}) => {
  const level = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  return <span className={`risk-badge risk-badge--${level}`}>{score}</span>
};

export const PatientTable = ({
  patients,
  page,
  totalPages,
  totalPatients,
  onPageChange,
}: {
  patients: Patient[];
  page: number;
  totalPages: number;
  totalPatients: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <>
      <div className='table-wrapper'>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Pressure</th>
              <th>Temp</th>
              <th>Visited</th>
              <th>Diagnosis</th>
              <th>Medications</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const score = scorePatient(patient);
              return (
                <tr key={patient.patient_id}>
                  <td>{patient.patient_id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age ?? <span className='missing'>-</span>}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.blood_pressure}</td>
                  <td>{patient.temperature}</td>
                  <td>{patient.visit_date}</td>
                  <td>{patient.diagnosis}</td>
                  <td>{patient.medications}</td>
                  <td>
                    <RiskBadge score={score.totalScore} />
                    {score.hasDataIssue && (
                      <span className='data-issue-flag' title='Missing or invalid data'>!</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='pagination'>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}&nbsp;({totalPatients} total)
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
};
