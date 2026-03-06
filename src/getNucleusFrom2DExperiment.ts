/**
 * Returns a list of likely nuclei based on an experiment string.
 * This is really a hypothesis and should not be used as ground truth.
 * @param experiment - The experiment type string.
 * @returns An array of nucleus strings.
 */
export function getNucleusFrom2DExperiment(
  experiment: string | undefined,
): string[] {
  if (typeof experiment !== 'string') {
    return [];
  }
  const lowerExperiment = experiment.toLowerCase();
  if (lowerExperiment.includes('jres')) {
    return ['1H'];
  }
  if (lowerExperiment.includes('hmbc') || lowerExperiment.includes('hsqc')) {
    return ['1H', '13C'];
  }
  return ['1H', '1H'];
}
