import { useSubmitAssessment } from '../hooks'
import type { SubmissionPayload } from '../lib/scoring'
import type { SubmissionResponse } from '../api/submit'

const PayloadPreview = ({ payload }: { payload: SubmissionPayload }) => {
  const rows: { label: string; key: keyof SubmissionPayload; variant: string }[] = [
    { label: 'High Risk Patients', key: 'high_risk_patients', variant: 'danger'},
    { label: 'Fever Patients', key: 'fever_patients', variant: 'warning'},
    { label: 'Data Quality Issue Patients', key: 'data_quality_issues', variant: 'info'},
  ];
  return (
    <div className='payload-preview'>
      {rows.map(({ label, key, variant }) => (
        <div key={key} className={`payload-row payload-row--${variant}`}>
          <div className='payload-row__label'>
            <code>{label}</code>
            <span className='payload-row__count'>{payload[key].length}</span>
          </div>
          <div className='payload-row__ids'>
            {payload[key].length === 0 ? (
              <span className='payload-row__empty'>[]</span>
            ): (
              payload[key].map((id) => <span key={id} className='payload-id'>{id}</span>)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const SubmissionResult = ({ result }: { result: SubmissionResponse }) => {
  const { results } = result;
  const isPassing = results.status === 'PASS';
  return (
    <div className={`submission-result ${isPassing ? 'submission-result--pass' : 'submission-result--fail'}`}>
      <div className='submission-result__header'>
        <div className='submission-result__score'>
          <span className='submission-result__pct'>{results.percentage}%</span>
          <span className={`submission-result__status ${isPassing ? 'status--pass' : 'status--fail'}`}>
            {results.status}
          </span>
        </div>
        <div className='submission-result__meta'>
          <span>Attempt {results.attempt_number}</span>
          <span>
            {results.remaining_attempts} attempt{results.remaining_attempts === 1 ? 's': ''} remaining
          </span>
        </div>
      </div>
      <table className='breakdown-table'>
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th>Correct</th>
            <th>Submitted</th>
            <th>Matches</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ['High Risk', results.breakdown.high_risk],
              ['Fever', results.breakdown.fever],
              ['Data Quality', results.breakdown.data_quality],
            ] as const
          ).map(([label, cat]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{cat.score} / {cat.max}</td>
              <td>{cat.correct}</td>
              <td>{cat.submitted}</td>
              <td>{cat.matches}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SubmissionPanel = ({
  payload,
  loading: analysisLoading,
}: {
  payload: SubmissionPayload;
  loading: boolean;
}) => {
  const {
    mutate,
    isPending,
    isSuccess,
    isError,
    error,
    data,
  } = useSubmitAssessment();
  const totalItems =
    payload.high_risk_patients.length +
    payload.fever_patients.length +
    payload.data_quality_issues.length
  return (
    <section className='submission-panel'>
      <div className='submission-panel__header'>
        <h2>Submit Assessment</h2>
        <p className='submission-panel__note'>
          Review payload before submitting.
        </p>
      </div>
      {analysisLoading ? (
        <p className='state-message'>Loading patient data...</p>
      ): (
        <PayloadPreview payload={payload} />
      )}
      <div className='submission-panel__actions'>
        <button
          className='submit-btn'
          disabled={isPending || analysisLoading || totalItems === 0}
          onClick={() => mutate(payload)}
        >
          {isPending ? 'Submitting...' : 'Submit Assessment'}
        </button>
        {isError && (
          <p className='submit-error'>{(error as Error).message}</p>
        )}
      </div>
      {isSuccess && data && <SubmissionResult result={data} />}
    </section>
  );
};
