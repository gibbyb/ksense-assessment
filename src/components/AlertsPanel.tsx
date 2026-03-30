import type { SubmissionPayload } from '../lib/scoring';

const AlertCard = ({
  title,
  ids,
  variant,
  loading,
  error,
}: {
  title: string;
  ids: string[];
  variant: 'danger' | 'warning' | 'info';
  loading: boolean;
  error?: Error | null;
}) => {
  return (
    <div className={`alert-card alert-card--${variant}`}>
      <div className='alert-card__header'>
        <span className='alert-card__title'>{title}</span>
        {!loading && !error && <span className='alert-card__count'>{ids.length}</span>}
      </div>
      { loading ? (
        <p className='alert-card__empty'>Loading...</p>
      ): error ? (
        <p className="alert-card__empty alert-card__empty--error">{error.message}</p>
      ): ids.length === 0 ? (
        <p className='alert-card__empty'>None</p>
      ): (
        <ul className='alert-cards__list'>
          {ids.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const AlertsPanel = ({
  alerts,
  loading,
  error,
}: {
  alerts: SubmissionPayload;
  loading: boolean;
  error?: Error | null;
}) => {
  return (
    <div className='alerts-panel'>
      <AlertCard
        title='High Risk Patients (score >= 4)'
        ids={alerts.high_risk_patients}
        variant='danger'
        loading={loading}
        error={error}
      />
      <AlertCard
        title='Fever Patients (temp >= 99.6 F)'
        ids={alerts.fever_patients}
        variant='warning'
        loading={loading}
        error={error}
      />
      <AlertCard
        title='Data Quality Issue Patients'
        ids={alerts.data_quality_issues}
        variant='info'
        loading={loading}
        error={error}
      />
    </div>
  );
};
