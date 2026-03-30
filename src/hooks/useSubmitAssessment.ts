import { useMutation } from '@tanstack/react-query';
import { submitAssessment } from '../api/submit';

export const useSubmitAssessment = () => useMutation({ mutationFn: submitAssessment });
