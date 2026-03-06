export interface SpectrumTypeMeta {
  pulse?: string;
  [key: string]: unknown;
}

export interface SpectrumTypeInfo {
  $SPECTYP?: string | string[];
  [key: string]: unknown;
}

/**
 * Returns an experiment string based on a pulse sequence.
 * @param meta - Metadata object or pulse string.
 * @param info - Info object containing $SPECTYP.
 * @returns The experiment type string.
 */
export function getSpectrumType(
  meta: SpectrumTypeMeta | string | null = {},
  info: SpectrumTypeInfo = {},
): string {
  if (meta === null) meta = {};
  if (typeof meta === 'string') {
    meta = { pulse: meta };
  }

  let spectyp: string;
  if (Array.isArray(info.$SPECTYP)) {
    spectyp = (info.$SPECTYP[0] || '')
      .replace(/^<(?<content>.*)>$/, '$1')
      .toLowerCase();
  } else {
    spectyp = (info.$SPECTYP || '')
      .replace(/^<(?<content>.*)>$/, '$1')
      .toLowerCase();
  }

  if (spectyp) return spectyp;

  const pulse = meta.pulse;
  if (typeof pulse !== 'string') {
    return '';
  }

  const lowerPulse = pulse.toLowerCase();
  if (lowerPulse.includes('zg')) {
    return '1d';
  }

  if (
    lowerPulse.includes('hsqct') ||
    (lowerPulse.includes('invi') &&
      (lowerPulse.includes('ml') || lowerPulse.includes('di')))
  ) {
    return 'hsqctocsy';
  }

  if (lowerPulse.includes('hsqc') || lowerPulse.includes('invi')) {
    return 'hsqc';
  }

  if (
    lowerPulse.includes('hmbc') ||
    (lowerPulse.includes('inv4') && lowerPulse.includes('lp'))
  ) {
    return 'hmbc';
  }

  if (lowerPulse.includes('cosy')) {
    return 'cosy';
  }

  if (lowerPulse.includes('jres')) {
    return 'jres';
  }

  if (
    lowerPulse.includes('tocsy') ||
    lowerPulse.includes('mlev') ||
    lowerPulse.includes('dipsi')
  ) {
    return 'tocsy';
  }

  if (lowerPulse.includes('noesy')) {
    return 'noesy';
  }

  if (lowerPulse.includes('roesy')) {
    return 'roesy';
  }

  if (lowerPulse.includes('dept')) {
    return 'dept';
  }

  if (lowerPulse.includes('jmod') || lowerPulse.includes('apt')) {
    return 'aptjmod';
  }

  return '';
}
