import { useState } from 'react';
import { AlertsPanel, PatientTable, SubmissionPanel } from './components'
import { useAllPatients, usePatientRiskAnalysis } from './hooks';
import {  PAGE_SIZE } from './lib/constants';
import './App.css';

const App = () => {
  const [page, setPage] = useState(1);
  const {
    data: allPatients,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAllPatients();
  const riskAnalysis = usePatientRiskAnalysis();
  const totalPatients = allPatients?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPatients / PAGE_SIZE));
  const pagePatients = allPatients?.slice(
    (page - 1) * PAGE_SIZE, page * PAGE_SIZE
  ) ?? [];

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>Patient Records</h1>
        {isFetching && !isLoading && <span className='fetching-badge'>Updating...</span>}
      </header>
      <AlertsPanel
        alerts={riskAnalysis.submissionPayload}
        loading={riskAnalysis.isLoading}
        error={riskAnalysis.error}
      />
      <main>
        {isLoading && <div className='state-message'>Loading patients...</div>}
        {isError && (
          <div className='state-message error'>
            <p>{error.message}</p>
            <button onClick={() => refetch()}>Retry</button>
          </div>
        )}
        {allPatients && (
          <PatientTable
            patients={pagePatients}
            page={page}
            totalPages={totalPages}
            totalPatients={totalPatients}
            onPageChange={setPage}
          />
        )}
      </main>
      <SubmissionPanel
        payload={riskAnalysis.submissionPayload}
        loading={riskAnalysis.isLoading}
      />
    </div>
  );
}

export default App
